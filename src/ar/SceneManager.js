// Escena three.js: luces y objetos de la sesión AR.
// El render lo hace el motor (XR8.Threejs.pipelineModule() dibuja cada frame), así
// que aquí NO se abre un bucle requestAnimationFrame propio.
import * as THREE from 'three';
import { PRUEBA_AR } from '../config.js';

export class SceneManager {
  constructor() {
    this.escena = null;
    this.camara = null;
    this.cubo = null;
  }

  // Recibe la escena creada por el motor (XR8.Threejs.xrScene()).
  init({ scene, camera }) {
    this.escena = scene;
    this.camara = camera;
    this._crearLuces();
    this._crearCubo();
  }

  // Luz ambiente + direccional: los modelos GLB del ave van a necesitar
  // iluminación, y el motor no agrega luces a la escena.
  _crearLuces() {
    const ambiente = new THREE.AmbientLight(0xffffff, 1.4);
    const direccional = new THREE.DirectionalLight(0xffffff, 2.2);
    direccional.position.set(0.5, 3, 1);
    this.escena.add(ambiente, direccional);
  }

  // Cubo de prueba de 20 cm, invisible hasta que el usuario toca la superficie.
  // MeshBasicMaterial a propósito: el cubo se ve aunque la iluminación falle.
  _crearCubo() {
    const lado = PRUEBA_AR.cuboLado;
    const caja = new THREE.BoxGeometry(lado, lado, lado);
    const cubo = new THREE.Mesh(caja, new THREE.MeshBasicMaterial({ color: 0x2ec4b6 }));
    const bordes = new THREE.LineSegments(
      new THREE.EdgesGeometry(caja),
      new THREE.LineBasicMaterial({ color: 0xffffff }),
    );
    cubo.add(bordes);
    cubo.visible = false;
    this.cubo = cubo;
    this.escena.add(cubo);
  }

  // Ancla el cubo en el punto devuelto por hitTest() (posición en metros).
  // Se sube media altura para que apoye sobre la superficie y no quede enterrado.
  colocarCuboEn({ x, y, z }) {
    if (!this.cubo) return;
    this.cubo.position.set(x, y + PRUEBA_AR.cuboLado / 2, z);
    this.cubo.visible = true;
  }
}
