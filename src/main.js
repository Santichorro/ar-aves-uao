import './styles/main.css';
import { App } from './core/App.js';

// Arranque: la App abre la sesión AR de inmediato (cámara + hitTest) y muestra el
// estado en #ar-instruccion. La carga de aves.json queda para una iteración siguiente.
const app = new App();
app.init();

export default app;
