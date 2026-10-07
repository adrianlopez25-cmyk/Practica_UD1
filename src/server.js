import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor de Jornadas corriendo en http://localhost:${PORT}`);
});