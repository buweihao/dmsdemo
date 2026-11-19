import * as THREE from 'three';
import type { SystemThemeConfig } from '../data/themes';
import { getStackCoordinates } from '../utils/electrolyteTwinState';
import {
  createFlowGradientTexture,
  createHexGridTexture,
  createRadarRingTexture,
  createRoomMarkerTexture,
} from './textures';

export interface ElectrolyteAnimRefs {
  radarRings: THREE.Mesh[];
  impellers: THREE.Group[];
  positiveFlowTextures: THREE.CanvasTexture[];
  negativeFlowTextures: THREE.CanvasTexture[];
  liquidSurfaces: THREE.Mesh[];
  pulseRings: THREE.Mesh[];
  selectionRing: THREE.Mesh | null;
  unitAnchorPositions: Map<string, THREE.Vector3>;
}

function tagUnit(obj: THREE.Object3D, unitId: string) {
  obj.userData.electrolyteUnitId = unitId;
  obj.traverse((child) => {
    child.userData.electrolyteUnitId = unitId;
  });
}

function createPipeAlongPoints(
  points: [number, number, number][],
  outerRadius: number,
  innerRadius: number,
  outerMat: THREE.Material,
  flowMat: THREE.Material,
  tubularSegments = 48,
): THREE.Group {
  const group = new THREE.Group();
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < points.length - 1; i++) {
    const a = new THREE.Vector3(...points[i]);
    const b = new THREE.Vector3(...points[i + 1]);
    if (a.distanceToSquared(b) > 0.01) {
      path.add(new THREE.LineCurve3(a, b));
    }
  }
  if (path.curves.length === 0) return group;

  const outerGeo = new THREE.TubeGeometry(path, tubularSegments, outerRadius, 10, false);
  const innerGeo = new THREE.TubeGeometry(path, tubularSegments, innerRadius, 8, false);
  group.add(new THREE.Mesh(outerGeo, outerMat));
  group.add(new THREE.Mesh(innerGeo, flowMat));

  // Add subtle elbow spheres at bend vertices so 90-deg bends look machined
  if (points.length > 2) {
    const jointGeo = new THREE.SphereGeometry(outerRadius * 1.18, 10, 8);
    for (let i = 1; i < points.length - 1; i++) {
      const joint = new THREE.Mesh(jointGeo, outerMat);
      joint.position.set(...points[i]);
      group.add(joint);
    }
  }

  return group;
}

