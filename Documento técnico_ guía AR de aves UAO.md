# Documento técnico de planeación: guía AR de aves UAO

**Fundamentos de Realidad Virtual · Parcial 2 · WebAR con world tracking**

---

## 1. Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Plataforma | Web (sin APK, sin Unity) |
| Tipo de AR | Superficie (world tracking) |
| Dispositivos de la demo | Android e iPhone |
| Representación del ave | Un modelo 3D (GLB) propio por ave, sin familias de rig por ahora |
| Aves iniciales | Pellar, Paloma, Azulejo, Pechirrojo y Loro |
| Alcance | 5 aves iniciales (ave piloto primero), escalable a más de 90 con preset de datos |
| Lenguaje | JavaScript |
| Costo | Todo gratuito por ahora |
| Equipo | 4 o más personas |
| Plazo | 1 semana |

## 2. Estado de 8th Wall y estrategia tecnológica

La plataforma alojada de 8th Wall terminó el 28 de febrero de 2026 (sin login ni editor en la nube). Lo que sigue disponible es el **motor distribuido (binario gratuito, de código cerrado, sin modificar ni redistribuir alterado)** y el material de migración. Hay que **verificar en el día 1** cómo se descarga e integra con su documentación actual.

**Por qué mantenerlo:** Safari en iOS no soporta WebXR, y el seguimiento de superficie en iPhone era la fortaleza de este motor.

**Estrategia en dos niveles:**

- **Plan A:** motor 8th Wall + A-Frame o three.js, alojado por el equipo con HTTPS.
- **Plan B (si la prueba del día 1 falla):**
  - Android: WebXR (Chrome) con three.js.
  - iPhone: tarjeta con marcador usando MindAR (image tracking).
  - Alternativa: evaluar otro SDK de world tracking para web, como Zappar.

**Criterio de decisión (fin del día 1):** un cubo aparece y se mantiene anclado sobre una superficie en un Android y un iPhone reales. Si no, se activa el Plan B.

## 3. Arquitectura

App de una sola página, sin backend, con todo estático.

```
Navegador (Android / iOS)
 ├─ UI (HTML/CSS/JS): pantallas, ficha, quiz, HUD
 ├─ Motor AR (8th Wall / WebXR): cámara, tracking, anclaje
 ├─ Escena 3D (A-Frame o three.js): ave, hábitat, hotspots
 ├─ Datos: aves.json (preset por ave)
 └─ Audio: canto, interfaz, ambiente
Hosting estático con HTTPS (GitHub Pages, Netlify o Vercel)
```

## 4. Stack propuesto (JavaScript, todo gratuito)

### 4.1 Decisión: three.js o A-Frame

| Criterio | three.js | A-Frame |
| --- | --- | --- |
| Curva de aprendizaje | Media (JavaScript puro) | Baja (etiquetas HTML y componentes) |
| Control del comportamiento (vuelo por ave, trayectorias, gestos) | Total | Hay que escribir componentes propios |
| Carga dinámica de aves desde JSON | Natural | Posible, con más código de componentes |
| Escalar a 90+ aves | Muy bien | Bien, con orden |
| Prototipado rápido de escenas simples | Medio | Muy rápido |
| Integración con el motor de 8th Wall | Compatible | Compatible |

**Recomendación: three.js.** El proyecto está dirigido por datos (cada ave trae su perfil de movimiento, familia y textura) y necesita lógica propia de vuelo, gestos y quiz. En three.js eso es código normal; en A-Frame se vuelve un conjunto de componentes que hay que diseñar igual. **Elegir A-Frame solo si** el equipo tiene poca experiencia en 3D y prioriza armar rápido las primeras escenas. Se decide el día 1 junto con la prueba del cubo, y no se cambia después.

### 4.2 Herramientas y costo

