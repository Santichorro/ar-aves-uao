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

## Reglas del equipo

- `main` siempre funcional; una rama por función; commits pequeños en español.
- Nunca force push; nunca subir claves ni archivos `.env`.
- Registrar autor y licencia de cada asset en `CREDITOS.md`.
