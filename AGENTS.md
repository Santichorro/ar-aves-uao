# Proyecto: guía AR de aves UAO (web)
- JavaScript, Vite, three.js, Howler. Todo gratuito.
- AR de superficie con el motor distribuido de 8th Wall en public/external/xr/ (no hay API key ni editor en la nube).
- 5 aves, un modelo GLB propio por ave: pellar, paloma, azulejo, pechirrojo, loro.
- Datos en public/data/aves.json; agregar un ave no debe requerir cambiar código.
- Estructura de src/: core, data, ar, birds, interactions, quiz, audio, ui, styles.
- Seguir la estructura y los nombres de archivo del documento_tecnico.md.
- No inventar APIs de 8th Wall: si algo no está en la documentación del binario, dejar un TODO.
- Trabajar en ramas, nunca force push, nunca subir claves ni archivos .env.