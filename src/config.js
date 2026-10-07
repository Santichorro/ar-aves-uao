// Constantes compartidas: rutas, escala AR, límites de rotación/escala y volúmenes.
// TODO: afinar los valores con el equipo (escala real de la escena y volúmenes finales).

export const RUTAS = {
  aves: './data/aves.json',
};

export const ESCALA_AR = {
  // Ajuste uniforme para que el ave quepa en pantalla sin perder proporciones.
  base: 1.0,
};

export const LIMITES = {
  rotacionMin: -Math.PI,
  rotacionMax: Math.PI,
  escalaMin: 0.5,
  escalaMax: 2,
};

export const VOLUMENES = {
  canto: 1,
  interfaz: 0.7,
  ambiente: 0.4,
};

// true: pide a la cámara una imagen 16:9 (menos recorte en vertical).
// Si la cámara falla o se ve estirada, poner false.
export const CAMARA_16_9 = true;

export const PRUEBA_AR = {
  // Cubo de viabilidad (día 1): 20 cm de lado, medidos en metros reales gracias a
  // XR8.XrController.configure({scale: 'absolute'}).
  cuboLado: 0.2,
};
