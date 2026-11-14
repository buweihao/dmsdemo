import * as THREE from 'three';
import roadNetworkRaw from '../data/roadNetwork.json';
import { DEFAULT_THEME_KEY, getThemeConfig, type SystemThemeConfig } from '../data/themes';
import {
  createChevronArrowTexture,
  createFlowGradientTexture,
  createHexGridTexture,
  createRadarRingTexture,
  createRoomMarkerTexture,
  createSignLabelTexture,
  createWarningRippleTexture,
} from './textures';

interface RoadPoint {
  x: number;
  y: number;
}

interface RoadDataEntry {
  name: string | null;
  e: number;
  points: RoadPoint[];
  segments: number[];
}

const roadData = roadNetworkRaw as Record<string, RoadDataEntry>;

export interface InteractMetadata {
  type: 'transformer' | 'zks_room' | 'gys_room' | 'cabinet' | 'ac' | 'breaker';
  id: string;
  name: string;
  focusPoint: [number, number, number];
  flyEyeOffset: [number, number, number];
}

export interface AnimatedRefs {
  radarRings: THREE.Mesh[];
  flowTextures: THREE.CanvasTexture[];
  warningRings: THREE.Mesh[];
  warningArrow: THREE.Sprite | null;
  nonTransformerMeshes: THREE.Mesh[];
  originalOpacities: WeakMap<THREE.Material, { opacity: number; transparent: boolean }>;
  breakerArms: Map<string, THREE.Group>;
}

/**
 * Parses HT polyline segments (1=moveTo, 2=lineTo, 4=bezierCurveTo) into
 * flattened 3D line-segment pairs on the XZ plane at height `yElevation`.
 */
function buildPolylineSegments(
  points: RoadPoint[],
  segments: number[],
  yElevation: number,
): THREE.BufferGeometry {
  const vertices: number[] = [];
  let pIdx = 0;
  let curX = 0;
  let curZ = 0;

  const pushSeg = (x1: number, z1: number, x2: number, z2: number) => {
    vertices.push(x1, yElevation, z1, x2, yElevation, z2);
  };

  for (let sIdx = 0; sIdx < segments.length; sIdx++) {
    const seg = segments[sIdx];
    if (seg === 1 && pIdx < points.length) {
      curX = points[pIdx].x;
      curZ = points[pIdx].y;
      pIdx += 1;
    } else if (seg === 2 && pIdx < points.length) {
      const nx = points[pIdx].x;
      const nz = points[pIdx].y;
      pushSeg(curX, curZ, nx, nz);
      curX = nx;
      curZ = nz;
      pIdx += 1;
    } else if (seg === 4 && pIdx + 2 < points.length) {
      const cp1 = points[pIdx];
      const cp2 = points[pIdx + 1];
      const end = points[pIdx + 2];
      const steps = 6;
      let prevX = curX;
      let prevZ = curZ;
      for (let tStep = 1; tStep <= steps; tStep++) {
        const t = tStep / steps;
        const it = 1 - t;
        const bx =
          it * it * it * curX +
          3 * it * it * t * cp1.x +
          3 * it * t * t * cp2.x +
          t * t * t * end.x;
        const bz =
          it * it * it * curZ +
          3 * it * it * t * cp1.y +
          3 * it * t * t * cp2.y +
          t * t * t * end.y;
        pushSeg(prevX, prevZ, bx, bz);
        prevX = bx;
        prevZ = bz;
      }
      curX = end.x;
      curZ = end.y;
      pIdx += 3;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geo;
}

function tagNonTransformer(obj: THREE.Object3D, refs: AnimatedRefs) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      refs.nonTransformerMeshes.push(mesh);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m && !refs.originalOpacities.has(m)) {
          refs.originalOpacities.set(m, {
            opacity: m.opacity,
            transparent: m.transparent,
          });
        }
      });
    }
  });
}

