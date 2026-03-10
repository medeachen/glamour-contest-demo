import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PetId } from '../types';

interface Props {
  petId: PetId;
  size?: number;
  animate?: boolean;
}

// 泡泡 — water hamster: cream-white with blue water-drop decorations
function buildBubble(scene: THREE.Scene) {
  const group = new THREE.Group();
  // Body (big round)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf0f8ff, flatShading: true }));
  group.add(body);
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 6), new THREE.MeshLambertMaterial({ color: 0xdff4ff, flatShading: true }));
  head.position.set(0, 0.98, 0.1);
  group.add(head);
  // Puffy cheeks
  for (const sx of [-0.52, 0.52]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshLambertMaterial({ color: 0xb8e8f8, flatShading: true }));
    cheek.position.set(sx, 0.88, 0.28);
    group.add(cheek);
  }
  // Eyes
  for (const sx of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x112233 }));
    eye.position.set(sx, 1.08, 0.49);
    group.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.11, 0.54);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0x88ccee }));
  nose.position.set(0, 0.96, 0.54);
  group.add(nose);
  // Round ears with water-drop blue tip
  for (const sx of [-0.4, 0.4]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0xc8ecf8, flatShading: true }));
    ear.position.set(sx, 1.38, 0.05);
    group.add(ear);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), new THREE.MeshLambertMaterial({ color: 0x60b8e0, flatShading: true }));
    drop.position.set(sx, 1.52, 0.05);
    group.add(drop);
  }
  // Water-drop tail
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 5), new THREE.MeshLambertMaterial({ color: 0x60b8e0, flatShading: true }));
  tail.position.set(0, 0.1, -1.0);
  group.add(tail);
  // Small legs
  for (const [sx, sz] of [[-0.35, 0.35], [0.35, 0.35], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.42, 6), new THREE.MeshLambertMaterial({ color: 0xd8f0f8, flatShading: true }));
    leg.position.set(sx, -0.75, sz);
    group.add(leg);
  }
  scene.add(group);
  return group;
}

// 焰尾 — fire Westie: warm gold with orange-red gradient tips, flame tail
function buildFlame(scene: THREE.Scene) {
  const group = new THREE.Group();
  // Body (fluffy)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfff0d0, flatShading: true }));
  group.add(body);
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfde8b8, flatShading: true }));
  head.position.set(0, 0.92, 0.05);
  group.add(head);
  // Muzzle
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf8d898, flatShading: true }));
  muzzle.position.set(0, 0.82, 0.42);
  group.add(muzzle);
  // Eyes
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x221100 }));
    eye.position.set(sx, 0.98, 0.45);
    group.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.01, 0.50);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x331100 }));
  nose.position.set(0, 0.84, 0.5);
  group.add(nose);
  // Pointy ears with orange-red tips
  for (const sx of [-0.32, 0.32]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 6), new THREE.MeshLambertMaterial({ color: 0xffc060, flatShading: true }));
    ear.position.set(sx, 1.30, 0.02);
    group.add(ear);
    const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), new THREE.MeshLambertMaterial({ color: 0xff5020, flatShading: true }));
    earTip.position.set(sx, 1.50, 0.02);
    group.add(earTip);
  }
  // Flame tail (orange-red cone)
  const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 7), new THREE.MeshLambertMaterial({ color: 0xff8030, flatShading: true }));
  tailBase.position.set(0, 0.05, -0.95);
  tailBase.rotation.x = -0.9;
  group.add(tailBase);
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 7), new THREE.MeshLambertMaterial({ color: 0xff3800, flatShading: true }));
  tailTip.position.set(0, 0.48, -1.18);
  tailTip.rotation.x = -0.9;
  group.add(tailTip);
  // Legs
  for (const [sx, sz] of [[-0.35, 0.3], [0.35, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.45, 6), new THREE.MeshLambertMaterial({ color: 0xfce0a8, flatShading: true }));
    leg.position.set(sx, -0.72, sz);
    group.add(leg);
  }
  scene.add(group);
  return group;
}

// 芽芽 — grass raccoon: leaf-green eye mask, sprout ears, vine tail
function buildSprout(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 6), new THREE.MeshLambertMaterial({ color: 0xe0f0d0, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd8ecc0, flatShading: true }));
  head.position.set(0, 0.9, 0.05);
  group.add(head);
  // Leaf-green eye mask
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.1), new THREE.MeshLambertMaterial({ color: 0x4a9040, flatShading: true }));
  mask.position.set(0, 0.98, 0.46);
  group.add(mask);
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    eye.position.set(sx, 1.0, 0.5);
    group.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.03, 0.55);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x225522 }));
  nose.position.set(0, 0.86, 0.5);
  group.add(nose);
  // Ears with sprout
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0x88c070, flatShading: true }));
    ear.position.set(sx, 1.32, 0);
    group.add(ear);
    const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 5), new THREE.MeshLambertMaterial({ color: 0x40a030, flatShading: true }));
    sprout.position.set(sx, 1.52, 0);
    group.add(sprout);
  }
  // Vine tail (cylinder with ring stripes)
  const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x70a850, flatShading: true }));
  tailBase.position.set(0, -0.08, -0.95);
  tailBase.rotation.x = 0.8;
  group.add(tailBase);
  for (const sy of [0.25, -0.1, -0.4]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 5, 10), new THREE.MeshLambertMaterial({ color: 0x4a8830, flatShading: true }));
    ring.position.set(0, sy - 0.08, -0.95);
    ring.rotation.x = 0.8;
    group.add(ring);
  }
  for (const [sx, sz] of [[-0.35, 0.3], [0.35, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 6), new THREE.MeshLambertMaterial({ color: 0xa8d090, flatShading: true }));
    leg.position.set(sx, -0.75, sz);
    group.add(leg);
  }
  scene.add(group);
  return group;
}

