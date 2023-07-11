import * as THREE from 'three'

export function rotateAroundObjectAxis(object, axis, radians) {
  const matrix = new THREE.Matrix4();
  matrix.makeRotationAxis(axis.normalize(), radians);

  // old code for Three.JS pre r54:
  // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
  // new code for Three.JS r55+:
  object.matrix.multiply(matrix);

  // old code for Three.js pre r49:
  // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
  // old code for Three.js r50-r58:
  // object.rotation.setEulerFromRotationMatrix(object.matrix);
  // new code for Three.js r59+:
  object.rotation.setFromRotationMatrix(object.matrix);
}

// Rotate an object around an arbitrary axis in world space
export function rotateAroundWorldAxis(object, axis, radians) {
  const matrix = new THREE.Matrix4();
  matrix.makeRotationAxis(axis.normalize(), radians);

  // old code for Three.JS pre r54:
  //  rotationMatrix.multiply(object.matrix);
  // new code for Three.JS r55+:
  matrix.multiply(object.matrix);                // pre-multiply

  object.matrix = matrix;

  // old code for Three.js pre r49:
  // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
  // old code for Three.js pre r59:
  // object.rotation.setEulerFromRotationMatrix(object.matrix);
  // code for r59+:
  object.rotation.setFromRotationMatrix(object.matrix);
}

export function buildRingGeometry(outerRadius, innerRadius, path) {
  const shape = new THREE.Shape();
  const sAngle = THREE.MathUtils.degToRad(-180);
  const eAngle = THREE.MathUtils.degToRad(180);
  shape.absarc(0, 0, outerRadius, sAngle, eAngle, false);
  shape.absarc(0, 0, innerRadius, eAngle, sAngle, true);

  const tubularSegments = Math.round(path.getLength());
  return new THREE.ExtrudeGeometry(shape, {
    curveSegments: 4,
    extrudePath: path,
    steps: tubularSegments
  })
}

export  function buildSphere(radius) {
  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  return new THREE.Mesh(geometry, material);
}

export function toMesh(mesh) {
  const position = mesh.geometry.attributes.position;
  const vector = new THREE.Vector3();
  const division = 1 / 100;
  for (let i = 0; i < position.count; i++) {
    vector.fromBufferAttribute(position, i);
    vector.applyMatrix4(mesh.matrixWorld);

    const updateX = vector.x * Math.cos(division) - vector.y * Math.sin(division);
    const updateY = vector.y * Math.cos(division) + vector.x * Math.sin(division);
    mesh.geometry.attributes.position.setX(i, updateX);
    mesh.geometry.attributes.position.setY(i, updateY);
    mesh.geometry.dispose();
    // const _sphere = sphere.clone();
    // _sphere.position.set(vector.x, vector.y, vector.z);
    // scene.add(_sphere);
    // if (i === 0) break
  }
}