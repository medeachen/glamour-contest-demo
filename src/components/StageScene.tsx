import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PetId, ContestId } from '../types';

interface Props {
  petId: PetId;
  contestId?: ContestId;
  width?: number;
  height?: number;
  skillActive?: boolean;
  skillColor?: string;
}

// Stage theme colors per contest
const STAGE_THEMES: Record<ContestId, { bg: number; floor: number; ring: number; spot: number }> = {
  elegance: { bg: 0x0a1428, floor: 0x1a2848, ring: 0xd4a820, spot: 0xfff8cc },
  sweet:    { bg: 0x2a0a2e, floor: 0x4a1a58, ring: 0xff88cc, spot: 0xffd4ff },
  dashing:  { bg: 0x200808, floor: 0x3a1808, ring: 0xff6820, spot: 0xffd8a0 },
  fresh:    { bg: 0x081a08, floor: 0x143018, ring: 0x70e080, spot: 0xd0ffcc },
  charm:    { bg: 0x180010, floor: 0x300018, ring: 0xcc2060, spot: 0xffb0d0 },
};

// 泡泡 — water hamster
function buildBubble(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf0f8ff, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 6), new THREE.MeshLambertMaterial({ color: 0xdff4ff, flatShading: true }));
  head.position.set(0, 0.98, 0.1);
  group.add(head);
  for (const sx of [-0.52, 0.52]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshLambertMaterial({ color: 0xb8e8f8, flatShading: true }));
    cheek.position.set(sx, 0.88, 0.28);
    group.add(cheek);
  }
  for (const sx of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x112233 }));
    eye.position.set(sx, 1.08, 0.49);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0x88ccee }));
  nose.position.set(0, 0.96, 0.54);
  group.add(nose);
  for (const sx of [-0.4, 0.4]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0xc8ecf8, flatShading: true }));
    ear.position.set(sx, 1.38, 0.05);
    group.add(ear);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), new THREE.MeshLambertMaterial({ color: 0x60b8e0, flatShading: true }));
    drop.position.set(sx, 1.52, 0.05);
    group.add(drop);
  }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 5), new THREE.MeshLambertMaterial({ color: 0x60b8e0, flatShading: true }));
  tail.position.set(0, 0.1, -1.0);
  group.add(tail);
  scene.add(group);
  return group;
}

// 焰尾 — fire Westie
function buildFlame(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfff0d0, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfde8b8, flatShading: true }));
  head.position.set(0, 0.92, 0.05);
  group.add(head);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf8d898, flatShading: true }));
  muzzle.position.set(0, 0.82, 0.42);
  group.add(muzzle);
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x221100 }));
    eye.position.set(sx, 0.98, 0.45);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x331100 }));
  nose.position.set(0, 0.84, 0.5);
  group.add(nose);
  for (const sx of [-0.32, 0.32]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 6), new THREE.MeshLambertMaterial({ color: 0xffc060, flatShading: true }));
    ear.position.set(sx, 1.30, 0.02);
    group.add(ear);
    const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), new THREE.MeshLambertMaterial({ color: 0xff5020, flatShading: true }));
    earTip.position.set(sx, 1.50, 0.02);
    group.add(earTip);
  }
  const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 7), new THREE.MeshLambertMaterial({ color: 0xff8030, flatShading: true }));
  tailBase.position.set(0, 0.05, -0.95);
  tailBase.rotation.x = -0.9;
  group.add(tailBase);
  scene.add(group);
  return group;
}

// 芽芽 — grass raccoon
function buildSprout(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 6), new THREE.MeshLambertMaterial({ color: 0xe0f0d0, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd8ecc0, flatShading: true }));
  head.position.set(0, 0.9, 0.05);
  group.add(head);
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.1), new THREE.MeshLambertMaterial({ color: 0x4a9040, flatShading: true }));
  mask.position.set(0, 0.98, 0.46);
  group.add(mask);
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    eye.position.set(sx, 1.0, 0.5);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x225522 }));
  nose.position.set(0, 0.86, 0.5);
  group.add(nose);
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0x88c070, flatShading: true }));
    ear.position.set(sx, 1.32, 0);
    group.add(ear);
    const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 5), new THREE.MeshLambertMaterial({ color: 0x40a030, flatShading: true }));
    sprout.position.set(sx, 1.52, 0);
    group.add(sprout);
  }
  const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x70a850, flatShading: true }));
  tailBase.position.set(0, -0.08, -0.95);
  tailBase.rotation.x = 0.8;
  group.add(tailBase);
  scene.add(group);
  return group;
}