| Uso | Herramienta | Costo |
| --- | --- | --- |
| AR (Plan A) | Motor distribuido de 8th Wall | Gratis (código cerrado, sin modificar) |
| AR (Plan B) | WebXR y MindAR | Gratis, código abierto |
| 3D | three.js (o A-Frame) | Gratis, MIT |
| Entorno de desarrollo | Node.js, Vite y VS Code | Gratis |
| Audio | Howler.js | Gratis, MIT |
| Modelado y animación | Blender | Gratis |
| Optimización de GLB | gltf-transform, gltf.report | Gratis |
| Modelos descargados | Sketchfab (CC), Poly Pizza, Quaternius, Kenney | Gratis, revisar licencia |
| Control de versiones | Git y GitHub | Gratis |
| Hosting con HTTPS | GitHub Pages, Netlify o Vercel (planes gratuitos) | Gratis |

Evitar por ahora servicios de pago o con créditos limitados (generadores 3D con IA solo para pruebas puntuales). Los audios y textos salen de la base de datos de la UAO.

## 5. Estructura del repositorio

Se organiza por responsabilidad (AR, aves, quiz, audio, UI, datos), de modo que agregar aves o funciones no obligue a tocar lo existente.

```
ar-aves-uao/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
├─ CREDITOS.md
├─ .gitignore
├─ public/                         // se copia tal cual al build
│  ├─ external/xr/                 // motor distribuido de 8th Wall
│  ├─ data/aves.json               // un registro por ave
│  ├─ audio/ui/                    // click, acierto, error, logro, ambiente
│  └─ aves/
│     ├─ pellar/   (modelo.glb, mini.jpg, canto.mp3, fotos/)
│     ├─ paloma/
│     ├─ azulejo/
│     ├─ pechirrojo/
│     └─ loro/
└─ src/
   ├─ main.js
   ├─ config.js
   ├─ core/        (App.js, Router.js, EventBus.js, State.js)
   ├─ data/        (BirdRepository.js)
   ├─ ar/          (ArSession.js, SceneManager.js, PlacementController.js, GestureController.js)
   ├─ birds/       (BirdLoader.js, Bird.js)
   ├─ interactions/(HotspotManager.js, HabitatScene.js, SizeComparer.js)
   ├─ quiz/        (QuizManager.js, QuizUI.js)
   ├─ audio/       (AudioManager.js)
   ├─ ui/          (screens/*.js, components/*.js)
   └─ styles/      (main.css)
```

### Responsabilidad de cada archivo

| Archivo | Clase o función | Qué hace |
| --- | --- | --- |
| `main.js` | arranque | Crea `App`, carga datos y muestra la bienvenida |
| `config.js` | constantes | Rutas, escala AR, límites de rotación y escala, volúmenes |
| `core/App.js` | `App` | Une módulos y controla el ciclo de vida |
| `core/Router.js` | `Router` | Cambia entre pantallas (bienvenida, catálogo, ficha, AR, quiz, resultado, créditos) |
| `core/EventBus.js` | `EventBus` | Eventos entre módulos (`ave:colocada`, `quiz:acierto`) sin acoplarlos |
| `core/State.js` | `State` | Estado actual: ave elegida, puntaje, pregunta, fase |
| `data/BirdRepository.js` | `BirdRepository` | Lee `aves.json`; `getAll()`, `getById(id)` |
| `ar/ArSession.js` | `ArSession` | Inicia el motor 8th Wall, cámara y tracking |
| `ar/SceneManager.js` | `SceneManager` | Escena three.js, luces y bucle de render |
| `ar/PlacementController.js` | `PlacementController` | Reticle y colocación del ave sobre la superficie |
| `ar/GestureController.js` | `GestureController` | Rotar (un dedo) y escalar (pellizco) |
| `birds/BirdLoader.js` | `BirdLoader` | Carga el GLB bajo demanda y lo guarda en caché |
| `birds/Bird.js` | `Bird` | Modelo, `AnimationMixer`; `play('canto')`, `setScale()` |
| `interactions/HotspotManager.js` | `HotspotManager` | Puntos de información sobre el ave y sus paneles |
| `interactions/HabitatScene.js` | `HabitatScene` | Árbol, nido y alimento alrededor del ave |
| `interactions/SizeComparer.js` | `SizeComparer` | Referencia a escala real (opcional) |
| `quiz/QuizManager.js` | `QuizManager` | Preguntas, validación y puntaje |
| `quiz/QuizUI.js` | `QuizUI` | Opciones flotantes en 3D y retroalimentación |
| `audio/AudioManager.js` | `AudioManager` | Howler: canto, interfaz y ambiente; activa audio en iOS |
| `ui/screens/*.js` | una clase por pantalla | Pinta y conecta cada pantalla del HTML |
| `ui/components/*.js` | tarjetas, panel, botones | Piezas reutilizables |

