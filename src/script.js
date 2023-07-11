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
import { buildRingGeometry, toMesh } from './utils'

const root = new THREE.Object3D();
// ================================================ SCENE ====================================================
const scene = new Scene();
scene.add(root);

// ================================================ OBJECTS ==================================================
const BaseWellString = {
  trajectoryX: [-4, -4.75, -5.5, -6.5, -7.2, -8.5, -9.2, -10.2, -11.4, -12.5, -14.7, -16.5, -18, -20, -25, -26, -27, -28, -29, -30],
  trajectoryY: [0, 0.15, 0.25, 0.45, 0.55, 0.6, 0.75, 0.84, 0.88, 1, 1.2, 1.5, 2, 3, 4, 5, 6, 7, 8, 9],
  tvd: [0, 0.2, 0.45, 0.55, 0.65, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 2.8, 3, 3.5, 5, 6, 7, 8]
};
let vectors = [];
const trajectoryX = BaseWellString.trajectoryX;
const trajectoryY = BaseWellString.trajectoryY;
const tvd = BaseWellString.tvd;
const minLength = Math.min(BaseWellString.trajectoryX.length, BaseWellString.trajectoryY.length, BaseWellString.tvd.length);
for (let index = 0; index < minLength; index++) {
  const vector = new THREE.Vector3(trajectoryX[index], trajectoryY[index], tvd[index]);
  vectors.push(vector);

  if (index > 0) {
    console.log(index, vector.angleTo(vectors[index - 1]))
  }
}
const lastPoint = vectors[vectors.length - 1];
const path = new THREE.CatmullRomCurve3(vectors);

// Drawing line
const lineGeometry = new THREE.BufferGeometry().setFromPoints(vectors);
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffff00
});
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Drawing tube
const radiusScale = 10;
const outerRadius = 0.5 * radiusScale;
const innerRadius = 0.4 * radiusScale;

const geometry = buildRingGeometry(outerRadius, innerRadius, path);
geometry.computeBoundingBox();
let { min, max } = geometry.boundingBox;

let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
let range = new THREE.Vector2(max.x - min.x, max.y - min.y);

const position = geometry.attributes.position;
const uvs = [];
for (let i = 0; i < position.count; i++) {
  const v3 = new Vector3().fromBufferAttribute(position, i);
  uvs.push((v3.x + offset.x) / range.x);
  uvs.push((v3.y + offset.y) / range.y);
}

geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
geometry.setAttribute('uv2', new THREE.BufferAttribute(new Float32Array(uvs), 2));
geometry.attributes.uv.needsUpdate = true;
geometry.attributes.uv2.needsUpdate = true;
// const geometry = new THREE.TubeGeometry(path, tubularSegemets, outerRadius, 8, false);
// const geometry = new THREE.PlaneGeometry(8, 10, 32, 16);
const images = [
  'uv_grid_opengl.jpg',
  'bha-node-rotating-effect.png',
  'ridged-metal-siding_ao.png',
  'ridged-metal-siding_roughness.png'
]
const texture = new THREE.TextureLoader().load(images[0]);
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

const material = new THREE.MeshBasicMaterial({
  map: texture,
  color: new THREE.Color(0xFF0000),
  // wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
root.add(mesh);

// ================================================ AxesHelper ===============================================
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// ================================================ CAMERA ===================================================
const camera = new PerspectiveCamera();
camera.position.set(lastPoint.x, lastPoint.y + 50, lastPoint.z);
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
const cen = path.getPointAt(0.5);
controls.target.set(cen.x, cen.y, cen.z);

// =============================================== RENDER LOOP ==============================================
const onAnimationFrameHandler = (timeStamp) => {
  renderer.render(scene, camera);
  if (texture) {
    texture.offset.x += 0.005;
  }
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
