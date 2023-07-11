/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */
import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'

//================================================ SCENE ====================================================
const scene = new Scene();

//================================================ OBJECTS ==================================================
const geometry = new THREE.SphereGeometry(5, 16, 32);
const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//================================================ CAMERA ===================================================
const camera = new PerspectiveCamera();
camera.position.set(0, 10, 15);
camera.lookAt(new Vector3(0, 0, 0));

// =============================================== LIGHTS ===================================================
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.7);
scene.add(hemisphereLight);

// =============================================== RENDERER =================================================
const renderer = new WebGLRenderer({ antialias: true, canvas: document.querySelector('canvas.webgl') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xC0C0C0, 1);

// =============================================== CONTROLS =================================================
const controls = new OrbitControls(camera, renderer.domElement);

// =============================================== RENDER LOOP ==============================================
const onAnimationFrameHandler = (timeStamp) => {
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

// =============================================== RESIZE ===================================================
const windowResizeHanlder = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);