// 雷丸 — electric shiba
function buildThunder(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf8e840, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf5e030, flatShading: true }));
  head.position.set(0, 0.9, 0.05);
  group.add(head);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf8f0b0, flatShading: true }));
  muzzle.position.set(0, 0.80, 0.42);
  group.add(muzzle);
  for (const sx of [-0.17, 0.17]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x110022 }));
    eye.position.set(sx, 0.97, 0.44);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  nose.position.set(0, 0.83, 0.48);
  group.add(nose);
  for (const sx of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.40, 5), new THREE.MeshLambertMaterial({ color: 0xf0d820, flatShading: true }));
    ear.position.set(sx, 1.32, 0.02);
    group.add(ear);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    stripe.position.set(sx, 1.32, 0.06);
    group.add(stripe);
  }
  // Zigzag-style tail: two short cylinders angled alternately to form a lightning bolt shape
  const tailSegs: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [0, 0.1, -0.8], rot: [-0.7, 0, 0] },
    { pos: [0.15, 0.35, -1.1], rot: [-0.3, 0.4, 0] },
  ];
  for (const seg of tailSegs) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.38, 6), new THREE.MeshLambertMaterial({ color: 0xf5d800, flatShading: true }));
    t.position.set(...seg.pos);
    t.rotation.set(...seg.rot);
    group.add(t);
  }
  scene.add(group);
  return group;
}

// 磐磐 — rock chinchilla
function buildRock(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.82, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd0c8e0, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 6), new THREE.MeshLambertMaterial({ color: 0xc8c0d8, flatShading: true }));
  head.position.set(0, 0.97, 0.08);
  group.add(head);
  for (const sx of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshLambertMaterial({ color: 0x110022 }));
    eye.position.set(sx, 1.07, 0.48);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0x887898 }));
  nose.position.set(0, 0.94, 0.54);
  group.add(nose);
  for (const sx of [-0.44, 0.44]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), new THREE.MeshLambertMaterial({ color: 0xb8b0d0, flatShading: true }));
    ear.position.set(sx, 1.38, 0.02);
    group.add(ear);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshLambertMaterial({ color: 0xa0c8f0, flatShading: true }));
    crystal.position.set(sx * 1.15, 1.52, 0.02);
    group.add(crystal);
  }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 7), new THREE.MeshLambertMaterial({ color: 0xb0a8c8, flatShading: true }));
  tail.position.set(0, -0.15, -1.0);
  tail.rotation.x = 0.7;
  group.add(tail);
  for (const [ox, oy, oz] of [[0.65, 0.3, 0.4], [-0.65, 0.2, 0.3]] as [number, number, number][]) {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshLambertMaterial({ color: 0x90c0f8, flatShading: true }));
    gem.position.set(ox, oy, oz);
    group.add(gem);
  }
  scene.add(group);
  return group;
}

export function StageScene({ petId, contestId, width = 400, height = 300, skillActive = false, skillColor = '#a78bfa' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const skillActiveRef = useRef(skillActive);
  skillActiveRef.current = skillActive;

  const particleGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const particleMatRef = useRef<THREE.PointsMaterial | null>(null);
  const pVelRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const theme = STAGE_THEMES[contestId ?? 'elegance'];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bg);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // Stage floor
    const floorGeo = new THREE.CylinderGeometry(3, 3, 0.15, 32);
    const floorMat = new THREE.MeshLambertMaterial({ color: theme.floor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1.3;
    scene.add(floor);

    // Stage edge glow ring
    const ringGeo = new THREE.TorusGeometry(3, 0.06, 8, 48);
    const ringMat = new THREE.MeshLambertMaterial({ color: theme.ring });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -1.22;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Background stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) starPos[i] = (Math.random() - 0.5) * 30;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Particle system for skills
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 80;
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 4;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      pVel[i * 3] = (Math.random() - 0.5) * 0.04;
      pVel[i * 3 + 1] = Math.random() * 0.05 + 0.01;
      pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({ color: new THREE.Color(skillColor), size: 0.12, transparent: true, opacity: 0 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particleGeoRef.current = particleGeo;
    particleMatRef.current = particleMat;
    pVelRef.current = pVel;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const spot = new THREE.SpotLight(theme.spot, 2, 20, Math.PI / 5, 0.5);
    spot.position.set(0, 8, 2);
    scene.add(spot);
    const fill = new THREE.DirectionalLight(0xa0c0ff, 0.8);
    fill.position.set(-4, 3, 3);
    scene.add(fill);

    // Pet
    let group: THREE.Group;
    if (petId === 'bubble') group = buildBubble(scene);
    else if (petId === 'flame') group = buildFlame(scene);
    else if (petId === 'sprout') group = buildSprout(scene);
    else if (petId === 'thunder') group = buildThunder(scene);
    else group = buildRock(scene);
    group.position.y = -0.6;

    let t = 0;
    function loop() {
      frameRef.current = requestAnimationFrame(loop);
      t += 0.016;
      group.rotation.y = Math.sin(t * 0.5) * 0.4;
      group.position.y = -0.6 + Math.sin(t * 1.2) * 0.08;

      const active = skillActiveRef.current;
      const pMat = particleMatRef.current;
      const pGeo = particleGeoRef.current;
      const vel = pVelRef.current;
      if (pMat) {
        pMat.opacity = active ? Math.min(pMat.opacity + 0.05, 0.85) : Math.max(pMat.opacity - 0.03, 0);
      }
      if (active && pGeo && vel) {
        const pos = pGeo.attributes.position as THREE.BufferAttribute;
        const arr = pos.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3] += vel[i * 3];
          arr[i * 3 + 1] += vel[i * 3 + 1];
          arr[i * 3 + 2] += vel[i * 3 + 2];
          if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = -1.5;
        }
        pos.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [petId, contestId, width, height, skillColor]);

  return <div ref={mountRef} style={{ width, height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />;
}