function buildElectrolyteTank(options: {
  unitId: string;
  x: number;
  indexCode: string;
  label: string;
  fillRatio: number;
  loopColorNum: number;
  loopColorHex: string;
  loopColorRgb: string;
  sideDir: 1 | -1; // 1 = left tank (outlets toward +X), -1 = right tank (outlets toward -X)
  maxAnisotropy: number;
  refs: ElectrolyteAnimRefs;
}): THREE.Group {
  const {
    unitId,
    x,
    indexCode,
    label,
    fillRatio,
    loopColorNum,
    loopColorHex,
    loopColorRgb,
    sideDir,
    maxAnisotropy,
    refs,
  } = options;

  const group = new THREE.Group();
  group.position.set(x, 6, 0);

  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: 0x2a3648,
    roughness: 0.45,
    metalness: 0.78,
  });
  const steelLightMat = new THREE.MeshStandardMaterial({
    color: 0x7b8da0,
    roughness: 0.32,
    metalness: 0.84,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9ec6e8,
    roughness: 0.09,
    metalness: 0.34,
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
  });
  const liquidMat = new THREE.MeshStandardMaterial({
    color: loopColorNum,
    emissive: loopColorNum,
    emissiveIntensity: 0.28,
    roughness: 0.24,
    metalness: 0.16,
    transparent: true,
    opacity: 0.9,
  });
  const meniscusMat = new THREE.MeshBasicMaterial({
    color: loopColorNum,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });

  // 1. Heavy steel foundation ring & 6 support legs
  const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(34, 36, 4.5, 28), steelDarkMat);
  baseRing.position.y = 2.25;
  group.add(baseRing);

  const legGeo = new THREE.BoxGeometry(5, 10, 7);
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i;
    const leg = new THREE.Mesh(legGeo, steelDarkMat);
    leg.position.set(Math.cos(ang) * 28.5, 9, Math.sin(ang) * 28.5);
    leg.rotation.y = -ang;
    group.add(leg);
  }

  // 2. Lower dished steel tank bottom
  const lowerDome = new THREE.Mesh(
    new THREE.SphereGeometry(31, 28, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    steelDarkMat,
  );
  lowerDome.scale.set(1, 0.32, 1);
  lowerDome.position.y = 14;
  group.add(lowerDome);

  // 3. Internal glowing electrolyte liquid column
  const maxLiquidHeight = 76;
  const liquidHeight = maxLiquidHeight * fillRatio;
  const liquidMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(28.4, 28.4, liquidHeight, 28),
    liquidMat,
  );
  liquidMesh.position.y = 14 + liquidHeight / 2;
  group.add(liquidMesh);

  // Glowing animated meniscus surface
  const meniscus = new THREE.Mesh(new THREE.CircleGeometry(28.1, 28), meniscusMat);
  meniscus.rotation.x = -Math.PI / 2;
  meniscus.position.y = 14 + liquidHeight + 0.25;
  meniscus.userData.baseY = meniscus.position.y;
  group.add(meniscus);
  refs.liquidSurfaces.push(meniscus);

  // 4. Translucent outer glass/FRP vessel shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(31, 31, maxLiquidHeight + 2, 32, 1, true),
    glassMat,
  );
  shell.position.y = 14 + (maxLiquidHeight + 2) / 2;
  group.add(shell);

  // 5. Structural metallic reinforcement hoops
  [26, 52, 78, 91].forEach((hy) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(31.4, 1.15, 8, 32), steelLightMat);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = hy;
    group.add(hoop);
  });

  // 6. Upper dished head dome + inspection hatch + breather vent + pressure gauge
  const upperDome = new THREE.Mesh(
    new THREE.SphereGeometry(31, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    steelDarkMat,
  );
  upperDome.scale.set(1, 0.34, 1);
  upperDome.position.y = 92;
  group.add(upperDome);

  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 10.5, 4, 20), steelLightMat);
  hatch.position.set(0, 103, 0);
  group.add(hatch);

  const breatherPipe = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 10, 12), steelLightMat);
  breatherPipe.position.set(sideDir * -13, 103, -8);
  group.add(breatherPipe);

  const breatherCap = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.6, 2.2, 14), steelDarkMat);
  breatherCap.position.set(sideDir * -13, 108.5, -8);
  group.add(breatherCap);

  // 7. Front vertical sight-glass level gauge
  const gaugeCol = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 66, 12), glassMat);
  gaugeCol.position.set(0, 52, 33);
  group.add(gaugeCol);

  const gaugeFluidH = 62 * fillRatio;
  const gaugeFluid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, gaugeFluidH, 10),
    liquidMat,
  );
  gaugeFluid.position.set(0, 20 + gaugeFluidH / 2, 33);
  group.add(gaugeFluid);

  [20, 84].forEach((gy) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), steelLightMat);
    bracket.position.set(0, gy, 31.2);
    group.add(bracket);
  });

  // 8. Flanged discharge (front-bottom) & return (inner-top) nozzles
  const bottomNozzle = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 7, 14), steelLightMat);
  bottomNozzle.rotation.x = Math.PI / 2;
  bottomNozzle.position.set(0, 13, 31.5);
  group.add(bottomNozzle);

  const topReturnNozzle = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 8, 14), steelLightMat);
  topReturnNozzle.rotation.z = Math.PI / 2;
  topReturnNozzle.position.set(sideDir * 31.5, 78, 0);
  group.add(topReturnNozzle);

  // 9. Floor pulse aura ring under tank
  const auraMat = new THREE.MeshBasicMaterial({
    color: loopColorNum,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const auraRing = new THREE.Mesh(new THREE.RingGeometry(36.5, 39.5, 36), auraMat);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.5;
  group.add(auraRing);
  refs.pulseRings.push(auraRing);

  // 10. Floating holographic marker sprite (matches 3D监控 style)
  const markerTex = createRoomMarkerTexture(
    indexCode,
    label,
    maxAnisotropy,
    loopColorHex,
    loopColorRgb,
  );
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: markerTex, transparent: true, depthTest: false }),
  );
  sprite.scale.set(52, 45, 1);
  sprite.position.set(0, 128, 0);
  group.add(sprite);

  tagUnit(group, unitId);
  refs.unitAnchorPositions.set(unitId, new THREE.Vector3(x, 6.8, 0));
  return group;
}

