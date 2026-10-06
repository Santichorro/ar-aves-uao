// Colocación: al tocar la pantalla se consulta al motor con hitTest() y, si hay
// superficie, SceneManager ancla el cubo en ese punto.
// TODO: más adelante reemplazar el cubo por el ave y agregar un reticle de apunte.
export class PlacementController {
  // sesion: ArSession (para saber si hay tracking). escena: SceneManager.
  // alAvisar(texto): escribe el mensaje en #ar-instruccion.
  constructor({ sesion, escena, alAvisar = () => {} }) {
    this._sesion = sesion;
    this._escena = escena;
    this._alAvisar = alAvisar;
    this._activo = false;
    this._alTocar = this._alTocar.bind(this);
  }

  activar() {
    if (this._activo) return;
    this._activo = true;
    // Se escucha en window porque las pantallas (.screen) quedan encima del canvas
    // y se comerían el toque; además así funciona igual con ratón y con dedo.
    window.addEventListener('pointerdown', this._alTocar);
  }

  _alTocar(evento) {
    const alvo = evento.target;
    // Los controles de la interfaz no deben colocar objetos.
    if (alvo && alvo.closest && alvo.closest('button, a, input, textarea, select, #ar-panel-hotspot')) {
      return;
    }

    if (!this._sesion.puedeColocar) {
      this._alAvisar('Sin seguimiento 3D en este dispositivo: abre la app en un teléfono para colocar el cubo.');
      return;
    }

    const XR8 = window.XR8;
    if (!XR8 || !XR8.XrController) return;

    // Coordenadas normalizadas 0..1 del feed de cámara (ejemplo de hitTest()).
    const caja = document.getElementById('ar-canvas').getBoundingClientRect();
    const x = (evento.clientX - caja.left) / caja.width;
    const y = (evento.clientY - caja.top) / caja.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return; // toque en las barras negras
    let aciertos = [];
    try {
      aciertos = XR8.XrController.hitTest(x, y, ['FEATURE_POINT']);
    } catch (error) {
      // El motor todavía no tiene lista la prueba de rayos: se reintenta con el próximo toque.
      console.warn('[AR] hitTest no disponible todavía:', error);
    }
    const acierto = aciertos[0];

    const tipos = aciertos.map((a) => a.type).join(', ') || 'ninguno';
    console.info('[AR] hitTest:', aciertos.length, tipos, acierto);

    if (!acierto) {
      this._escena.colocarCuboDelanteDeCamara(1.5);
      this._alAvisar('hitTest vacío: cubo de prueba a 1,5 m al frente.');
      return;
    }

    this._escena.colocarCuboEn(acierto.position);
    this._alAvisar(`Cubo colocado. hitTest: ${tipos}, a ${acierto.distance.toFixed(2)} m.`);
  }
}
