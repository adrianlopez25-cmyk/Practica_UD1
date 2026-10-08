import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Importo las utilidades y datos.
import { talleres, inscripciones } from './datos/datos.js';
import { 
  obtenerPlazasRestantes, 
  estaInscrito, 
  validarInscripcion 
} from './utilidades/talleres.js';

const app = express();

// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
// Al estar app.js en 'src', subimos un nivel con '..' para encontrar 'views'
app.set('views', path.join(__dirname, '../views'));

// 2. Middlewares esenciales
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// Ruta 1: Redirección automática de la raíz al catálogo
app.get('/', (req, res) => {
  res.redirect('/talleres');
});

// Ruta 2: Listado general de talleres
app.get('/talleres', (req, res) => {
  res.render('index', { talleres });
});

// Ruta 3: Detalle de un taller individual y su formulario
app.get('/talleres/:id', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

  const plazasRestantes = obtenerPlazasRestantes(tallerId);

  res.render('detalle-taller', { 
    taller, 
    plazasRestantes,
    errores: {}, 
    valores: {} 
  });
});

// Ruta 4: Procesamiento del formulario de inscripción a los cursos
app.post('/talleres/:id/inscripcion', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

  const datosFormulario = req.body;
  const resultado = validarInscripcion(datosFormulario);

  // Compruebo si la persona ya está inscrita en este taller
  if (resultado.esValido && estaInscrito(tallerId, resultado.valores.email)) {
    resultado.esValido = false;
    resultado.errores.email = 'Este correo electrónico ya está inscrito en este taller.';
  }

  // Si hay errores de validación o duplicado, volvere a renderizar la vista con los errores
  if (!resultado.esValido) {
    const plazasRestantes = obtenerPlazasRestantes(tallerId);
    return res.render('detalle-taller', { 
      taller, 
      plazasRestantes,
      errores: resultado.errores, 
      valores: resultado.valores 
    });
  }

  // Si la validación es correcta, guardo la nueva inscripción
  const nuevaInscripcion = {
    id: Date.now(),
    tallerId: tallerId,
    nombre: resultado.valores.nombre,
    email: resultado.valores.email
  };
  inscripciones.push(nuevaInscripcion);

  // Patron PRG
  res.redirect('/talleres');
});

// Exportamos la app para que la utilice server.js
export default app;