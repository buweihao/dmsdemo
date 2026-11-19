import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { SystemThemeConfig } from '../../data/themes';
import {
  buildElectrolyteTwinScene,
  updateElectrolyteFlowAnimation,
  type ElectrolyteAnimRefs,
} from '../../three/electrolyteTwin';
import {
  ELECTROLYTE_CAMERAS,
  getElectrolyteUnit,
  type ElectrolyteCameraPreset,
} from '../../utils/electrolyteTwinState';

interface ElectrolyteTwinCanvasProps {
  themeConfig: SystemThemeConfig;
  cameraPreset: ElectrolyteCameraPreset;
  cameraSignalSeq: number;
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
}

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

export const ElectrolyteTwinCanvas: React.FC<ElectrolyteTwinCanvasProps> = ({
  themeConfig,
  cameraPreset,
  cameraSignalSeq,
  selectedUnitId,
  onSelectUnit,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const onSelectUnitRef = useRef(onSelectUnit);
  onSelectUnitRef.current = onSelectUnit;

  const themeConfigRef = useRef(themeConfig);
  themeConfigRef.current = themeConfig;

  const selectedUnitIdRef = useRef(selectedUnitId);
  selectedUnitIdRef.current = selectedUnitId;

  const controllerRef = useRef<{
    rebuildTheme: (nextTheme: SystemThemeConfig) => void;
    flyTo: (eye: [number, number, number], target: [number, number, number]) => void;
    highlightUnit: (unitId: string | null) => void;
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
    renderer.setSize(
      container.clientWidth || 920,
      container.clientHeight || 540,
    );
    renderer.setClearColor(themeConfigRef.current.canvasBgNum, 1);

    const canvas = renderer.domElement;
    canvas.className = 'electrolyte-twin-webgl';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(themeConfigRef.current.canvasBgNum);
    scene.fog = new THREE.FogExp2(themeConfigRef.current.canvasBgNum, 0.00055);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 920) / (container.clientHeight || 540),
      2,
      3600,
    );
    const initialCam = ELECTROLYTE_CAMERAS.overview;
    camera.position.set(...initialCam.eye);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.minDistance = 80;
    controls.maxDistance = 760;
    controls.target.set(...initialCam.target);
    controls.update();

    // 3-Point Industrial Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xb2d4f5, 0x101828, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.85);
    keyLight.position.set(-220, 360, 260);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(themeConfigRef.current.accentNum, 1.05);
    rimLight.position.set(280, 190, -240);
    scene.add(rimLight);

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    let animRefs: ElectrolyteAnimRefs = {
      radarRings: [],
      impellers: [],
      positiveFlowTextures: [],
      negativeFlowTextures: [],
      positiveBeadMesh: null,
      negativeBeadMesh: null,
      positiveBeads: [],
      negativeBeads: [],
      liquidSurfaces: [],
      pulseRings: [],
      selectionRing: null,
      unitAnchorPositions: new Map(),
    };

    const disposeGroup = (grp: THREE.Group) => {
      const disposedTex = new Set<THREE.Texture>();
      grp.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : [];
        mats.forEach((mat) => {
          const anyMat = mat as THREE.MeshStandardMaterial;
          if (anyMat.map && !disposedTex.has(anyMat.map)) {
            disposedTex.add(anyMat.map);
            anyMat.map.dispose();
          }
          mat.dispose();
        });
      });
      while (grp.children.length > 0) {
        grp.remove(grp.children[0]);
      }
    };

    const applySelectionHighlight = (unitId: string | null) => {
      const ring = animRefs.selectionRing;
      if (!ring) return;
      if (!unitId) {
        ring.visible = false;
        return;
      }
      const pos = animRefs.unitAnchorPositions.get(unitId);
      if (!pos) {
        ring.visible = false;
        return;
      }
      ring.position.copy(pos);
      const scale = unitId.includes('tank') ? 1.55 : unitId.includes('pump') ? 0.9 : 0.82;
      ring.scale.set(scale, scale, 1);
      ring.visible = true;
    };

    const rebuildTheme = (nextTheme: SystemThemeConfig) => {
      renderer.setClearColor(nextTheme.canvasBgNum, 1);
      scene.background = new THREE.Color(nextTheme.canvasBgNum);
      scene.fog = new THREE.FogExp2(nextTheme.canvasBgNum, 0.00055);
      rimLight.color.setHex(nextTheme.accentNum);

      disposeGroup(sceneGroup);
      animRefs = buildElectrolyteTwinScene(sceneGroup, maxAnisotropy, nextTheme);
      applySelectionHighlight(selectedUnitIdRef.current);
    };

    // Initial scene build
    rebuildTheme(themeConfigRef.current);

    let flyActive = false;
    const flyEye = new THREE.Vector3(...initialCam.eye);
    const flyTarget = new THREE.Vector3(...initialCam.target);

    controls.addEventListener('start', () => {
      flyActive = false;
    });

    const flyTo = (eye: [number, number, number], target: [number, number, number]) => {
      flyEye.set(...eye);
      flyTarget.set(...target);
      flyActive = true;
    };

    controllerRef.current = {
      rebuildTheme,
      flyTo,
      highlightUnit: applySelectionHighlight,
    };

    // Raycasting for interactive equipment selection
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const findUnitAtEvent = (ev: PointerEvent): string | null => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneGroup.children, true);
      for (const hit of hits) {
        const unitId = hit.object.userData?.electrolyteUnitId as string | undefined;
        if (unitId) return unitId;
      }
      return null;
    };

    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 6) return;
      const unitId = findUnitAtEvent(ev);
      if (unitId) {
        onSelectUnitRef.current(unitId);
        const unit = getElectrolyteUnit(unitId);
        if (unit) {
          flyTo(unit.focusEye, unit.focusTarget);
        }
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      const unitId = findUnitAtEvent(ev);
      canvas.style.cursor = unitId ? 'pointer' : 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = container.clientWidth || 920;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(container);
    window.addEventListener('resize', onResize);

    // Paced animation loop (with software WebGL fenceSync guard)
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      elapsed += delta;

      // Rotate tech radar rings
      animRefs.radarRings.forEach((ring, idx) => {
        ring.rotation.z = elapsed * (idx % 2 === 0 ? 0.12 : -0.18);
      });

      // Spin machined pump impellers
      animRefs.impellers.forEach((imp, idx) => {
        imp.rotation.z = elapsed * (idx === 0 ? -5.6 : 5.6);
      });

      // Scroll length-normalized pipe dash textures & glide directional flow capsules along all 58 pipes
      updateElectrolyteFlowAnimation(animRefs, elapsed);

      // Subtle liquid surface breathing motion
      animRefs.liquidSurfaces.forEach((surf, idx) => {
        const baseY = Number(surf.userData.baseY ?? surf.position.y);
        surf.position.y = baseY + Math.sin(elapsed * 2.1 + idx * 1.6) * 0.55;
      });

      // Pulse tank & pump floor aura rings
      animRefs.pulseRings.forEach((ring, idx) => {
        const s = 1 + Math.sin(elapsed * 2.2 + idx) * 0.04;
        ring.scale.set(s, s, 1);
      });

      // Selection ring rotation
      if (animRefs.selectionRing && animRefs.selectionRing.visible) {
        animRefs.selectionRing.rotation.z = elapsed * 1.4;
      }

      // Smooth fly-to interpolation
      if (flyActive) {
        const dampDelta = Math.min(delta, 0.16);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, flyEye.x, 7.5, dampDelta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, flyEye.y, 7.5, dampDelta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, flyEye.z, 7.5, dampDelta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, flyTarget.x, 7.5, dampDelta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, flyTarget.y, 7.5, dampDelta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, flyTarget.z, 7.5, dampDelta);

        if (
          camera.position.distanceTo(flyEye) < 0.8 &&
          controls.target.distanceTo(flyTarget) < 0.8
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
      controllerRef.current = null;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      disposeGroup(sceneGroup);
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  // Sync theme changes dynamically
  useEffect(() => {
    controllerRef.current?.rebuildTheme(themeConfig);
  }, [themeConfig]);

  // Sync selection highlight
  useEffect(() => {
    controllerRef.current?.highlightUnit(selectedUnitId);
  }, [selectedUnitId]);

  // Fly to camera preset whenever preset or signal sequence changes
  useEffect(() => {
    if (cameraSignalSeq === 0) return;
    const cfg = ELECTROLYTE_CAMERAS[cameraPreset];
    if (cfg) {
      controllerRef.current?.flyTo(cfg.eye, cfg.target);
    }
  }, [cameraPreset, cameraSignalSeq]);

  if (contextLost) {
    return (
      <div className="electrolyte-twin-fallback">
        3D 渲染上下文已暂停，请切换至 2D 工艺图或刷新页面恢复。
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="electrolyte-twin-canvas"
      className="electrolyte-twin-canvas"
    />
  );
};
