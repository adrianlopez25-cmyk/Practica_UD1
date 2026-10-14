# Aplicación de Gestión de Talleres Creativos

Aplicación web desarrollada con **Node.js**, **Express** y **EJS** para la consulta de talleres y gestión de inscripciones en tiempo real.

---

## Características principales

* **Sistema de Filtrado y búsqueda:** He añadido un sistema de filtrado por categoria (los nombres de los cursos), nivel de dificultad( inicial, intermedio o avanzado) y disponibilidad (disponibles, completos o todos).
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
Practica_UD1/
├── node_modules/           # Dependencias de Node.js instaladas via npm
├── public/
│   └── estilos.css         # Archivos estáticos de la aplicación (CSS)
├── src/
│   ├── datos/
│   │   └── datos.js        # Módulo de persistencia de datos en memoria (talleres e inscripciones)
│   ├── utilidades/
│   │   └── talleres.js     # Funciones auxiliares (logica proyecto)
│   ├── app.js              # Configuración global de Express, middlewares y definición de rutas
│   └── server.js           # Punto de entrada de la aplicación para levantar el servidor HTTP
├── views/
│   ├── detalle-taller.ejs  # Plantilla de la vista de detalle y formulario de inscripción
│   └── index.ejs           # Plantilla de la vista del catálogo general de talleres
├── package-lock.json       # Registro de versiones exactas de las dependencias instaladas
├── package.json            # Configuración del proyecto, dependencias y scripts de inicio
└── README.md               # Documentación del proyecto, arquitectura y guía de pruebas cURL
```
---
## Explicación de las funcionalidades

* **Cálculo de plazas restantes:** He utilizado la función auxiliar obtenerPlazasRestantes. Con esta cuento cuántas inscripciones coinciden en el array inscripciones con el tallerId del taller actual, y luego se lo resto al aforo total del taller para saber cuántas plazas quedan disponibles.
 
* **Control de aforo** Lo evaluó de forma síncrona para evitar que mientras esta abierto el servidor entran mas solicitudes que plazas tenga el curso. Para ello llamo a la función obtenerPlazasRestantes y compruebo si es igual o menor que 0, si es el caso pues muestro un mensaje de que no es posible unirse al taller por que no hay plazas disponible, en caso contrario, se realiza la reserva.
 
- **Validaciones de datos y formato Regex:** He implementado validaciones en el servidor para garantizar la integridad y el formato de los datos introducidos:
  - **Nombre:** Se aplica la expresión regular `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/` para restringir la entrada exclusivamente a letras (incluyendo acentos y ñ) y espacios, bloqueando el registro de números o caracteres especiales.
  - **Correo electrónico:** Inicialmente se planteó una comprobación básica de existencia de caracteres (@ y .), pero se optimizó sustituyéndola por la expresión regular `/^[a-zA-Z0-9_%+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/`. Esto asegura una estructura de correo válida y previene errores comunes de formato, como la presencia de múltiples símbolos @ o puntos no permitidos.
  
* **Control de correos duplicados por taller** Para esto emplee la función estaInscrito, que controla que durante el POST se busque en el array inscripciones y si se combina el tallerID y el email, se muestre un error por email repetido en el curso.
  
* **Patron PRG** En el Post programado que en caso de que sea exitosa la inscripción, se redirija a la pagina principal a través de un GET para que no haya opción de reenvió de solicitudes.

## Explicación de las rutas (GET y POST)

* **GET /**: Es la ruta inicial del servidor. La he puesto para que redirija directamente a /talleres con un res.redirect, así nadie se encuentra una página vacía o un error al entrar.

* **GET /talleres**: Es el catálogo general. Antes de renderizar la vista index.ejs, recorro el array de talleres y ejecuto obtenerPlazasRestantes en cada uno para calcular el aforo al momento. De esta forma, el catálogo siempre muestra las plazas reales que quedan.

* **GET /talleres/:id**: Carga la página de detalle de un taller específico (detalle-taller.ejs) donde está el formulario de inscripción. Coge el id que viene en la URL, busca el taller en los datos (si no lo encuentra devuelve un 404) y calcula sus plazas disponibles para pasárselas a la plantilla.

* **POST /talleres/:id/inscripcion**: Es la ruta que recibe los datos del formulario (nombre y email). Primero comprueba en el servidor que sigan quedando plazas libres. Si no hay plazas, frena el proceso y muestra el error. Luego valida los campos (el formato del email y la Regex del nombre) y revisa con estaInscrito que el correo no esté ya registrado en ese taller. Si pasa todas las comprobaciones, guarda la inscripción en el array y hace un res.redirect(/talleres) para aplicar el patrón PRG y evitar envíos duplicados.

## Ejemplos de pruebas con curl

Para probar que todas las funcionalidades y rutas funcionan correctamente desde la consola, se pueden lanzar las siguientes peticiones (con el servidor arrancado en `http://localhost:3000`):

### 1. Ver el catálogo con plazas actualizadas (GET /talleres)
Con este comando compruebo que la ruta principal carga la lista de talleres y ejecuta obtenerPlazasRestantes para mostrar el aforo al momento:
```bash
curl.exe -X GET http://localhost:3000/talleres
```
### 2. Ver en detalle un taller
Esto nos permite acceder aun taller para poder inscribirnos en este atraves de un formulario de incscipcion (POST).
```bash
curl.exe -X GET http://localhost:3000/talleres/1
```
### 3. Inscripción correcta y prueba del Patrón PRG
Me permite en caso de que la validación de los datos sea correcta, se renderice la web a la pagina inicial par evitar que se duplique la inscripción.
```bash
curl.exe -i -X POST http://localhost:3000/talleres/2/inscripcion -H "Content-Type: application/x-www-form-urlencoded" -d "nombre=Pedro Gomez&email=pedrito.manos@gmail.com" 
```
### 4. Prueba de la Regex en el Nombre
La empleo para comprobar que el nombre introducido sea correcto y este no incluya números o caracteres especiales.
```bash
curl.exe -i -X POST http://localhost:3000/talleres/2/inscripcion -H "Content-Type: application/x-www-form-urlencoded" -d "nombre=Carlos193!&email=carlos@example.com"
```
### 5. Prueba de correos duplicado
Realizo la prueba de un correo ya existente para comprobar si la función estaInscrito la detecta y evita su solictud.
```bash
curl.exe -i -X POST http://localhost:3000/talleres/2/inscripcion -H "Content-Type: application/x-www-form-urlencoded" -d "nombre=Jung Gi Kim&email=junggi@sketchbook.com"
```
### 6. Control de aforo en el servidor
Lo empleo para comprobar que en un taller que tiene ya 0 plazas disponibles, me frene el registro de una nueva peticion
```bash
curl.exe -i -X POST http://localhost:3000/talleres/1/inscripcion -H "Content-Type: application/x-www-form-urlencoded" -d "nombre=Carla Lopez&email=Carla.lopez@gmail.com"
```
### 7. Filtro combinado (Categoría, Nivel y Disponibilidad)
Permite aplicar múltiples criterios de forma simultánea evaluando las condiciones de forma acumulativa, devolviendo únicamente los talleres que coinciden con los tres parámetros elegidos.
```bash
curl.exe -i -X GET "http://localhost:3000/talleres?categoria=arte-3d&nivel=inicial&disponibilidad=disponibles"
```
## Instalación y Ejecución
Para instalar las dependencias:
```bash
npm install
```
Para arrancar el servidor:
```bash
npm start
```
## Enlace de conversacion con IA
https://gemini.google.com/share/d/1DnWy31BKxWdq_NlSVkwjEYvoqnQTz3P4?usp=sharing
