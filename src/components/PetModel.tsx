import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PetId } from '../types';

interface Props {
  petId: PetId;
  size?: number;
  animate?: boolean;
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
    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), new THREE.MeshLambertMaterial({ color: 0xffb6c1, flatShading: true }));
    innerEar.position.set(sx, 1.28, 0.05);
    group.add(innerEar);
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
  for (const [sx, sz] of [[-0.35, 0.3], [0.35, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.45, 6), new THREE.MeshLambertMaterial({ color: 0xeeeeee, flatShading: true }));
    leg.position.set(sx, -0.7, sz);
    group.add(leg);
  }
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
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.08, 0.52);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff8888 }));
  nose.position.set(0, 0.93, 0.52);
  group.add(nose);
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffb6c1, flatShading: true }));
    ear.position.set(sx, 1.35, 0.05);
    group.add(ear);
  }
  // Arms using CylinderGeometry instead of CapsuleGeometry for compatibility
  for (const sx of [-0.7, 0.7]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 6), new THREE.MeshLambertMaterial({ color: 0xffe4c4, flatShading: true }));
    arm.position.set(sx, 0.1, 0.5);
    arm.rotation.z = sx < 0 ? 0.5 : -0.5;
    group.add(arm);
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
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    shine.position.set(sx + 0.03, 1.03, 0.55);
    group.add(shine);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  nose.position.set(0, 0.86, 0.5);
  group.add(nose);
  for (const sx of [-0.38, 0.38]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshLambertMaterial({ color: 0x7a8fa0, flatShading: true }));
    ear.position.set(sx, 1.32, 0);
    group.add(ear);
    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true }));
    innerEar.position.set(sx, 1.32, 0.08);
    group.add(innerEar);
  }
  const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x8ca0b8, flatShading: true }));
  tailBase.position.set(0, -0.1, -0.95);
  tailBase.rotation.x = 0.8;
  group.add(tailBase);
  for (const sy of [0.2, -0.2]) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), new THREE.MeshLambertMaterial({ color: 0x2f4f4f, flatShading: true }));
    stripe.position.set(0, sy - 0.1, -0.95);
    stripe.rotation.x = 0.8;
    group.add(stripe);
  }
  for (const [sx, sz] of [[-0.35, 0.3], [0.35, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number, number][]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 6), new THREE.MeshLambertMaterial({ color: 0x7a8fa0, flatShading: true }));
    leg.position.set(sx, -0.75, sz);
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
    if (petId === 'snow') group = buildSnow(scene);
    else if (petId === 'hamster') group = buildHamster(scene);
    else group = buildRaccoon(scene);

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