// 雷丸 — electric shiba: yellow with lightning ear markings, zigzag tail
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
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.00, 0.49);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  nose.position.set(0, 0.83, 0.48);
  group.add(nose);
  // Triangular ears with black lightning stripe
  for (const sx of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.40, 5), new THREE.MeshLambertMaterial({ color: 0xf0d820, flatShading: true }));
    ear.position.set(sx, 1.32, 0.02);
    group.add(ear);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    stripe.position.set(sx, 1.32, 0.06);
    group.add(stripe);
  }
  // Zigzag-style tail: series of short cylinders angled to form a lightning bolt shape
  const tailSegs: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [0, 0.1, -0.8], rot: [-0.7, 0, 0] },
    { pos: [0.15, 0.35, -1.1], rot: [-0.3, 0.4, 0] },
    { pos: [0.05, 0.6, -1.3], rot: [0.3, -0.2, 0] },
  ];
  for (const seg of tailSegs) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.38, 6), new THREE.MeshLambertMaterial({ color: 0xf5d800, flatShading: true }));
    t.position.set(...seg.pos);
    t.rotation.set(...seg.rot);
    group.add(t);
  }
  // Black lightning tip
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 5), new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true }));
  tip.position.set(0.05, 0.76, -1.42);
  group.add(tip);
  for (const [sx, sz] of [[-0.35, 0.3], [0.35, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.45, 6), new THREE.MeshLambertMaterial({ color: 0xead820, flatShading: true }));
    leg.position.set(sx, -0.72, sz);
    group.add(leg);
  }
  scene.add(group);
  return group;
}

// 磐磐 — rock chinchilla: grey-purple crystalline fur, crystal-edge ears, stone pillar tail
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
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), new THREE.MeshLambertMaterial({ color: 0xd0e8ff }));
    shine.position.set(sx + 0.03, 1.10, 0.53);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0x887898 }));
  nose.position.set(0, 0.94, 0.54);
  group.add(nose);
  // Large round ears with crystal-edged geometric shapes
  for (const sx of [-0.44, 0.44]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), new THREE.MeshLambertMaterial({ color: 0xb8b0d0, flatShading: true }));
    ear.position.set(sx, 1.38, 0.02);
    group.add(ear);
    // Crystal shard on ear edge
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshLambertMaterial({ color: 0xa0c8f0, flatShading: true }));
    crystal.position.set(sx * 1.15, 1.52, 0.02);
    group.add(crystal);
  }
  // Stone pillar tail: short thick cylinder
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 7), new THREE.MeshLambertMaterial({ color: 0xb0a8c8, flatShading: true }));
  tail.position.set(0, -0.15, -1.0);
  tail.rotation.x = 0.7;
  group.add(tail);
  // Crystal decorations on body
  for (const [ox, oy, oz] of [[0.65, 0.3, 0.4], [-0.65, 0.2, 0.3], [0.3, 0.7, 0.5]] as [number, number, number][]) {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshLambertMaterial({ color: 0x90c0f8, flatShading: true }));
    gem.position.set(ox, oy, oz);
    group.add(gem);
  }
  for (const [sx, sz] of [[-0.38, 0.35], [0.38, 0.35], [-0.32, -0.32], [0.32, -0.32]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.44, 7), new THREE.MeshLambertMaterial({ color: 0xc0b8d8, flatShading: true }));
    leg.position.set(sx, -0.78, sz);
    group.add(leg);
  }
  scene.add(group);
  return group;
}

export function PetModel({ petId, size = 180, animate = true }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfff8dc, 1.2);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xe0d0ff, 0.4);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    let group: THREE.Group;
    if (petId === 'bubble') group = buildBubble(scene);
    else if (petId === 'flame') group = buildFlame(scene);
    else if (petId === 'sprout') group = buildSprout(scene);
    else if (petId === 'thunder') group = buildThunder(scene);
    else group = buildRock(scene);

    let t = 0;
    function loop() {
      frameRef.current = requestAnimationFrame(loop);
      t += 0.01;
      if (animate) {
        group.rotation.y = t * 0.8;
        group.position.y = Math.sin(t) * 0.06;
      }
      renderer.render(scene, camera);
    }
    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [petId, size, animate]);

  return <div ref={mountRef} style={{ width: size, height: size, display: 'inline-block' }} />;
}
