import { talleres } from "../datos/datos.js";

// Aquí crearé la lógica, es decir las funciones que luego necesitaré para exportarlas


export function obtenerPlazasRestantes(taller, inscripciones = []) {
  if (!taller) return 0;

  // Filtro para ver cuántas inscripciones tiene el taller
  const inscritos = inscripciones.filter(
    (inscripcion) => inscripcion.tallerId === taller.id
  ).length;

  // Usamos plazasTotales (propiedad real en los datos) en lugar de taller.plazas
  const restantes = (taller.plazas || 0) - inscritos;

  // Garantizo que no pueda dar negativo
  return Math.max(0, restantes);
}


export function estaInscrito(tallerId, email, inscripciones = []) {
  // Filtro de datos correctos
  if (!tallerId || !email || !Array.isArray(inscripciones)) {
    return false;
  }
  
  // Elimino espacios sobrantes y paso a minúsculas para luego comparar
  const emailLimpio = email.toLowerCase().trim();
  
  // Comparo el curso y el email; si se encuentran ambos es que ya está repetido
  const yaInscrito = inscripciones.some(
    (inscripcion) =>
      inscripcion.email.toLowerCase().trim() === emailLimpio &&
      inscripcion.tallerId === Number(tallerId)
  );

  return yaInscrito;
}

export function validarInscripcion(datos = {}) {
  const errores = {};
  let esValido = true;

  // Limpieza previa de espacios y minúsculas
  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim().toLowerCase();

  // Expresión regular que solo permite letras (incluyendo acentos, ñ, Ñ) y espacios
  const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  // 1. Validación del nombre
  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
    esValido = false;
  } else if (nombre.length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
    esValido = false;
  } else if (!regexSoloLetras.test(nombre)) {
    errores.nombre = "El nombre solo puede contener letras y espacios (no se permiten números ni símbolos).";
    esValido = false;
  }

  // 2. Validación del email de forma básica
  if (!email) {
    errores.email = "El correo electrónico es obligatorio.";
    esValido = false;
  } else if (!email.includes('@') || !email.includes('.')) {
    errores.email = "El formato del correo electrónico no es válido.";
    esValido = false;
  }

  return {
    esValido: esValido,
    errores: errores,
    valores: { nombre, email }
  };
}