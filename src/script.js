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
import { buildRingGeometry } from './utils'

// ================================================ SCENE ====================================================
const scene = new Scene();

// ================================================ OBJECTS ==================================================
const BaseWellString = {
  trajectoryX: [1.15, 1.05, 0, 0],
  trajectoryY: [0.25, 0.25, 0, 0],
  tvd: [-5, 0, 5, 10],
};
let vectors = [];
const trajectoryX = BaseWellString.trajectoryX;
const trajectoryY = BaseWellString.trajectoryY;
const tvd = BaseWellString.tvd;
const minLength = Math.min(BaseWellString.trajectoryX.length, BaseWellString.trajectoryY.length, BaseWellString.tvd.length);
for (let index = 0; index < minLength; index++) {
  vectors.push(new THREE.Vector3(trajectoryX[index], trajectoryY[index], tvd[index]));
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
const outerRadius = 0.5;
const innerRadius = 0.4;

const geometry = buildRingGeometry(outerRadius, innerRadius, path);
geometry.computeVertexNormals();
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
let { min, max } = geometry.boundingBox;

let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
let range = new THREE.Vector2(max.x - min.x, max.y - min.y);
console.log(offset, range)

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
const texture = new THREE.TextureLoader().load('bha-node-rotating-effect.png');
texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
texture.repeat.set(1, 1)

const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0xFF0000),
  map: texture,
  depthWrite: true,
  opacity: 1,
  side: THREE.DoubleSide,
  transparent: false,
  // wireframe: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// ================================================ AxesHelper ===============================================
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// ================================================ CAMERA ===================================================
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