## 6. Modelo de datos (preset)

### 6.1 Registro por ave (`aves.json`)

```json
{
  "id": "pellar",
  "nombre": "Nombre común",
  "cientifico": "Nombre científico",
  "descripcion": "...",
  "habitat": "...",
  "dieta": "...",
  "zonaCampus": "...",
  "datoCurioso": "...",
  "conservacion": "...",
  "tamanoRealCm": 14,
  "escalaAR": 1.0,
  "modelo": "aves/pellar/modelo.glb",
  "animaciones": { "idle": "Idle", "vuelo": "Fly", "canto": "Sing", "comer": "Eat" },
  "miniatura": "aves/pellar/mini.jpg",
  "canto": "aves/pellar/canto.mp3",
  "fotos": ["aves/pellar/1.jpg"],
  "hotspots": [{ "ancla": "pico", "texto": "..." }],
  "quiz": [{ "pregunta": "...", "opciones": ["..."], "correcta": 0, "retro": "..." }]
}
```

- `modelo`: GLB propio de cada ave (un modelo por ave por ahora). `animaciones` traduce los nombres de clips de cada modelo a los nombres que usa el código.
- `tamanoRealCm`: el código calcula la escala real; `escalaAR` la ajusta de forma uniforme para que quepa en pantalla sin perder proporciones entre aves.
- `hotspots` usan **anclas con nombre** (pico, ala, pata, cola) que cada modelo trae como objetos vacíos con ese nombre dentro del GLB (convención de la sección 16), por lo que el código no necesita coordenadas por ave.

### 6.2 Fase futura: perfil de movimiento y familias de rig

Por ahora cada una de las 5 aves usa su propio modelo con sus animaciones. Si el catálogo crece (más de 90 aves), se podrá agregar un campo `movimiento` (tipo de vuelo, velocidad, trayectoria) y plantillas de rig por tipo de cuerpo (paseriforme, colibrí, ave de presa, zancuda, acuática), cambiando solo textura y tamaño por especie. La estructura actual lo permite sin reescribir el código: `Bird.js` ya aísla modelo y animaciones.

### 6.4 Carga bajo demanda

No se cargan todos los modelos al inicio. El catálogo usa solo la **miniatura** y los datos; al elegir un ave se descarga su modelo y su canto. Límite: menos de 5 MB por ave. Agregar un ave nueva es un registro más (y su carpeta con modelo, fotos y canto); el código no cambia.

## 7. Flujo de pantallas

1. **Bienvenida:** botón "Comenzar" (activa audio y pide permiso de cámara).
2. **Ficha del ave:** datos, fotos, canto, botón "Ver en AR".
3. **AR:** instrucción de escaneo del suelo, reticle, toque para colocar el ave, interacciones.
4. **Quiz AR:** preguntas con opciones flotantes.
5. **Resultado:** puntaje, insignia "Observador UAO", reintentar o ver otra ave.
6. **Créditos:** autores y licencias de modelos, sonidos e imágenes.

## 8. Interacciones AR (mínimo 5) y cómo se implementan

| # | Interacción | Implementación |
| --- | --- | --- |
| 1 | Colocación y aparición del ave | Reticle sobre la superficie; al tocar se instancia el modelo con animación de llegada y canto |
| 2 | Rotar y escalar | Gestos de un dedo (rotar) y pellizco (escala) con límites de tamaño |
| 3 | Hotspots informativos | Esferas o íconos sobre el modelo; al tocarlos abren panel con texto, foto o audio |
| 4 | Animaciones por toque | Tocar el ave dispara clips: canto, vuelo, comer |
| 5 | Escena de hábitat | Botón que coloca árbol, nido o alimento alrededor del ave |
| 6 | Comparador de tamaño (opcional) | Referencia (mano o taza) a escala real junto al ave |

## 9. Quiz AR: "Reto del observador"

