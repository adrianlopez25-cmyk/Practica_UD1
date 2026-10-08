import { talleres } from "../datos/datos";

//Aqui creare la logica, es decir las funciones que luego necesitare para exportarlas
export function obtenerPlazasRestantes(taller, inscripciones) {
  // Filtro que los datos sean correctos
  if (!taller || !Array.isArray(inscripciones)) {
    return 0;
  }

  // Filtro para ver cuántas inscripciones tiene el taller
  const inscritos = inscripciones.filter(
    (inscripcion) => inscripcion.tallerId === taller.id
  ).length;

  const restantes = taller.plazas - inscritos;

  // Garantizo que no pueda dar negativo
  return Math.max(0, restantes);
}

    export function estaInscrito (tallerId,email,inscripciones){
    //filtro de datos correctos
    if (!tallerId || !email || !Array.isArray(inscripciones)) {
    return false;
    }
    //Elimino espacios sobrantes y paso a minusculas para luego comparar
    const emailLimpio = email.toLowerCase().trim();
    //Comparo el curso y el email y si se encuentran ambos es que ya esta repetido  
    const yaInscrito = inscripciones.some((inscripcion)=>(inscripcion.email.toLowerCase().trim()===emailLimpio && inscripcion.tallerId===Number(tallerId)));

    return yaInscrito;

}

export function validarInscripcion(datos = {}) {
  const errores = {};
  let esValido = true;

  // Limpieza previa de espacios y mayúsculas
  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim().toLowerCase();

  // 1. Valido del nombre
  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
    esValido = false;
  } else if (nombre.length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
    esValido = false;
  }

  // 2. Valido el email de forma basica
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