function setInteract(obj: THREE.Object3D, meta: InteractMetadata) {
  obj.userData.interact = meta;
  obj.traverse((child) => {
    child.userData.interact = meta;
  });
}

/**
 * Builds a realistic multi-part 3D power transformer (radiator banks, HV/LV porcelain
 * bushings, cylindrical oil conservator tank, cooling fans, concrete plinth).
 */
function buildPowerTransformer(id: string, accentNum = 0x65d8f4): THREE.Group {
  const group = new THREE.Group();
  group.name = id;

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x3b4048,
    roughness: 0.85,
    metalness: 0.1,
  });
  const tankMat = new THREE.MeshStandardMaterial({
    color: 0x62707d,
    roughness: 0.42,
    metalness: 0.65,
  });
  const radiatorMat = new THREE.MeshStandardMaterial({
    color: 0x454f59,
    roughness: 0.5,
    metalness: 0.72,
  });
  const porcelainMat = new THREE.MeshStandardMaterial({
    color: 0xb96a48,
    roughness: 0.28,
    metalness: 0.15,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentNum,
    emissive: accentNum,
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.4,
  });

  // 1. Concrete foundation plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(58, 5, 42), plinthMat);
  plinth.position.y = 2.5;
  group.add(plinth);

  // 2. Main steel oil tank body
  const tank = new THREE.Mesh(new THREE.BoxGeometry(34, 24, 24), tankMat);
  tank.position.y = 17;
  group.add(tank);

  // 3. Top cover plate & rim
  const lid = new THREE.Mesh(new THREE.BoxGeometry(36, 2, 26), radiatorMat);
  lid.position.y = 29.5;
  group.add(lid);

  // 4. Cylindrical oil conservator tank on top
  const conservator = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.2, 26, 16),
    tankMat,
  );
  conservator.rotation.z = Math.PI / 2;
  conservator.position.set(0, 36, -6);
  group.add(conservator);

  // 5. Radiator cooling fin banks (front & back)
  for (let side of [-1, 1]) {
    for (let i = -3; i <= 3; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 18, 5.5), radiatorMat);
      fin.position.set(i * 4.2, 17, side * 14.5);
      group.add(fin);
    }
  }

  // 6. Three HV porcelain bushings with ribbed insulators
  for (let i = -1; i <= 1; i++) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 3, 12),
      radiatorMat,
    );
    base.position.set(i * 9.5, 31.5, 5);
    group.add(base);

    const insulator = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.5, 11, 12),
      porcelainMat,
    );
    insulator.position.set(i * 9.5, 38, 5);
    group.add(insulator);

    const terminal = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 10, 10),
      accentMat,
    );
    terminal.position.set(i * 9.5, 44, 5);
    group.add(terminal);
  }

  // 7. Side control junction box with orange telemetry strip
  const ctrlBox = new THREE.Mesh(new THREE.BoxGeometry(3, 12, 10), radiatorMat);
  ctrlBox.position.set(18.5, 15, 0);
  group.add(ctrlBox);

  const strip = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 8), accentMat);
  strip.position.set(18.6, 19.5, 0);
  group.add(strip);

  return group;
}

/**
 * Builds the 01 主控室 or 02 高压室 exterior industrial building (multi-part group).
 */
