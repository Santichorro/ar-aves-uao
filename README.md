# Guía AR de aves UAO

App web de realidad aumentada (superficie / world tracking) con 5 aves del campus UAO: pellar, paloma, azulejo, pechirrojo y loro cabeciazul.

- **Stack:** JavaScript, Vite, three.js, Howler.js, motor distribuido de 8th Wall (en `public/external/xr/`).
- **Datos:** `public/data/aves.json` (un registro por ave; agregar un ave no requiere cambiar código).
- **Estructura:** ver sección 5 de `Documento t�cnico_ gu�a AR de aves UAO.md`.

## Uso

```bash
npm install
npm run dev
```

`vite.config.js` habilita HTTPS local (`@vitejs/plugin-basic-ssl`) y `base: './'`, necesario para la cámara en el celular. Abrir la dirección `https://IP-DEL-PC:5173` en el teléfono y aceptar el aviso del certificado.

```bash
npm run build   # build de producción en dist/
npm run preview # previsualizar dist/
```

## Probar la sesión AR (cubo de 20 cm)

Prueba de viabilidad de `feature/ar-core`: al abrir la app se pide la cámara y, al tocar
el suelo, queda anclado un cubo de 20 cm.

1. `npm run dev` y abrir `https://IP-DEL-PC:5173` en el teléfono (aceptar el aviso del
   certificado). En escritorio se puede abrir igual: tiene que aparecer el permiso de
   cámara al cargar la página.
2. En el teléfono, moverlo despacio 2–3 segundos para que el motor estime la escala
   métrica (`scale: 'absolute'`), y tocar el suelo.
3. Esperar el cubo turquesa con bordes blancos. Volver a tocar lo mueve de sitio.
4. El estado de cámara y los avisos se guardan en `#ar-instruccion` y se escriben en la
   consola del navegador con el prefijo `[AR]`. Todavía no hay menú de navegación, así
   que la pantalla de bienvenida queda encima del feed de cámara (se ve transparente) y
   el cubo se coloca tocando cualquier punto que no sea un botón.

Si algo falla:

- No aparece el permiso → el permiso está denegado para el sitio (icono de cámara en la
  barra de direcciones) o se abrió por HTTP en vez de HTTPS.
- "Todavía no hay superficie" → el motor aún no encontró puntos del suelo: asegurarse de
  apuntar al suelo con textura y luz, y mover el teléfono en círculos lentos.
- En escritorio no se coloca el cubo: es esperado. El motor rechaza cámara + world
  tracking fuera de móviles, así que la app corre con `disableWorldTracking: true` y solo
  muestra la cámara. La colocación se prueba en el teléfono.


## Reglas del equipo

- `main` siempre funcional; una rama por función; commits pequeños en español.
- Nunca force push; nunca subir claves ni archivos `.env`.
- Registrar autor y licencia de cada asset en `CREDITOS.md`.
