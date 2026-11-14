import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DEFAULT_THEME_KEY, getThemeConfig, type SystemThemeConfig } from '../data/themes';
import {
  type AnimatedRefs,
  buildControlRoomScene,
  buildHighVoltageRoomScene,
  buildIndexScene,
  type InteractMetadata,
} from '../three/builders';
import type { BreakerTelemetry, InspectionKind, SceneKey } from '../types/substation';

interface SubstationCanvasProps {
  activeScene: SceneKey;
  inspection: InspectionKind | null;
  breakers: Record<string, BreakerTelemetry>;
  focusSignal: { seq: number; target: 'transformer' | 'reset' } | null;
  themeConfig?: SystemThemeConfig;
  onEnterScene: (scene: SceneKey) => void;
  onInspect: (item: InspectionKind | null) => void;
}

const SCENE_CAMERAS: Record<
  SceneKey,
  { eye: [number, number, number]; center: [number, number, number] }
> = {
  index: {
    eye: [-520, 190, -560],
    center: [-30, -210, -40],
  },
  zks: {
    eye: [15.63, 280, 480],
    center: [-60, -140, -100],
  },
  gys: {
    eye: [61.35, 420, 820],
    center: [50, -150, -180],
  },
};

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const SubstationCanvas: React.FC<SubstationCanvasProps> = ({
  activeScene,
  inspection,
  breakers,
  focusSignal,
  themeConfig = getThemeConfig(DEFAULT_THEME_KEY),
  onEnterScene,
  onInspect,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Refs synced from React props without tearing down WebGL context
  const callbacksRef = useRef({ onEnterScene, onInspect });
  callbacksRef.current = { onEnterScene, onInspect };

  const inspectionRef = useRef<InspectionKind | null>(inspection);
  inspectionRef.current = inspection;

  const breakersRef = useRef<Record<string, BreakerTelemetry>>(breakers);
  breakersRef.current = breakers;

  const themeConfigRef = useRef<SystemThemeConfig>(themeConfig);
  themeConfigRef.current = themeConfig;

  const sceneControllerRef = useRef<{
    loadScene: (key: SceneKey, nextTheme?: SystemThemeConfig) => void;
    flyTo: (eye: [number, number, number], center: [number, number, number]) => void;
    setTransformerIsolation: (isolated: boolean) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setClearColor(themeConfigRef.current.canvasBgNum, 1);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(themeConfigRef.current.canvasBgNum);
    scene.fog = new THREE.FogExp2(themeConfigRef.current.canvasBgNum, 0.00022);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      2,
      8000,
    );

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 40;
    controls.maxDistance = 2200;

    // 3-Point Studio / Industrial Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x9bb8d4, 0x1a1410, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 1.9);
    keyLight.position.set(-400, 600, -350);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff7733, 0.9);
    rimLight.position.set(450, 280, 420);
    scene.add(rimLight);

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    let animRefs: AnimatedRefs = {
      radarRings: [],
      flowTextures: [],
      warningRings: [],
      warningArrow: null,
      nonTransformerMeshes: [],
      originalOpacities: new WeakMap(),
      breakerArms: new Map(),
    };

    // Camera fly-to state
    let flyActive = false;
    const flyTargetEye = new THREE.Vector3(...SCENE_CAMERAS.index.eye);
    const flyTargetCenter = new THREE.Vector3(...SCENE_CAMERAS.index.center);

    controls.addEventListener('start', () => {
      flyActive = false;
    });

    const clearGroup = (grp: THREE.Group) => {
      grp.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
      while (grp.children.length > 0) {
        grp.remove(grp.children[0]);
      }
    };

    const loadScene = (key: SceneKey, nextTheme: SystemThemeConfig = themeConfigRef.current) => {
      renderer.setClearColor(nextTheme.canvasBgNum, 1);
      scene.background = new THREE.Color(nextTheme.canvasBgNum);
      scene.fog = new THREE.FogExp2(nextTheme.canvasBgNum, 0.00022);

      clearGroup(sceneGroup);
      animRefs = {
        radarRings: [],
        flowTextures: [],
        warningRings: [],
        warningArrow: null,
        nonTransformerMeshes: [],
        originalOpacities: new WeakMap(),
        breakerArms: new Map(),
      };

      const wrapper = new THREE.Scene();
      if (key === 'index') {
        buildIndexScene(wrapper, maxAnisotropy, animRefs, nextTheme);
      } else if (key === 'zks') {
        buildControlRoomScene(wrapper, maxAnisotropy, animRefs, nextTheme);
      } else {
        buildHighVoltageRoomScene(wrapper, maxAnisotropy, animRefs, nextTheme);
      }
      while (wrapper.children.length > 0) {
        sceneGroup.add(wrapper.children[0]);
      }

      const preset = SCENE_CAMERAS[key];
      camera.position.set(...preset.eye);
      controls.target.set(...preset.center);
      controls.update();
      flyActive = false;
    };

    const flyTo = (eye: [number, number, number], center: [number, number, number]) => {
      flyTargetEye.set(...eye);
      flyTargetCenter.set(...center);
      flyActive = true;
    };

    const setTransformerIsolation = (isolated: boolean) => {
      animRefs.nonTransformerMeshes.forEach((mesh) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (!m) return;
          const orig = animRefs.originalOpacities.get(m);
          if (isolated) {
            m.transparent = true;
            m.opacity = 0.04;
          } else if (orig) {
            m.transparent = orig.transparent;
            m.opacity = orig.opacity;
          }
          m.needsUpdate = true;
        });
      });
    };

    sceneControllerRef.current = { loadScene, flyTo, setTransformerIsolation };
    loadScene('index');

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for Click, Double-Click, Hover
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getInteractHit = (clientX: number, clientY: number): InteractMetadata | null => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneGroup.children, true);
      for (const hit of hits) {
        const meta = hit.object.userData?.interact as InteractMetadata | undefined;
        if (meta) return meta;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      const meta = getInteractHit(e.clientX, e.clientY);
      if (!meta) return;

      if (meta.type === 'transformer') {
        setTransformerIsolation(true);
        flyTo(
          [
            meta.focusPoint[0] + meta.flyEyeOffset[0],
            meta.focusPoint[1] + meta.flyEyeOffset[1],
            meta.focusPoint[2] + meta.flyEyeOffset[2],
          ],
          meta.focusPoint,
        );
        callbacksRef.current.onInspect({
          type: 'transformer',
          activeSlot: 0,
          order: [0, 1, 2, 3],
        });
      } else if (meta.type === 'cabinet') {
        flyTo(
          [
            meta.focusPoint[0] + meta.flyEyeOffset[0],
            meta.focusPoint[1] + meta.flyEyeOffset[1],
            meta.focusPoint[2] + meta.flyEyeOffset[2],
          ],
          meta.focusPoint,
        );
        callbacksRef.current.onInspect({ type: 'cabinet', id: meta.id, name: meta.name });
      } else if (meta.type === 'ac') {
        flyTo(
          [
            meta.focusPoint[0] + meta.flyEyeOffset[0],
            meta.focusPoint[1] + meta.flyEyeOffset[1],
            meta.focusPoint[2] + meta.flyEyeOffset[2],
          ],
          meta.focusPoint,
        );
        callbacksRef.current.onInspect({ type: 'ac', id: meta.id, name: meta.name });
      } else if (meta.type === 'breaker') {
        flyTo(
          [
            meta.focusPoint[0] + meta.flyEyeOffset[0],
            meta.focusPoint[1] + meta.flyEyeOffset[1],
            meta.focusPoint[2] + meta.flyEyeOffset[2],
          ],
          meta.focusPoint,
        );
        callbacksRef.current.onInspect({ type: 'breaker', id: meta.id, name: meta.name });
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const meta = getInteractHit(e.clientX, e.clientY);
      if (meta?.type === 'zks_room') {
        callbacksRef.current.onInspect(null);
        callbacksRef.current.onEnterScene('zks');
        return;
      }
      if (meta?.type === 'gys_room') {
        callbacksRef.current.onInspect(null);
        callbacksRef.current.onEnterScene('gys');
        return;
      }
      if (!meta) {
        // Double-click background: reset overview & clear inspection
        setTransformerIsolation(false);
        callbacksRef.current.onInspect(null);
        const preset = SCENE_CAMERAS[activeSceneRef.current];
        flyTo(preset.eye, preset.center);
      }
    };

    let lastMoveCheck = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 70) return;
      lastMoveCheck = now;
      const meta = getInteractHit(e.clientX, e.clientY);
      canvas.style.cursor = meta ? 'pointer' : 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('dblclick', onDoubleClick);
    canvas.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(container);

    // Animation loop with software-WebGL afterDraw pacing
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Rotate concentric radar rings
      animRefs.radarRings.forEach((ring) => {
        const speed = (ring.userData.rotSpeed as number) || 0.2;
        ring.rotation.z = elapsed * speed;
      });

      // Scroll UV flow textures
      animRefs.flowTextures.forEach((tex) => {
        tex.offset.x = (elapsed * 0.45) % 1;
      });

      // Warning ripple expansion + arrow bobbing
      animRefs.warningRings.forEach((rip, idx) => {
        const phase = ((elapsed * 0.6 + (rip.userData.phase as number)) % 1);
        const sc = 0.8 + phase * 0.85;
        rip.scale.set(sc, sc, 1);
        const mat = rip.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - phase) * 0.9;
        rip.rotation.z = (idx % 2 === 0 ? 1 : -1) * elapsed * 0.65;
      });
      if (animRefs.warningArrow) {
        animRefs.warningArrow.position.y = -186 + Math.sin(elapsed * 3.2) * 5;
      }

      // Breaker blade actuation
      animRefs.breakerArms.forEach((armGroup, bId) => {
        const brk = breakersRef.current[bId];
        const targetRot = brk?.isOpen ? Math.PI / 4 : 0;
        armGroup.rotation.z = THREE.MathUtils.damp(armGroup.rotation.z, targetRot, 8, delta);
      });

      // Smooth camera fly-to interpolation
      if (flyActive) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, flyTargetEye.x, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, flyTargetEye.y, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, flyTargetEye.z, 5, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, flyTargetCenter.x, 5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, flyTargetCenter.y, 5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, flyTargetCenter.z, 5, delta);

        if (
          camera.position.distanceTo(flyTargetEye) < 0.8 &&
          controls.target.distanceTo(flyTargetCenter) < 0.8
        ) {
          flyActive = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('dblclick', onDoubleClick);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      clearGroup(sceneGroup);
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  const activeSceneRef = useRef<SceneKey>(activeScene);
  activeSceneRef.current = activeScene;

  // Reload 3D scene when activeScene or themeConfig switches
  useEffect(() => {
    sceneControllerRef.current?.loadScene(activeScene, themeConfig);
  }, [activeScene, themeConfig]);

  // Update transformer isolation whenever inspection changes
  useEffect(() => {
    sceneControllerRef.current?.setTransformerIsolation(inspection?.type === 'transformer');
  }, [inspection]);

  // Handle programmatic focus signals from HUD clicks
  useEffect(() => {
    if (!focusSignal) return;
    if (focusSignal.target === 'transformer') {
      sceneControllerRef.current?.setTransformerIsolation(true);
      sceneControllerRef.current?.flyTo([-129, -135, -210], [-129, -206, -45]);
    } else if (focusSignal.target === 'reset') {
      sceneControllerRef.current?.setTransformerIsolation(false);
      const preset = SCENE_CAMERAS[activeScene];
      sceneControllerRef.current?.flyTo(preset.eye, preset.center);
    }
  }, [focusSignal, activeScene]);

  if (contextLost) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center text-white/80 text-sm">
        3D 渲染上下文已暂停，请刷新页面恢复视图。
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="substation-canvas"
      className="absolute inset-0 w-full h-full bg-black z-0"
    />
  );
};