- Tras la exploración, la app muestra la pregunta en el HUD y **opciones flotantes en 3D** alrededor del ave (tarjetas con imagen, ícono o botón de sonido).
- El usuario toca la respuesta. Acierto: animación del ave, partículas y sonido de logro. Error: sonido suave y retroalimentación con la explicación.
- Tipos de pregunta: identificar el canto (opciones de audio), identificar el hábitat o la dieta (opciones de imagen), ubicar la parte del cuerpo (tocar el hotspot correcto).
- Puntaje por acierto, 3 a 5 preguntas por ave, insignia final.

## 10. Pipeline de assets

1. **Modelo:** buscar en Sketchfab, Poly Pizza, Quaternius o Kenney (ver filtros de licencia y animación). Si no hay uno adecuado, modelo low-poly propio en Blender.
2. **Optimización:** revisar en gltf.report, comprimir con gltf-transform (Draco), objetivo menos de 5 MB y menos de unos 30k triángulos.
3. **Animaciones:** confirmar clips (idle, vuelo, canto). Si faltan, crearlos en Blender o animar las alas por código.
4. **Audio:** MP3 o OGG livianos, normalizados en volumen.
5. **Imágenes:** JPG o WebP, ancho máximo 1200 px.
6. **Licencias:** registrar autor, fuente y licencia de cada asset en `CREDITOS.md` desde que se descarga.
7. **Respaldo:** si no hay modelo viable, usar un ave 2D animada (billboard) con la misma lógica.

## 11. Roles sugeridos (4 o más personas)

| Rol | Responsabilidad |
| --- | --- |
| Líder técnico / AR | Motor AR, anclaje, rotación y escala, integración |
| Desarrollo de interacciones y quiz | Hotspots, animaciones, lógica del quiz |
| Arte 3D y assets | Modelo, animaciones, optimización, licencias |
| UI/UX y audio | Pantallas, HUD, sonidos, identidad visual |
| Contenido y pitch (si son 5) | Textos de la base de datos de la UAO, preguntas, presentación y guion |

Si son 4, el contenido y el pitch se reparten entre UI/UX y el líder técnico.

## 12. Cronograma de 7 días

| Día | Objetivo | Entregable |
| --- | --- | --- |
| 1 | Prueba de viabilidad | Cubo anclado en Android e iPhone, hosting con HTTPS, repositorio. Decisión Plan A o B |
| 2 | Ave en AR | Modelo cargado, colocación y animación idle. Textos de la UAO recopilados |
| 3 | Ficha y audio | Ficha informativa desde JSON, canto y sonidos de interfaz |
| 4 | Interacciones | Rotar, escalar, hotspots y animaciones por toque |
| 5 | Hábitat y quiz | Escena de hábitat, quiz AR con retroalimentación y puntaje |
| 6 | Pulido y pruebas | Pruebas en varios celulares, optimización, créditos, preset verificado con una segunda ave de prueba |
| 7 | Cierre | Ensayo del pitch, video de respaldo de la demo, versión final desplegada |

**Regla:** congelar funciones nuevas al final del día 5.

## 13. Pruebas

- Android (Chrome) e iPhone (Safari), al menos 2 modelos de cada uno.
- Permiso de cámara, audio tras el primer toque, rotación de pantalla.
- Iluminación variada y superficies poco texturizadas (el tracking falla en pisos lisos o muy oscuros).
- Rendimiento: fluidez de unos 30 fps y carga inicial menor a 10 segundos con datos móviles.
- Prueba del preset: agregar una ave nueva solo con datos y assets, y comparar el vuelo de al menos dos aves de tamaño distinto (pequeña y grande).

## 14. Riesgos y mitigación

| Riesgo | Mitigación |
| --- | --- |
| Motor de 8th Wall no se integra | Plan B (WebXR + MindAR) decidido el día 1 |
| Tracking inestable en iPhone | Superficies con textura, buena luz, instrucciones en pantalla |
| Modelo sin animaciones adecuadas | Animar por código o crear clips en Blender |
| Archivos pesados | Compresión Draco, texturas reducidas, carga bajo demanda |
| Aves de tamaños y vuelos distintos | Animaciones propias por modelo; perfiles y familias quedan para la fase futura |
| Costos inesperados | Solo herramientas gratuitas y planes gratuitos de hosting |
| Audio bloqueado en iOS | Iniciar el audio con el botón "Comenzar" |
| Falla en la demo | Video grabado, internet de respaldo y dos dispositivos cargados |
| Problemas de licencias | `CREDITOS.md` desde el día 1 |

