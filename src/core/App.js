// Une los módulos y controla el ciclo de vida de la app.
// Por ahora solo arranca la sesión AR (cámara + cubo de prueba) al cargar la página.
import { ArSession } from '../ar/ArSession.js';
import { SceneManager } from '../ar/SceneManager.js';
import { PlacementController } from '../ar/PlacementController.js';

// Estados documentados de onCameraStatusChange: requesting -> hasStream -> hasVideo.
const TEXTO_ESTADO = {
  requesting: 'Solicitando permiso de cámara…',
  hasStream: 'Cámara concedida. Preparando la escena…',
  hasVideo: 'Cámara lista. Apunta al suelo, mueve el teléfono despacio y toca.',
  failed: 'No se pudo abrir la cámara. Revisa el permiso en los ajustes del navegador.',
};

export class App {
  constructor() {
    this.escena = new SceneManager();
    this.sesion = new ArSession({
      onEstado: (estado) => this._alCambiarEstadoCamara(estado),
      onExcepcion: (error) => this._alFallar(error),
    });
    this.colocacion = new PlacementController({
      sesion: this.sesion,
      escena: this.escena,
      alAvisar: (texto) => this._instruir(texto),
    });
  }

  init() {
    const lienzo = document.getElementById('ar-canvas');
    // La sesión arranca al cargar la página: el aviso del navegador tiene que
    // aparecer nada más abrir la app (queja: "al iniciar no me solicita la cámara").
    this.sesion.start(lienzo, ({ scene, camera }) => {
      this.escena.init({ scene, camera });
      this.colocacion.activar();
      this._instruir(
        this.sesion.puedeColocar
          ? 'Apunta al suelo, mueve el teléfono despacio y toca.'
          : 'Escritorio: solo vista de cámara. Abre la app en un teléfono para colocar el cubo.',
      );
    });
  }

  _alCambiarEstadoCamara(estado) {
    const texto = TEXTO_ESTADO[estado.status];
    if (!texto) return;
    if (estado.status === 'failed') {
      // El binario además envía 'reason' (DENY_CAMERA / NO_CAMERA), pero ese dato no
      // figura en la documentación de onCameraStatusChange: TODO usarlo cuando esté.
      console.error('[AR] Estado de cámara:', estado);
    }
    if (estado.status === 'hasVideo' && !this.sesion.puedeColocar) {
      this._instruir('Escritorio: solo vista de cámara. Abre la app en un teléfono para colocar el cubo.');
      return;
    }
    this._instruir(texto);
  }

  _alFallar(error) {
    console.error('[AR] Excepción de la sesión:', error);
    this._instruir(`Error de la sesión AR: ${error && error.message ? error.message : error}`);
  }

  // Deja el mensaje visible en la pantalla AR (#ar-instruccion) y en la consola.
  _instruir(texto) {
    console.info('[AR]', texto);
    const elemento = document.getElementById('ar-instruccion');
    if (elemento) elemento.textContent = texto;
  }
}
