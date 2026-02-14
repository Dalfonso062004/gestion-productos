// server.js (para desarrollo local)
const { app, connectDB } = require('./app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor local corriendo en puerto ${PORT}`);
    });
  });
}

module.exports = app;