## 15. Criterios de aceptación

- Funciona desde un enlace en Android e iPhone, sin instalar nada.
- Al menos 5 interacciones AR operativas.
- Quiz AR completo con puntaje y retroalimentación.
- Información, imágenes y sonido provenientes de la base de datos de la UAO.
- Sonidos acordes a cada acción.
- Agregar un ave nueva solo requiere un registro y sus assets, y cada ave usa su propio modelo y animaciones.
- Todo el stack usado es gratuito.
- Pitch de 5 minutos con demo en vivo y respaldo.

## 16. Las 5 aves iniciales

Datos tomados de la guía de aves de la UAO (confirmar las especies con la base de datos antes de redactar las fichas).

| id | Ave | Especie | Nota |
| --- | --- | --- | --- |
| `pellar` | Pellar | *Vanellus chilensis* (Southern Lapwing) | Pecho negro, vientre blanco, cabeza gris, llamada fuerte |
| `paloma` | Paloma | *Columba livia* (Paloma doméstica) | La guía también incluye la Paloma grande (*Patagioenas fasciata*); acordar cuál usar |
| `azulejo` | Azulejo común | *Thraupis episcopus* (Blue-gray Tanager) | Gris azulado, pico robusto, se percha en cables |
| `pechirrojo` | Pechirrojo | *Pyrocephalus rubinus* (Vermilion Flycatcher) | Macho rojo brillante con antifaz marrón; hembra gris parduzca |
| `loro` | Loro cabeciazul | *Pionus menstruus* (Blue-headed Parrot) | Verde con cabeza azul, cola corta, aleteo profundo |

### Convención para los 5 modelos GLB (para que el código sea el mismo)

- Origen en los pies del ave, orientada hacia +Z, escala en metros reales (el código la ajusta con `tamanoRealCm`).
- Animaciones mínimas: idle, canto y una de aleteo o vuelo corto. Nombres libres, mapeados en `animaciones` del JSON.
- Objetos vacíos para los hotspots: `ancla_pico`, `ancla_ala`, `ancla_pata`, `ancla_cola`.
- Menos de 5 MB, texturas de máximo 1024 px, comprimido con gltf-transform (Draco).
- Autor y licencia anotados en `CREDITOS.md`.

## 17. Paso a paso de inicio

### Paso 0: requisitos (todo gratuito)

Node.js LTS, Git, Visual Studio Code, cuenta de GitHub, Chrome, un Android y un iPhone en la misma red wifi.

### Paso 1: crear el repositorio en GitHub (una persona)

1. En github.com: **New repository** → nombre `ar-aves-uao`.
2. Marcarlo **Public** (GitHub Pages gratuito lo requiere en cuentas gratuitas), con README y `.gitignore` de Node.
3. **Settings → Collaborators**: invitar a todos los integrantes.

### Paso 2: clonar y abrir en VS Code (todos)

```
git clone https://github.com/USUARIO/ar-aves-uao.git
cd ar-aves-uao
code .
```

Extensiones recomendadas: ESLint, Prettier y glTF Tools (para ver los GLB en VS Code).

### Paso 3: crear el proyecto con Vite (una persona, luego `git push`)

```
npm create vite@latest . -- --template vanilla
npm install three howler
npm install -D @vitejs/plugin-basic-ssl gh-pages
```

`vite.config.js` (HTTPS local, necesario para la cámara en el celular):

```js
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig({
  base: './',
  plugins: [basicSsl()],
  server: { host: true }
});
```

En `package.json`, agregar el script `"deploy": "vite build && gh-pages -d dist"`. Después de crear las carpetas de la sección 5 y reemplazar `index.html` por el entregado, hacer commit y push; el resto del equipo hace `git pull` y `npm install`.