function buildSubstationBuilding(
  w: number,
  h: number,
  d: number,
  accentColor: number,
): THREE.Group {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2d333d,
    roughness: 0.72,
    metalness: 0.25,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x48515e,
    roughness: 0.45,
    metalness: 0.65,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x162434,
    emissive: accentColor,
    emissiveIntensity: 0.28,
    roughness: 0.15,
    metalness: 0.85,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.85,
    roughness: 0.3,
  });

  // Base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 8, 4, d + 8), trimMat);
  plinth.position.y = 2;
  group.add(plinth);

  // Main architectural body
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = 4 + h / 2;
  group.add(body);

  // Roof parapet & HVAC units
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 3, d + 4), trimMat);
  roof.position.y = 4 + h + 1.5;
  group.add(roof);

  const hvac1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, 5, d * 0.25), trimMat);
  hvac1.position.set(-w * 0.2, 4 + h + 5.5, 0);
  group.add(hvac1);

  const hvac2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, 5, d * 0.25), trimMat);
  hvac2.position.set(w * 0.2, 4 + h + 5.5, 0);
  group.add(hvac2);

  // Illuminated window ribbon & entrance frame
  const winBand = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 7, d * 0.65), glassMat);
  winBand.position.y = 4 + h * 0.64;
  group.add(winBand);

  const roofEdgeLight = new THREE.Mesh(
    new THREE.BoxGeometry(w + 4.6, 1.2, d + 4.6),
    glowMat,
  );
  roofEdgeLight.position.y = 4 + h + 0.5;
  group.add(roofEdgeLight);

  return group;
}

function buildTransmissionTower(): THREE.Group {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x7b8591,
    roughness: 0.45,
    metalness: 0.78,
  });
  const warnMat = new THREE.MeshStandardMaterial({
    color: 0xff5816,
    emissive: 0xff5816,
    emissiveIntensity: 0.7,
  });

  // 4 tapered legs
  const legGeo = new THREE.CylinderGeometry(1.1, 1.8, 120, 6);
  const offsets: [number, number][] = [
    [-10, -10],
    [10, -10],
    [-10, 10],
    [10, 10],
  ];
  offsets.forEach(([ox, oz]) => {
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(ox * 0.6, 60, oz * 0.6);
    leg.rotation.z = ox > 0 ? 0.08 : -0.08;
    leg.rotation.x = oz > 0 ? -0.08 : 0.08;
    group.add(leg);
  });

  // Cross arms
  [78, 98, 114].forEach((y, idx) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(52 - idx * 8, 2.2, 3),
      steelMat,
    );
    arm.position.y = y;
    group.add(arm);
  });

  // Top beacon
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 10), warnMat);
  beacon.position.y = 123;
  group.add(beacon);

  return group;
}

function buildSwitchgearBay(hasBreaker = true): THREE.Group {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x5c6672,
    roughness: 0.45,
    metalness: 0.7,
  });
  const insMat = new THREE.MeshStandardMaterial({
    color: 0xc26e45,
    roughness: 0.3,
    metalness: 0.2,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 10), frameMat);
  base.position.y = 2;
  group.add(base);

  [-5, 0, 5].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 12, 8), frameMat);
    post.position.set(px, 10, 0);
    group.add(post);

    const ins = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 6, 8), insMat);
    ins.position.set(px, 19, 0);
    group.add(ins);
  });

  if (hasBreaker) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 2), frameMat);
    bar.position.y = 22.5;
    group.add(bar);
  }
  return group;
}

/**
 * Builds the entire Scene 1: 电力牵引站 (City Road Network + Radar Rings + Warning + Substation Compound).
 */
