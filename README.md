# 🎨 Aplicación de Gestión de Talleres Creativos

Aplicación web desarrollada con **Node.js**, **Express** y **EJS** para la consulta de talleres y gestión de inscripciones en tiempo real.

---

## 🚀 Características principales

* **Catálogo de talleres:** Visualización dinámica de talleres con actualización de aforo en tiempo real.
* **Control de disponibilidad:** Cálculo dinámico de plazas restantes y avisos visuales para talleres con aforo completo o en *"Última plaza"*.
* **Validaciones robustas:**
  * Control de campos obligatorios en el formulario.
  * Sanitización y validación de nombres mediante expresiones regulares (solo letras y espacios).
  * Validación de formato de correo electrónico.
  * Control de duplicados: se impide que un mismo usuario (email) se inscriba dos veces en el mismo taller.
* **Patrón PRG (Post-Redirect-Get):** Implementado en el flujo de inscripciones para evitar el reenvío duplicado de formularios al refrescar la página.

---
## 📂 Estructura del Proyecto

```text
Practica_U.../
├── node_modules/           # Dependencias de Node.js instaladas via npm
├── public/
│   └── estilos.css         # Archivos estáticos de la aplicación (CSS)
├── src/
│   ├── datos/              # Módulo de persistencia de datos en memoria (talleres e inscripciones)
│   ├── utilidades/
│   │   └── talleres.js     # Funciones auxiliares (cálculo de plazas, validaciones, etc.)
│   ├── app.js              # Configuración global de Express, middlewares y definición de rutas
│   └── server.js           # Punto de entrada de la aplicación para levantar el servidor HTTP
├── views/
│   ├── detalle-taller.ejs  # Plantilla de la vista de detalle y formulario de inscripción
│   └── index.ejs           # Plantilla de la vista del catálogo general de talleres
├── package-lock.json       # Registro de versiones exactas de las dependencias instaladas
└── package.json            # Configuración del proyecto, dependencias y scripts de inicio
```
---
## Explicación de las funcionalidades

* **Cálculo de plazas restantes:** He utilizado la función auxiliar `obtenerPlazasRestantes`. Con esta cuento cuántas inscripciones coinciden en el array `inscripciones` con el `tallerId` del taller actual, y luego se lo resto al aforo total del taller para saber cuántas plazas quedan disponibles.
 
* **Control de aforo** Lo evaluó de forma síncrona para evitar que mientras esta abierto el servidor entran mas solicitudes que plazas tenga el curso. Para ello llamo a la función obtenerPlazasRestantes y compruebo si es igual o menor que 0, si es el caso pues muestro un mensaje de que no es posible unirse al taller por que no hay plazas disponible, en caso contrario, se realiza la reserva.
 
* **Validaciones de datos y formato Regex** He realizado validaciones para el nombre del usuario y el email, para email pude controlarlo facil obligando a que tenga un @ y un . que no es lo mejor pero es funcional. Pero para nombre no sabia como controlarlo por lo que le pedí a la IA que me diera una expresión regular.
  
* **Control de correos duplicados por taller** Para esto emplee la función estaIncrito, que controla que durante el POST se busque en el array inscripciones y si se combina el tallerID y el email, se muestre un error por email repetido en el curso.
  
* **Patron PRG** En el Post programado que en caso de que sea exitosa la inscripción, se redirija a la pagina principal a través de un GET para que no haya opción de reenvió de solicitudes.

## Explicación de las rutas (GET y POST)

* **`GET /`**: Es la ruta inicial del servidor. La he puesto para que redirija directamente a `/talleres` con un `res.redirect`, así nadie se encuentra una página vacía o un error al entrar.

* **`GET /talleres`**: Es el catálogo general. Antes de renderizar la vista `index.ejs`, recorro el array de talleres y ejecuto `obtenerPlazasRestantes` en cada uno para calcular el aforo al momento. De esta forma, el catálogo siempre muestra las plazas reales que quedan.

* **`GET /talleres/:id`**: Carga la página de detalle de un taller específico (`detalle-taller.ejs`) donde está el formulario de inscripción. Coge el `id` que viene en la URL, busca el taller en los datos (si no lo encuentra devuelve un 404) y calcula sus plazas disponibles para pasárselas a la plantilla.

* **`POST /talleres/:id/inscripcion`**: Es la ruta que recibe los datos del formulario (`nombre` y `email`). Primero comprueba en el servidor que sigan quedando plazas libres. Si no hay plazas, frena el proceso y muestra el error. Luego valida los campos (el formato del email y la Regex del nombre) y revisa con `estaInscrito` que el correo no esté ya registrado en ese taller. Si pasa todas las comprobaciones, guarda la inscripción en el array y hace un `res.redirect('/talleres')` para aplicar el patrón PRG y evitar envíos duplicados.