### Paso 4: instalar el motor de 8th Wall

La plataforma alojada ya no existe, por lo que no hay editor ni clave de app. Lo disponible es el **motor distribuido (binario gratuito)**:

1. Descargar `xr-standalone.zip` desde [https://8th.io/xrjs](https://8th.io/xrjs) (también está en github.com/8thwall/engine). Alternativa: `npm install @8thwall/engine-binary` y copiar su carpeta `dist`.
2. Descomprimirlo y copiar todo a `public/external/xr/`.
3. `index.html` ya incluye `<script async src="./external/xr/xr.js" data-preload-chunks="slam">`, que activa world tracking.
4. El binario no incluye VPS, mapas ni seguimiento de manos; este proyecto no los usa. La app de escritorio de 8th Wall no es necesaria.
5. Revisar que `xr.js` tenga el aviso de copyright de Niantic Spatial (versión vigente) y leer la licencia del binario antes de subirlo a un repositorio público.

### Paso 5: ejecutar y probar en el celular

```
npm run dev
```

Abrir en el celular la dirección `https://IP-DEL-PC:5173` (la que muestra Vite en "Network") y aceptar el aviso del certificado. Si el celular no conecta, usar un túnel gratuito (Cloudflare Tunnel o ngrok).

### Paso 6: prueba de viabilidad del día 1

En `ArSession.js`, un cubo de 20 cm que queda anclado en el suelo al tocar. Esqueleto de referencia (confirmar nombres de la API con la documentación del motor):

```js
import * as THREE from 'three';
window.THREE = THREE; // el módulo de 8th Wall lo espera como global

export class ArSession {
  start(canvas, onReady) {
    const init = () => {
      XR8.addCameraPipelineModules([
        XR8.GlTextureRenderer.pipelineModule(),
        XR8.Threejs.pipelineModule(),
        XR8.XrController.pipelineModule(),
        { name: 'aves-uao', onStart: () => onReady(XR8.Threejs.xrScene()) }
      ]);
      XR8.run({ canvas });
    };
    window.XR8 ? init() : window.addEventListener('xrloaded', init);
  }
}
```

**Criterio:** el cubo se ve estable en un Android y un iPhone. Si falla, se activa el Plan B de la sección 2.

### Paso 7: flujo de trabajo en Git

- `main`: siempre funcional (es lo que se despliega).
- Una rama por función: `feature/ar-core`, `feature/quiz`, `feature/hotspots`, `feature/ui`, `feature/assets-aves`.
- Commits pequeños en español claro, y Pull Request a `main` revisado por otra persona.
- Hacer `git pull` al empezar cada sesión de trabajo.

### Paso 8: desplegar gratis con GitHub Pages

```
npm run deploy
```

Luego: **Settings → Pages → Branch `gh-pages` / root**. El enlace `https://USUARIO.github.io/ar-aves-uao/` tiene HTTPS y es el que se usa en el pitch.

### Paso 9: agregar un ave nueva

1. Crear `public/aves/<id>/` con `modelo.glb`, `mini.jpg`, `canto.mp3` y `fotos/`.
2. Agregar su registro en `public/data/aves.json`.
3. Anotar autor y licencia en `CREDITOS.md`. El código no cambia.

### Orden recomendado de desarrollo del código

1. `ArSession`, `SceneManager` y `PlacementController` (cubo anclado).
2. `BirdRepository`, `BirdLoader` y `Bird` (el Pellar en AR con idle).
3. `Router`, `State` y pantallas de bienvenida, catálogo y ficha.
4. `GestureController`, `HotspotManager` y animaciones por toque.
5. `HabitatScene` y `AudioManager`.
6. `QuizManager` y `QuizUI`.
7. Las otras 4 aves, pulido y despliegue.

## 18. Archivo base: `index.html`

Se entrega junto a este documento. Contiene las pantallas de la sección 7 (bienvenida, catálogo, ficha, AR con barra de acciones, quiz, resultado y créditos), el `<canvas>` del motor AR y la etiqueta del script de 8th Wall. Cada pantalla tiene un `id` que usa `Router.js`, y la barra de acciones y las opciones del quiz se llenan desde JavaScript.