export function buildIndexScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  refs: AnimatedRefs,
  theme: SystemThemeConfig = getThemeConfig(DEFAULT_THEME_KEY),
): void {
  const hexBg = `#${theme.canvasBgNum.toString(16).padStart(6, '0')}`;
  const hexTex = createHexGridTexture(maxAnisotropy, theme.groundGridRgba, hexBg);
  const groundMat = new THREE.MeshStandardMaterial({
    map: hexTex,
    roughness: 0.85,
    metalness: 0.2,
  });
  const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(3600, 2600), groundMat);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.set(0, -255, -60);
  tagNonTransformer(groundPlane, refs);
  scene.add(groundPlane);

  // 1. Exact 1:1 City Road Network (路网 1423)
  const rNet = roadData['1423'];
  if (rNet) {
    const roadGeo = buildPolylineSegments(rNet.points, rNet.segments, rNet.e);
    const roadMat = new THREE.LineBasicMaterial({
      color: theme.roadHex,
      transparent: true,
      opacity: 0.82,
    });
    const roadLines = new THREE.LineSegments(roadGeo, roadMat);
    tagNonTransformer(roadLines, refs);
    scene.add(roadLines);
  }

  // 2. Flowing Substation Perimeter Lines (1611)
  const perim = roadData['1611'];
  if (perim) {
    const perimGeo = buildPolylineSegments(perim.points, perim.segments, -231);
    const perimMat = new THREE.LineBasicMaterial({
      color: theme.accentNum,
      transparent: true,
      opacity: 0.72,
    });
    const perimLines = new THREE.LineSegments(perimGeo, perimMat);
    tagNonTransformer(perimLines, refs);
    scene.add(perimLines);
  }

  // 3. Concentric Rotating Radar Rings (y旋转)
  const radarTex = createRadarRingTexture(maxAnisotropy, theme.accentRgb);
  [-158, -180, -218].forEach((elev, idx) => {
    const ringMat = new THREE.MeshBasicMaterial({
      map: radarTex,
      transparent: true,
      opacity: idx === 0 ? 0.85 : 0.45,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(680, 680), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-58.3, elev, -28.2);
    ring.userData.rotSpeed = (idx % 2 === 0 ? 1 : -1) * 0.22;
    refs.radarRings.push(ring);
    tagNonTransformer(ring, refs);
    scene.add(ring);
  });

  // 4. Warning Ripple & Floating Chevron Arrow
  const rippleTex = createWarningRippleTexture(maxAnisotropy, theme.accentRgb);
  for (let i = 0; i < 2; i++) {
    const ripMat = new THREE.MeshBasicMaterial({
      map: rippleTex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const rip = new THREE.Mesh(new THREE.PlaneGeometry(118, 118), ripMat);
    rip.rotation.x = -Math.PI / 2;
    rip.position.set(97, -223 - i * 2, 107.5);
    rip.userData.phase = i * 0.5;
    refs.warningRings.push(rip);
    tagNonTransformer(rip, refs);
    scene.add(rip);
  }

  const arrowTex = createChevronArrowTexture(
    maxAnisotropy,
    theme.accentHex,
    theme.accentRgb,
    theme.secondaryHex,
  );
  const arrowSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: arrowTex, transparent: true, depthTest: false }),
  );
  arrowSprite.position.set(97, -186, 107.5);
  arrowSprite.scale.set(52, 52, 1);
  refs.warningArrow = arrowSprite;
  scene.add(arrowSprite);

  // 5. Substation Compound Pad grounded cleanly on the city plane (stationY = -228)
  const stationY = -228;
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x0d1016,
    roughness: 0.85,
    metalness: 0.25,
    transparent: true,
    opacity: 0.86,
  });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(440, 4, 380), padMat);
  pad.position.set(-45, stationY - 2, -65);
  tagNonTransformer(pad, refs);
  scene.add(pad);

  // Flowing energy perimeter around substation pad
  const flowAccent = createFlowGradientTexture(theme.accentHex, maxAnisotropy);
  refs.flowTextures.push(flowAccent);
  const padBorderMat = new THREE.MeshBasicMaterial({
    map: flowAccent,
    transparent: true,
    opacity: 0.9,
  });
  const borderN = new THREE.Mesh(new THREE.BoxGeometry(444, 1.5, 2.5), padBorderMat);
  borderN.position.set(-45, stationY + 0.5, -256);
  const borderS = borderN.clone();
  borderS.position.z = 126;
  tagNonTransformer(borderN, refs);
  tagNonTransformer(borderS, refs);
  scene.add(borderN, borderS);

  // 6. 01 主控室 Building + Marker (framed clearly to left-center)
  const zksBldg = buildSubstationBuilding(112, 46, 82, theme.accentNum);
  zksBldg.position.set(95, stationY, -172);
  setInteract(zksBldg, {
    type: 'zks_room',
    id: 'zks',
    name: '主控室',
    focusPoint: [95, stationY + 24, -172],
    flyEyeOffset: [0, 80, 180],
  });
  tagNonTransformer(zksBldg, refs);
  scene.add(zksBldg);

  const zksTex = createRoomMarkerTexture('01', '主控室', maxAnisotropy, theme.accentHex, theme.accentRgb);
  const zksMarker = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: zksTex, transparent: true, depthTest: false }),
  );
  zksMarker.position.set(95, stationY + 115, -172);
  zksMarker.scale.set(125, 106, 1);
  setInteract(zksMarker, {
    type: 'zks_room',
    id: 'zks',
    name: '主控室',
    focusPoint: [95, stationY + 24, -172],
    flyEyeOffset: [0, 80, 180],
  });
  scene.add(zksMarker);

  // 7. 02 高压室 Building + Marker
  const gysBldg = buildSubstationBuilding(138, 50, 86, theme.accentNum);
  gysBldg.position.set(-73, stationY, 45);
  setInteract(gysBldg, {
    type: 'gys_room',
    id: 'gys',
    name: '高压室',
    focusPoint: [-73, stationY + 26, 45],
    flyEyeOffset: [0, 80, 180],
  });
  tagNonTransformer(gysBldg, refs);
  scene.add(gysBldg);

  const gysTex = createRoomMarkerTexture('02', '高压室', maxAnisotropy, theme.accentHex, theme.accentRgb);
  const gysMarker = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: gysTex, transparent: true, depthTest: false }),
  );
  gysMarker.position.set(-73, stationY + 120, 45);
  gysMarker.scale.set(125, 106, 1);
  setInteract(gysMarker, {
    type: 'gys_room',
    id: 'gys',
    name: '高压室',
    focusPoint: [-73, stationY + 26, 45],
    flyEyeOffset: [0, 80, 180],
  });
  scene.add(gysMarker);

  // 8. Twin Power Transformers (transformer1 & transformer2)
  const tx1 = buildPowerTransformer('transformer1', theme.accentNum);
  tx1.position.set(-77, stationY, -45);
  setInteract(tx1, {
    type: 'transformer',
    id: 'transformer1',
    name: '1#主变压器',
    focusPoint: [-129, stationY + 22, -45],
    flyEyeOffset: [0, 65, -160],
  });
  scene.add(tx1);

  const tx2 = buildPowerTransformer('transformer2', theme.accentNum);
  tx2.position.set(-181, stationY, -45);
  setInteract(tx2, {
    type: 'transformer',
    id: 'transformer2',
    name: '2#主变压器',
    focusPoint: [-129, stationY + 22, -45],
    flyEyeOffset: [0, 65, -160],
  });
  scene.add(tx2);

  // 9. Outdoor Switchgear Bays, CTs, PTs & Transmission Tower
  const yardPositions: [number, number][] = [
    [-72, -165],
    [-141, -165],
    [-210, -165],
    [-72, -198],
    [-141, -198],
    [-210, -198],
  ];
  yardPositions.forEach(([bx, bz]) => {
    const bay = buildSwitchgearBay(true);
    bay.position.set(bx, stationY, bz);
    tagNonTransformer(bay, refs);
    scene.add(bay);
  });

  const tower = buildTransmissionTower();
  tower.position.set(-127, -250, -395);
  tagNonTransformer(tower, refs);
  scene.add(tower);

  // 10. Freight Rail Track + Train Car (货车)
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x58606c, metalness: 0.7, roughness: 0.4 });
  const track = new THREE.Mesh(new THREE.BoxGeometry(260, 2, 12), trackMat);
  track.position.set(24, stationY + 1, -77);
  tagNonTransformer(track, refs);
  scene.add(track);

  const trainCar = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9b4d2e, roughness: 0.5, metalness: 0.4 });
  const carBody = new THREE.Mesh(new THREE.BoxGeometry(46, 14, 11), bodyMat);
  carBody.position.y = 9;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 11.5), trackMat);
  cab.position.set(-28, 10, 0);
  trainCar.add(carBody, cab);
  trainCar.position.set(24, stationY + 2, -77);
  tagNonTransformer(trainCar, refs);
  scene.add(trainCar);
}

