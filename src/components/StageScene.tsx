import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PetId } from '../types';

interface Props {
  petId: PetId;
  width?: number;
  height?: number;
  skillActive?: boolean;
  skillColor?: string;
}

function buildSnow(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf5f5f5, flatShading: true }));
  head.position.set(0, 0.9, 0);
  group.add(head);
  for (const sx of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 6), new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true }));
    ear.position.set(sx, 1.28, 0);
    group.add(ear);
  }
  for (const sx of [-0.15, 0.15]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    eye.position.set(sx, 0.95, 0.42);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff9999 }));
  nose.position.set(0, 0.85, 0.45);
  group.add(nose);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true }));
  tail.position.set(0, 0.1, -0.85);
  group.add(tail);
  scene.add(group);
  return group;
}

function buildHamster(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfff5e0, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffe4c4, flatShading: true }));
  head.position.set(0, 0.95, 0.1);
  group.add(head);
  for (const sx of [-0.48, 0.48]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffb6c1, flatShading: true }));
    cheek.position.set(sx, 0.85, 0.25);
    group.add(cheek);
  }
  for (const sx of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    eye.position.set(sx, 1.05, 0.47);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff8888 }));
  nose.position.set(0, 0.93, 0.52);
  group.add(nose);
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffb6c1, flatShading: true }));
    ear.position.set(sx, 1.35, 0.05);
    group.add(ear);
  }
  scene.add(group);
  return group;
}

function buildRaccoon(scene: THREE.Scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshLambertMaterial({ color: 0x8ca0b8, flatShading: true }));
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshLambertMaterial({ color: 0x9eb0c2, flatShading: true }));
  head.position.set(0, 0.9, 0.05);
  group.add(head);
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.1), new THREE.MeshLambertMaterial({ color: 0x2f4f4f, flatShading: true }));
  mask.position.set(0, 0.98, 0.46);
  group.add(mask);
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    eye.position.set(sx, 1.0, 0.5);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  nose.position.set(0, 0.86, 0.5);
  group.add(nose);
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0x7a8fa0, flatShading: true }));
    ear.position.set(sx, 1.32, 0);
    group.add(ear);
  }
  scene.add(group);
  return group;
}

export function StageScene({ petId, width = 400, height = 300, skillActive = false, skillColor = '#a78bfa' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const skillActiveRef = useRef(skillActive);
  skillActiveRef.current = skillActive;

  // Store refs for mutable scene objects updated in render loop
  const particleGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const particleMatRef = useRef<THREE.PointsMaterial | null>(null);
  const pVelRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0a2e);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // Stage floor
    const floorGeo = new THREE.CylinderGeometry(3, 3, 0.15, 32);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x2d1b69 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1.3;
    scene.add(floor);

    // Stage edge glow ring
    const ringGeo = new THREE.TorusGeometry(3, 0.06, 8, 48);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0x9f7aea });
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
    const spot = new THREE.SpotLight(0xffd4ff, 2, 20, Math.PI / 5, 0.5);
    spot.position.set(0, 8, 2);
    scene.add(spot);
    const fill = new THREE.DirectionalLight(0xa0c0ff, 0.8);
    fill.position.set(-4, 3, 3);
    scene.add(fill);

    // Pet
    let group: THREE.Group;
    if (petId === 'snow') group = buildSnow(scene);
    else if (petId === 'hamster') group = buildHamster(scene);
    else group = buildRaccoon(scene);
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
  }, [petId, width, height, skillColor]);

  return <div ref={mountRef} style={{ width, height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />;
}