function buildCirculationPump(options: {
  unitId: string;
  x: number;
  z: number;
  loopColorNum: number;
  refs: ElectrolyteAnimRefs;
}): THREE.Group {
  const { unitId, x, z, loopColorNum, refs } = options;
  const group = new THREE.Group();
  group.position.set(x, 6, z);

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.55,
    metalness: 0.72,
  });
  const casingMat = new THREE.MeshStandardMaterial({
    color: 0x9eb0c2,
    roughness: 0.28,
    metalness: 0.85,
  });
  const motorMat = new THREE.MeshStandardMaterial({
    color: 0x3c4b5e,
    roughness: 0.42,
    metalness: 0.75,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: loopColorNum,
    emissive: loopColorNum,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.35,
  });

  // 1. Bolted skid baseplate & pedestal foot
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(28, 2.2, 22), baseMat);
  basePlate.position.y = 1.1;
  group.add(basePlate);

  const foot = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 12), baseMat);
  foot.position.set(0, 5.2, 0);
  group.add(foot);

  // 2. Machined cylindrical volute casing (front-facing impeller window)
  const volute = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.5, 8, 24), casingMat);
  volute.rotation.x = Math.PI / 2;
  volute.position.set(0, 13, 2);
  group.add(volute);

  // Colored inner chamber face
  const chamber = new THREE.Mesh(new THREE.CircleGeometry(7.8, 20), accentMat);
  chamber.position.set(0, 13, 6.15);
  group.add(chamber);

  // 3. Continuously spinning 3-blade impeller
  const impeller = new THREE.Group();
  impeller.position.set(0, 13, 6.45);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.25,
    roughness: 0.2,
    metalness: 0.6,
  });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.2, 12), bladeMat);
  hub.rotation.x = Math.PI / 2;
  impeller.add(hub);

  const bladeGeo = new THREE.BoxGeometry(2.0, 6.4, 0.7);
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.z = (Math.PI * 2 * i) / 3;
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 3.2;
    blade.rotation.z = 0.28;
    pivot.add(blade);
    impeller.add(pivot);
  }
  group.add(impeller);
  refs.impellers.push(impeller);

  // Outer bezel ring
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.85, 8, 24), casingMat);
  bezel.position.set(0, 13, 6.4);
  group.add(bezel);

  // 4. Rear finned electric drive motor
  const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 14, 18), motorMat);
  motorBody.rotation.x = Math.PI / 2;
  motorBody.position.set(0, 13, -9);
  group.add(motorBody);

  for (let i = -4; i <= 4; i += 2) {
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(7.9, 7.9, 0.6, 18), casingMat);
    fin.rotation.x = Math.PI / 2;
    fin.position.set(0, 13, -9 + i);
    group.add(fin);
  }

  // 5. Left & right pipe suction/discharge flanged nozzles
  [-12.5, 12.5].forEach((nx) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 5.5, 12), casingMat);
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(nx, 13, 0);
    group.add(nozzle);

    const flange = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 1.2, 14), baseMat);
    flange.rotation.z = Math.PI / 2;
    flange.position.set(nx + (nx < 0 ? -2.2 : 2.2), 13, 0);
    group.add(flange);
  });

  // 6. Glowing status base ring
  const pumpAura = new THREE.Mesh(
    new THREE.RingGeometry(16, 18, 28),
    new THREE.MeshBasicMaterial({
      color: loopColorNum,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    }),
  );
  pumpAura.rotation.x = -Math.PI / 2;
  pumpAura.position.y = 0.45;
  group.add(pumpAura);
  refs.pulseRings.push(pumpAura);

  tagUnit(group, unitId);
  refs.unitAnchorPositions.set(unitId, new THREE.Vector3(x, 6.8, z));
  return group;
}