/**
 * Builds Scene 2: 主控室 (Main Control Room Interior).
 */
export function buildControlRoomScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  refs: AnimatedRefs,
  theme: SystemThemeConfig = getThemeConfig(DEFAULT_THEME_KEY),
): void {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x161922,
    roughness: 0.45,
    metalness: 0.35,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(820, 8, 560), floorMat);
  floor.position.set(-60, -210, -60);
  scene.add(floor);

  // Animated floor energy conduit lines
  const flowAccent = createFlowGradientTexture(theme.accentHex, maxAnisotropy);
  refs.flowTextures.push(flowAccent);
  const conduitMat = new THREE.MeshBasicMaterial({ map: flowAccent, transparent: true });
  const conduit = new THREE.Mesh(new THREE.BoxGeometry(620, 1.5, 4), conduitMat);
  conduit.position.set(-60, -205, -60);
  scene.add(conduit);

  // Glass partition walls
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x4ca6d8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    metalness: 0.6,
  });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(780, 160, 6), glassMat);
  backWall.position.set(-60, -126, -320);
  scene.add(backWall);

  // Operator Console Desk + 3 Desktop Monitors
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x353c48, roughness: 0.5, metalness: 0.4 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(280, 28, 70), deskMat);
  desk.position.set(-80, -192, 60);
  scene.add(desk);

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    emissive: theme.accentNum,
    emissiveIntensity: 0.35,
  });
  [-190, -87, 18].forEach((mx) => {
    const mon = new THREE.Mesh(new THREE.BoxGeometry(38, 24, 3), screenMat);
    mon.position.set(mx, -162, 55);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 6), deskMat);
    stand.position.set(mx, -176, 55);
    scene.add(mon, stand);
  });

  // Protection & Relay Cabinets Row (clickable!)
  const cabBodyMat = new THREE.MeshStandardMaterial({ color: 0x2a313c, roughness: 0.45, metalness: 0.65 });
  const cabDoorMat = new THREE.MeshStandardMaterial({ color: 0x1d232c, roughness: 0.35, metalness: 0.7 });
  const ledMat = new THREE.MeshStandardMaterial({
    color: theme.accentNum,
    emissive: theme.accentNum,
    emissiveIntensity: 0.9,
  });

  const cabXs = [-228, -172, -118, -63, -8, 47, 101];
  cabXs.forEach((cx, idx) => {
    const cab = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(44, 150, 52), cabBodyMat);
    body.position.y = 75;
    const door = new THREE.Mesh(new THREE.BoxGeometry(40, 140, 3), cabDoorMat);
    door.position.set(0, 75, 26.5);
    const led = new THREE.Mesh(new THREE.BoxGeometry(28, 3, 2), ledMat);
    led.position.set(0, 134, 28);
    cab.add(body, door, led);
    cab.position.set(cx, -206, -212);

    const cabId = idx % 2 === 0 ? 'cab1' : 'cab2';
    setInteract(cab, {
      type: 'cabinet',
      id: cabId,
      name: idx % 2 === 0 ? '1#进线保护' : '2#主变差动保护',
      focusPoint: [cx, -120, -212],
      flyEyeOffset: [0, 40, 220],
    });
    scene.add(cab);
  });

  // 2 Precision Cabinet Air Conditioners (clickable!)
  const acMat = new THREE.MeshStandardMaterial({ color: 0x86909c, roughness: 0.4, metalness: 0.5 });
  [
    { id: 'ac1', name: '1#空调', x: 196, z: 135 },
    { id: 'ac2', name: '2#空调', x: -353, z: 135 },
  ].forEach((acCfg) => {
    const ac = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(58, 150, 44), acMat);
    box.position.y = 75;
    const grille = new THREE.Mesh(new THREE.BoxGeometry(46, 36, 3), cabDoorMat);
    grille.position.set(0, 120, -22.5);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(22, 10, 2), ledMat);
    panel.position.set(0, 92, -22.5);
    ac.add(box, grille, panel);
    ac.position.set(acCfg.x, -206, acCfg.z);

    setInteract(ac, {
      type: 'ac',
      id: acCfg.id,
      name: acCfg.name,
      focusPoint: [acCfg.x, -120, acCfg.z],
      flyEyeOffset: [0, 50, -210],
    });
    scene.add(ac);
  });
}

