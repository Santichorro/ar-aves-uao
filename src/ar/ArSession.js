// Inicia el motor 8th Wall: cámara y tracking (world tracking).
// APIs usadas (todas documentadas en https://8thwall.org/docs/api/engine/):
//   XR8.XrDevice.deviceEstimate(), XR8.XrController.configure() (scale / disableWorldTracking),
//   XR8.addCameraPipelineModules(), XR8.run(), XR8.Threejs.xrScene(),
//   XR8.XrController.updateCameraProjectionMatrix() y los callbacks
//   onStart / onCameraStatusChange / onException de un CameraPipelineModule.
import * as THREE from 'three';
import { MODO_CAMARA } from '../config.js';

// El módulo Threejs del motor lanza "window.THREE does not exist..." si la global
// no está puesta, y hay que fijarla antes de registrar los módulos de la pipeline.
window.THREE = THREE;

export class ArSession {
  // onEstado({status, ...}) refleja el ciclo de cámara: requesting -> hasStream ->
  // hasVideo (o failed). onExcepcion(error) recibe las excepciones del motor.
  constructor({ onEstado = () => {}, onExcepcion = () => {} } = {}) {
    this._onEstado = onEstado;
    this._onExcepcion = onExcepcion;
    this._enMarcha = false;
    this._conTracking = false;
  }

  // Solo con world tracking (celular) el hitTest devuelve superficie útil.
  get puedeColocar() {
    return this._enMarcha && this._conTracking;
  }

  // Pide la cámara y arranca la pipeline. Cuando la escena three.js existe,
  // llama a onReady con el resultado de XR8.Threejs.xrScene().
  start(canvas, onReady = () => {}) {
    if (this._enMarcha) return;
    this._enMarcha = true;
    this._esperarMotor()
      .then((XR8) => this._arrancar(XR8, canvas, onReady))
      .catch((error) => {
        this._enMarcha = false;
        this._onExcepcion(error);
      });
  }

  // El script de index.html es async: espera el evento 'xrloaded'. El binario fija
  // window.XR8 primero y solo después emite el evento, y como index.html trae
  // data-preload-chunks="slam", al llegar aquí ya está cargado XR8.XrController.
  _esperarMotor() {
    if (window.XR8) return Promise.resolve(window.XR8);
    return new Promise((resolver, rechazar) => {
      const alCargar = () => {
        clearTimeout(temporizador);
        resolver(window.XR8);
      };
      const temporizador = setTimeout(() => {
        window.removeEventListener('xrloaded', alCargar);
        rechazar(new Error('No cargó external/xr/xr.js (revisa la consola del navegador).'));
      }, 15000);
      window.addEventListener('xrloaded', alCargar, { once: true });
    });
  }

  _ajustarCanvas(canvas) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = W;
  let h = H;

  if (MODO_CAMARA === 'sin-zoom' && this._aspectoVideo) {
    const largo = Math.max(this._aspectoVideo, 1 / this._aspectoVideo); // >= 1
    const ratio = H >= W ? 1 / largo : largo;                            // ancho/alto del feed
    if (W / H > ratio) w = H * ratio;
    else h = W / ratio;
  }

  Object.assign(canvas.style, {
    position: 'fixed',
    inset: 'auto',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${w}px`,
    height: `${h}px`,
  });
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
}

_programarAjuste(canvas) {
  const ajustar = () => this._ajustarCanvas(canvas);
  const conRetraso = () => { ajustar(); setTimeout(ajustar, 300); };
  window.addEventListener('resize', conRetraso);
  window.addEventListener('orientationchange', conRetraso);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', conRetraso);
}

  _arrancar(XR8, canvas, onReady) {
    // deviceEstimate().os es la forma documentada de saber el sistema (iOS / Android).
    const esMovil = ['iOS', 'Android'].includes(XR8.XrDevice.deviceEstimate().os);
    this._conTracking = esMovil;

    if (esMovil) {
      // 'absolute' devuelve posiciones en metros: es lo que hace que el cubo mida
      // 20 cm de verdad. Debe configurarse antes de XR8.run() (así lo exige el motor).
      XR8.XrController.configure({ scale: 'absolute' });
    } else {
      // El binario rechaza cámara + world tracking fuera de móviles
      // ("[XR] Reality with camera on non-mobile devices requires disableWorldTracking").
      // TODO: ese mensaje vive en el binario y no aparece en la página de configure(),
      // pero disableWorldTracking() sí es la API documentada para desactivar SLAM.
      XR8.XrController.configure({ disableWorldTracking: true });
    }

    this._ajustarCanvas(canvas);
    this._programarAjuste(canvas);

    // Orden documentado en XR8.Threejs.pipelineModule(): XrController, luego
    // GlTextureRenderer (dibuja el feed) antes que Threejs, y el módulo propio
    // al final, que así puede usar XR8.Threejs.xrScene() dentro de su onStart.
    XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    {
      name: 'aves-uao',
      onStart: () => {
        const { scene, camera } = XR8.Threejs.xrScene();
        if (this._conTracking) {
          // Sincroniza el origen del tracking con la escena (ejemplo de la doc).
          XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
          });
        }
        onReady({ scene, camera });
      },
      onVideoSizeChange: ({ videoWidth, videoHeight, canvasWidth, canvasHeight }) => {
        console.info('[AR] video', videoWidth, videoHeight, 'canvas', canvasWidth, canvasHeight);
        this._aspectoVideo = videoWidth / videoHeight;
        this._ajustarCanvas(canvas);
      },
      onCameraStatusChange: (estado) => this._onEstado(estado),
      onException: (error) => this._onExcepcion(error),
    },
  ]);

    XR8.run({
      canvas,
      // Con world tracking hay que permitir móviles y visores; en escritorio, al no
      // haber tracking, ANY hace que igual se abra la cámara (pide el permiso).
      allowedDevices: esMovil
        ? XR8.XrConfig.device().MOBILE_AND_HEADSETS
        : XR8.XrConfig.device().ANY,
    });
  }
}