function buildFlowBatteryStack(options: {
  unitId: string;
  x: number;
  z: number;
  theme: SystemThemeConfig;
  refs: ElectrolyteAnimRefs;
}): THREE.Group {
  const { unitId, x, z, theme, refs } = options;
  const group = new THREE.Group();
  group.position.set(x, 16, z);

  const clampMat = new THREE.MeshStandardMaterial({
    color: 0x364458,
    roughness: 0.38,
    metalness: 0.78,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.45,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.85,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd98a4a,
    roughness: 0.25,
    metalness: 0.88,
  });
  const posCollarMat = new THREE.MeshStandardMaterial({
    color: theme.positiveLoopNum,
    emissive: theme.positiveLoopNum,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.5,
  });
  const negCollarMat = new THREE.MeshStandardMaterial({
    color: theme.negativeLoopNum,
    emissive: theme.negativeLoopNum,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.5,
  });
  const statusMat = new THREE.MeshBasicMaterial({
    color: theme.accentNum,
  });

  // 1. Bottom base cradle
  const cradle = new THREE.Mesh(new THREE.BoxGeometry(26, 2.5, 32), clampMat);
  cradle.position.y = 1.25;
  group.add(cradle);

  // 2. Front and rear heavy steel clamping end-plates
  const endPlateGeo = new THREE.BoxGeometry(24, 34, 2.6);
  const frontPlate = new THREE.Mesh(endPlateGeo, clampMat);
  frontPlate.position.set(0, 19.5, 13.7);
  group.add(frontPlate);

  const backPlate = new THREE.Mesh(endPlateGeo, clampMat);
  backPlate.position.set(0, 19.5, -13.7);
  group.add(backPlate);

  // 3. Laminated bipolar cell stack core (7 distinct stacked layers with fine gaps)
  const cellGeo = new THREE.BoxGeometry(21.5, 31.5, 2.5);
  for (let i = 0; i < 7; i++) {
    const cz = -10.5 + i * 3.5;
    const cell = new THREE.Mesh(cellGeo, i % 2 === 0 ? plateMat : clampMat);
    cell.position.set(0, 19.5, cz);
    group.add(cell);
  }

  // 4. Four horizontal metallic clamping tie-rods along corners
  const rodGeo = new THREE.CylinderGeometry(0.65, 0.65, 31, 8);
  const rodOffsets: [number, number][] = [
    [-10.5, 6.5],
    [10.5, 6.5],
    [-10.5, 32.5],
    [10.5, 32.5],
  ];
  rodOffsets.forEach(([rx, ry]) => {
    const rod = new THREE.Mesh(rodGeo, ribMat);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(rx, ry, 0);
    group.add(rod);
  });

  // 5. Top copper DC collector bar & glowing telemetry status LED strip
  const busbar = new THREE.Mesh(new THREE.BoxGeometry(20, 1.6, 3.2), copperMat);
  busbar.position.set(0, 37.3, 0);
  group.add(busbar);

  const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(14, 1.1, 0.8), statusMat);
  ledStrip.position.set(0, 33.5, 15.2);
  group.add(ledStrip);

  // 6. Top & bottom hydraulic manifold collars (Left = Positive, Right = Negative)
  const portGeo = new THREE.CylinderGeometry(2.1, 2.1, 4, 10);
  const posTopPort = new THREE.Mesh(portGeo, posCollarMat);
  posTopPort.position.set(-6, 38.5, 0);
  group.add(posTopPort);

  const negTopPort = new THREE.Mesh(portGeo, negCollarMat);
  negTopPort.position.set(6, 38.5, 0);
  group.add(negTopPort);

  const posBotPort = new THREE.Mesh(portGeo, posCollarMat);
  posBotPort.position.set(-6, -1.2, 0);
  group.add(posBotPort);

  const negBotPort = new THREE.Mesh(portGeo, negCollarMat);
  negBotPort.position.set(6, -1.2, 0);
  group.add(negBotPort);

  tagUnit(group, unitId);
  refs.unitAnchorPositions.set(unitId, new THREE.Vector3(x, 16.4, z));
  return group;
}