/**
 * Builds Scene 3: 高压室 (High Voltage Switchgear Room).
 */
export function buildHighVoltageRoomScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  refs: AnimatedRefs,
  theme: SystemThemeConfig = getThemeConfig(DEFAULT_THEME_KEY),
): void {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x151820,
    roughness: 0.5,
    metalness: 0.3,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2400, 10, 1200), floorMat);
  floor.position.set(145, -225, -210);
  scene.add(floor);

  const flowAccent = createFlowGradientTexture(theme.accentHex, maxAnisotropy);
  refs.flowTextures.push(flowAccent);
  const lineMat = new THREE.MeshBasicMaterial({ map: flowAccent, transparent: true });
  const busLine = new THREE.Mesh(new THREE.BoxGeometry(2100, 2, 6), lineMat);
  busLine.position.set(145, -219, -210);
  scene.add(busLine);

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x6b7582, roughness: 0.42, metalness: 0.72 });
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xc26e45, roughness: 0.25, metalness: 0.15 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd0d7e0, roughness: 0.2, metalness: 0.88 });

  // Overhead busbar gantries & circuit breaker bays
  const breakerCoords: { id: string; name: string; x: number; z: number }[] = [
    { id: '233', name: '233断路器', x: -616, z: -383 },
    { id: '234', name: '234断路器', x: 169, z: -383 },
    { id: '235', name: '235断路器', x: 271, z: -383 },
  ];

  const bayXs = [-732, -616, -410, -304, -178, -72, 169, 271, 827, 994, 1146, 1250];
  bayXs.forEach((bx, idx) => {
    const zRow = idx % 2 === 0 ? -383 : -53;
    const bay = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(58, 16, 48), steelMat);
    base.position.y = 8;
    bay.add(base);

    [-18, 0, 18].forEach((px) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 72, 10), porcelainMat);
      col.position.set(px, 52, 0);
      bay.add(col);
    });

    // Moving breaker arm
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 88, 0);
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(44, 4, 8), bladeMat);
    armGroup.add(crossBar);
    bay.add(armGroup);

    bay.position.set(bx, -220, zRow);

    const matched = breakerCoords.find((b) => Math.abs(b.x - bx) < 15) ?? {
      id: '233',
      name: `${230 + idx}断路器`,
      x: bx,
      z: zRow,
    };
    refs.breakerArms.set(matched.id, armGroup);

    setInteract(bay, {
      type: 'breaker',
      id: matched.id,
      name: matched.name,
      focusPoint: [bx, -160, zRow],
      flyEyeOffset: [0, 140, 320],
    });
    scene.add(bay);
  });

  // Floating Status Signs ("检修中" in #FEB64D, "离线" in white)
  const maintTex = createSignLabelTexture('检修中', '#FEB64D', 'rgba(20,22,28,0.88)', maxAnisotropy);
  const maintSign = new THREE.Sprite(new THREE.SpriteMaterial({ map: maintTex, transparent: true }));
  maintSign.position.set(-733, -85, -87);
  maintSign.scale.set(160, 40, 1);
  scene.add(maintSign);

  const offTex = createSignLabelTexture('离线', '#ffffff', 'rgba(20,22,28,0.88)', maxAnisotropy);
  const offSign = new THREE.Sprite(new THREE.SpriteMaterial({ map: offTex, transparent: true }));
  offSign.position.set(136, -85, 280);
  offSign.scale.set(140, 38, 1);
  scene.add(offSign);
}
