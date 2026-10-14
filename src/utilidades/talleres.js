import { talleres } from "../datos/datos.js";

// Funciones auxiliares para la lógica de talleres e inscripciones

export function obtenerPlazasRestantes(taller, inscripciones = []) {
  if (!taller) return 0;

  // Filtro para ver cuántas inscripciones tiene el taller
  const inscritos = inscripciones.filter(
    (inscripcion) => inscripcion.tallerId === taller.id
  ).length;

  // Usamos plazas para calcular las disponibles
  const restantes = (taller.plazas || 0) - inscritos;

  // Garantizo que no pueda dar negativo
  return Math.max(0, restantes);
}

export function estaInscrito(tallerId, email, inscripciones = []) {
  if (!tallerId || !email || !Array.isArray(inscripciones)) {
    return false;
  }
  
  const emailLimpio = email.toLowerCase().trim();
  
  return inscripciones.some(
    (inscripcion) =>
      inscripcion.email.toLowerCase().trim() === emailLimpio &&
      inscripcion.tallerId === Number(tallerId)
  );
}

export function validarInscripcion(datos = {}) {
  const errores = {};
  let esValido = true;

  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim().toLowerCase();

  const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const regexEmail = /^[a-zA-Z0-9_%+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/;

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
    esValido = false;
  } else if (nombre.length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
    esValido = false;
  } else if (!regexSoloLetras.test(nombre)) {
    errores.nombre = "El nombre solo puede contener letras y espacios.";
    esValido = false;
  }

  if (!email) {
    errores.email = "El correo electrónico es obligatorio.";
    esValido = false;
  } else if (!regexEmail.test(email)) {
    errores.email = "El formato del correo electrónico no es válido.";
    esValido = false;
  }

  return {
    esValido,
    errores,
    valores: { nombre, email }
  };
}

export function filtrarTalleres(listaTalleres, { categoria, nivel, disponibilidad }, inscripciones = []) {
  if (!Array.isArray(listaTalleres)) return [];

  return listaTalleres.filter((taller) => {
    const plazasDisponibles = obtenerPlazasRestantes(taller, inscripciones);

    if (categoria && categoria !== 'todas' && taller.categoria !== categoria) {
      return false;
    }

    if (nivel && nivel !== 'todos' && taller.nivel !== nivel) {
      return false;
    }

    if (disponibilidad === 'disponibles' && plazasDisponibles <= 0) {
      return false;
    }
    if (disponibilidad === 'completos' && plazasDisponibles > 0) {
      return false;
    }

    return true;
  });
}