export function buildElectrolyteTwinScene(
  root: THREE.Group,
  maxAnisotropy: number,
  theme: SystemThemeConfig,
): ElectrolyteAnimRefs {
  const refs: ElectrolyteAnimRefs = {
    radarRings: [],
    impellers: [],
    positiveFlowTextures: [],
    negativeFlowTextures: [],
    liquidSurfaces: [],
    pulseRings: [],
    selectionRing: null,
    unitAnchorPositions: new Map(),
  };

  const bgHexStr = `#${theme.canvasBgNum.toString(16).padStart(6, '0')}`;

  // 1. Sci-fi Hex Grid Floor (matching 3D监控)
  const hexTex = createHexGridTexture(maxAnisotropy, theme.groundGridRgba, bgHexStr);
  hexTex.repeat.set(22, 16);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1200),
    new THREE.MeshBasicMaterial({ map: hexTex }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  root.add(floor);

  // 2. Dual Rotating Holographic Tech Radar Rings
  const radarTex = createRadarRingTexture(maxAnisotropy, theme.accentRgb);
  const outerRadar = new THREE.Mesh(
    new THREE.PlaneGeometry(660, 660),
    new THREE.MeshBasicMaterial({
      map: radarTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  outerRadar.rotation.x = -Math.PI / 2;
  outerRadar.position.set(0, 0.5, 4);
  root.add(outerRadar);
  refs.radarRings.push(outerRadar);

  const innerRadar = new THREE.Mesh(
    new THREE.PlaneGeometry(460, 460),
    new THREE.MeshBasicMaterial({
      map: radarTex,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  innerRadar.rotation.x = -Math.PI / 2;
  innerRadar.position.set(0, 0.8, 4);
  root.add(innerRadar);
  refs.radarRings.push(innerRadar);

  // 3. Industrial Equipment Skid Platform
  const skidMat = new THREE.MeshStandardMaterial({
    color: 0x131c2e,
    roughness: 0.62,
    metalness: 0.55,
  });
  const skid = new THREE.Mesh(new THREE.BoxGeometry(490, 6, 256), skidMat);
  skid.position.set(0, 3, 6);
  root.add(skid);

  // Glowing accent trim along skid perimeter
  const trimMat = new THREE.MeshBasicMaterial({
    color: theme.accentNum,
    transparent: true,
    opacity: 0.72,
  });
  const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(492, 1.1, 1.4), trimMat);
  frontTrim.position.set(0, 6.2, 134);
  root.add(frontTrim);
  const backTrim = new THREE.Mesh(new THREE.BoxGeometry(492, 1.1, 1.4), trimMat);
  backTrim.position.set(0, 6.2, -122);
  root.add(backTrim);
  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 256), trimMat);
  leftTrim.position.set(-245.5, 6.2, 6);
  root.add(leftTrim);
  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 256), trimMat);
  rightTrim.position.set(245.5, 6.2, 6);
  root.add(rightTrim);

  // Twin steel structural support racks for the 2 rows of 6 battery stacks
  const rackMat = new THREE.MeshStandardMaterial({
    color: 0x243247,
    roughness: 0.52,
    metalness: 0.72,
  });
  [-46, 46].forEach((rz) => {
    const rackBeam = new THREE.Mesh(new THREE.BoxGeometry(238, 10, 34), rackMat);
    rackBeam.position.set(0, 11, rz);
    root.add(rackBeam);
  });

  // 4. Positive & Negative Electrolyte Storage Tanks
  root.add(
    buildElectrolyteTank({
      unitId: 'pos_tank',
      x: -192,
      indexCode: '01',
      label: '正极储罐',
      fillRatio: 0.784,
      loopColorNum: theme.positiveLoopNum,
      loopColorHex: theme.positiveLoopHex,
      loopColorRgb: theme.positiveLoopRgb,
      sideDir: 1,
      maxAnisotropy,
      refs,
    }),
  );

  root.add(
    buildElectrolyteTank({
      unitId: 'neg_tank',
      x: 192,
      indexCode: '02',
      label: '负极储罐',
      fillRatio: 0.768,
      loopColorNum: theme.negativeLoopNum,
      loopColorHex: theme.negativeLoopHex,
      loopColorRgb: theme.negativeLoopRgb,
      sideDir: -1,
      maxAnisotropy,
      refs,
    }),
  );

  // 5. 12 Parallel Flow Battery Stacks (2 rows x 6 columns)
  const stackCoords = getStackCoordinates();
  stackCoords.forEach((coord) => {
    root.add(
      buildFlowBatteryStack({
        unitId: coord.id,
        x: coord.x,
        z: coord.z,
        theme,
        refs,
      }),
    );
  });

  // Center holographic marker above stack array
  const stackMarkerTex = createRoomMarkerTexture(
    '12组',
    '液流电堆阵列',
    maxAnisotropy,
    theme.accentHex,
    theme.accentRgb,
  );
  const stackSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: stackMarkerTex, transparent: true, depthTest: false }),
  );
  stackSprite.scale.set(58, 48, 1);
  stackSprite.position.set(0, 108, 0);
  root.add(stackSprite);

  // 6. Positive & Negative Circulation Pumps
  root.add(
    buildCirculationPump({
      unitId: 'pos_pump',
      x: -138,
      z: 96,
      loopColorNum: theme.positiveLoopNum,
      refs,
    }),
  );

  root.add(
    buildCirculationPump({
      unitId: 'neg_pump',
      x: 138,
      z: 96,
      loopColorNum: theme.negativeLoopNum,
      refs,
    }),
  );

  // 7. Dual-Circuit 3D Pipe Manifolds with Directional Scrolling Electrolyte Flow
  const posOuterMat = new THREE.MeshStandardMaterial({
    color: theme.positiveLoopNum,
    roughness: 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.42,
  });
  const negOuterMat = new THREE.MeshStandardMaterial({
    color: theme.negativeLoopNum,
    roughness: 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.42,
  });

  const posFlowTex = createFlowGradientTexture(theme.positiveLoopHex, maxAnisotropy);
  posFlowTex.repeat.set(7, 1);
  refs.positiveFlowTextures.push(posFlowTex);
  const posFlowMat = new THREE.MeshBasicMaterial({
    map: posFlowTex,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const negFlowTex = createFlowGradientTexture(theme.negativeLoopHex, maxAnisotropy);
  negFlowTex.repeat.set(7, 1);
  refs.negativeFlowTextures.push(negFlowTex);
  const negFlowMat = new THREE.MeshBasicMaterial({
    map: negFlowTex,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const posBranchFlowTex = createFlowGradientTexture(theme.positiveLoopHex, maxAnisotropy);
  posBranchFlowTex.repeat.set(2.5, 1);
  refs.positiveFlowTextures.push(posBranchFlowTex);
  const posBranchMat = new THREE.MeshBasicMaterial({
    map: posBranchFlowTex,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const negBranchFlowTex = createFlowGradientTexture(theme.negativeLoopHex, maxAnisotropy);
  negBranchFlowTex.repeat.set(2.5, 1);
  refs.negativeFlowTextures.push(negBranchFlowTex);
  const negBranchMat = new THREE.MeshBasicMaterial({
    map: negBranchFlowTex,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // --- POSITIVE SUPPLY LOOP (Left Tank -> Pos Pump -> Bottom Stack Inlets) ---
  root.add(
    createPipeAlongPoints(
      [
        [-192, 19, 32],
        [-192, 19, 96],
        [-152, 19, 96],
      ],
      2.6,
      1.65,
      posOuterMat,
      posFlowMat,
      32,
    ),
  );
  // Pos Pump discharge spine to front & back supply headers
  root.add(
    createPipeAlongPoints(
      [
        [-124, 19, 96],
        [-124, 13, 96],
        [-124, 13, 72],
        [-124, 13, -72],
      ],
      2.5,
      1.6,
      posOuterMat,
      posFlowMat,
      44,
    ),
  );
  // Front & back positive supply headers (left -> right across 6 stacks)
  [-72, 72].forEach((hz) => {
    root.add(
      createPipeAlongPoints(
        [
          [-124, 13, hz],
          [89, 13, hz],
        ],
        2.3,
        1.45,
        posOuterMat,
        posFlowMat,
        40,
      ),
    );
  });

  // --- POSITIVE RETURN LOOP (Top Stack Outlets -> Leftward -> Left Tank Upper Inlet) ---
  [-46, 46].forEach((rz) => {
    root.add(
      createPipeAlongPoints(
        [
          [89, 66, rz],
          [-134, 66, rz],
          [-134, 84, 0],
          [-160, 84, 0],
        ],
        2.4,
        1.55,
        posOuterMat,
        posFlowMat,
        52,
      ),
    );
  });

  // --- NEGATIVE SUPPLY LOOP (Right Tank -> Neg Pump -> Bottom Stack Inlets) ---
  root.add(
    createPipeAlongPoints(
      [
        [192, 19, 32],
        [192, 19, 96],
        [152, 19, 96],
      ],
      2.6,
      1.65,
      negOuterMat,
      negFlowMat,
      32,
    ),
  );
  // Neg Pump discharge spine to front & back supply headers
  root.add(
    createPipeAlongPoints(
      [
        [124, 19, 96],
        [124, 10.5, 96],
        [124, 10.5, 79],
        [124, 10.5, -79],
      ],
      2.5,
      1.6,
      negOuterMat,
      negFlowMat,
      44,
    ),
  );
  // Front & back negative supply headers (right -> left across 6 stacks)
  [-79, 79].forEach((hz) => {
    root.add(
      createPipeAlongPoints(
        [
          [124, 10.5, hz],
          [-89, 10.5, hz],
        ],
        2.3,
        1.45,
        negOuterMat,
        negFlowMat,
        40,
      ),
    );
  });

  // --- NEGATIVE RETURN LOOP (Top Stack Outlets -> Rightward -> Right Tank Upper Inlet) ---
  [-46, 46].forEach((rz) => {
    root.add(
      createPipeAlongPoints(
        [
          [-89, 74, rz],
          [134, 74, rz],
          [134, 84, 0],
          [160, 84, 0],
        ],
        2.4,
        1.55,
        negOuterMat,
        negFlowMat,
        52,
      ),
    );
  });

  // Per-stack supply & return risers connecting headers to every stack's 4 hydraulic ports
  stackCoords.forEach((coord) => {
    const posHeaderZ = coord.row === 0 ? -72 : 72;
    const negHeaderZ = coord.row === 0 ? -79 : 79;

    // Positive bottom supply riser (header -> stack bottom-left port)
    root.add(
      createPipeAlongPoints(
        [
          [coord.x - 6, 13, posHeaderZ],
          [coord.x - 6, 13, coord.z],
          [coord.x - 6, 16.5, coord.z],
        ],
        1.45,
        0.92,
        posOuterMat,
        posBranchMat,
        14,
      ),
    );
    // Positive top return riser (stack top-left port -> upper positive collector)
    root.add(
      createPipeAlongPoints(
        [
          [coord.x - 6, 55, coord.z],
          [coord.x - 6, 66, coord.z],
        ],
        1.45,
        0.92,
        posOuterMat,
        posBranchMat,
        10,
      ),
    );

    // Negative bottom supply riser (header -> stack bottom-right port)
    root.add(
      createPipeAlongPoints(
        [
          [coord.x + 6, 10.5, negHeaderZ],
          [coord.x + 6, 10.5, coord.z],
          [coord.x + 6, 16.5, coord.z],
        ],
        1.45,
        0.92,
        negOuterMat,
        negBranchMat,
        14,
      ),
    );
    // Negative top return riser (stack top-right port -> upper negative collector)
    root.add(
      createPipeAlongPoints(
        [
          [coord.x + 6, 55, coord.z],
          [coord.x + 6, 74, coord.z],
        ],
        1.45,
        0.92,
        negOuterMat,
        negBranchMat,
        10,
      ),
    );
  });

  // 8. Interactive Selection Highlight Ring (shown beneath clicked equipment)
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(24, 28, 36),
    new THREE.MeshBasicMaterial({
      color: theme.accentNum,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  selRing.rotation.x = -Math.PI / 2;
  selRing.visible = false;
  root.add(selRing);
  refs.selectionRing = selRing;

  return refs;
}
