import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { talleres, inscripciones } from './datos/datos.js';
import { 
  obtenerPlazasRestantes, 
  estaInscrito, 
  validarInscripcion,
  filtrarTalleres 
} from './utilidades/talleres.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Ruta 1: Redirección automática a /talleres
app.get('/', (req, res) => {
  res.redirect('/talleres');
});

// Ruta 2: Listado general con filtros
app.get('/talleres', (req, res) => {
  const { categoria = 'todas', nivel = 'todos', disponibilidad = 'todas' } = req.query;

  const talleresFiltrados = filtrarTalleres(
    talleres, 
    { categoria, nivel, disponibilidad }, 
    inscripciones
  );

  const talleresConPlazas = talleresFiltrados.map(taller => ({
    ...taller,
    plazasRestantes: obtenerPlazasRestantes(taller, inscripciones)
  }));

  const categoriasUnicas = [...new Set(talleres.map(t => t.categoria).filter(Boolean))];
  const nivelesUnicos = [...new Set(talleres.map(t => t.nivel).filter(Boolean))];

  res.render('index', { 
    talleres: talleresConPlazas,
    filtros: { categoria, nivel, disponibilidad },
    categorias: categoriasUnicas,
    niveles: nivelesUnicos
  });
});

// Ruta 3: Detalle de taller
app.get('/talleres/:id', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);

  res.render('detalle-taller', { 
    taller, 
    plazasRestantes,
    errores: {}, 
    valores: {} 
  });
});

// Ruta 4: Formulario de inscripción
app.post('/talleres/:id/inscripcion', (req, res) => {
  const tallerId = Number(req.params.id);
  const taller = talleres.find(t => t.id === tallerId);

  if (!taller) {
    return res.status(404).send('Taller no encontrado');
  }

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

  if (resultado.esValido && estaInscrito(tallerId, resultado.valores.email, inscripciones)) {
    resultado.esValido = false;
    resultado.errores.email = 'Este correo electrónico ya está inscrito en este taller.';
  }

  if (!resultado.esValido) {
    return res.render('detalle-taller', { 
      taller, 
      plazasRestantes,
      errores: resultado.errores, 
      valores: resultado.valores 
    });
  }

  const nuevaInscripcion = {
    id: Date.now(),
    tallerId,
    nombre: resultado.valores.nombre,
    email: resultado.valores.email
  };
  inscripciones.push(nuevaInscripcion);

  res.redirect('/talleres');
});

export default app;