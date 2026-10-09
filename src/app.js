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
// Al estar app.js en 'src', subo un nivel con '..' para encontrar 'views'
app.set('views', path.join(__dirname, '../views'));

// 2. Middlewares esenciales
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Mis rutas

// Ruta 1: Redirección automática de la raíz al catálogo
app.get('/', (req, res) => {
  res.redirect('/talleres');
});

// Ruta 2: Listado general de talleres (calcula plazas en tiempo real para la vista)
app.get('/talleres', (req, res) => {
  const talleresConPlazas = talleres.map(taller => ({
    ...taller,
    plazasRestantes: obtenerPlazasRestantes(taller, inscripciones)
  }));

  res.render('index', { talleres: talleresConPlazas });
});

// Ruta 3: Detalle de un taller individual y su formulario
app.get('/talleres/:id', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

  // Pasamos el objeto taller completo y el array de inscripciones
  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);

  res.render('detalle-taller', { 
    taller, 
    plazasRestantes,
    errores: {}, 
    valores: {} 
  });
});

// Ruta 4: Procesamiento del formulario de inscripción (Aplicando patrón PRG y control de aforo)
app.post('/talleres/:id/inscripcion', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

  // Comprobar plazas disponibles en el servidor al recibir la solicitud
  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
  if (plazasRestantes <= 0) {
    return res.render('detalle-taller', {
      taller,
      plazasRestantes: 0,
      errores: { email: 'Lo sentimos, este taller ya no tiene plazas disponibles.' },
      valores: req.body
    });
  }

  const datosFormulario = req.body;
  const resultado = validarInscripcion(datosFormulario);

  // Compruebo si la persona ya está inscrita en este taller
  if (resultado.esValido && estaInscrito(tallerId, resultado.valores.email, inscripciones)) {
    resultado.esValido = false;
    resultado.errores.email = 'Este correo electrónico ya está inscrito en este taller.';
  }

  // Si hay errores de validación o duplicado, volvemos a renderizar la vista con los errores
  if (!resultado.esValido) {
    return res.render('detalle-taller', { 
      taller, 
      plazasRestantes,
      errores: resultado.errores, 
      valores: resultado.valores 
    });
  }

  // Si todo es correcto, registramos la nueva inscripción en memoria
  const nuevaInscripcion = {
    id: Date.now(),
    tallerId: tallerId,
    nombre: resultado.valores.nombre,
    email: resultado.valores.email
  };
  inscripciones.push(nuevaInscripcion);

  // Patrón PRG
  res.redirect('/talleres');
});

// Exportamos la app para que la utilice server.js
export default app;