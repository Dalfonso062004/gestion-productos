const request = require('supertest');
const { app } = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

// Antes de todas las pruebas, conectar a una base de datos de prueba
beforeAll(async () => {
  const dbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/gestion-productos-test';
  await mongoose.connect(dbUri);
});

// Después de cada prueba, limpiar la colección de usuarios
afterEach(async () => {
  await User.deleteMany();
});

// Después de todas las pruebas, desconectar
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register - debe registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        email: 'test@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('test@example.com');
  });

  test('POST /api/auth/register - debe fallar si el email ya existe', async () => {
    // Crear usuario primero
    await User.create({
      nombre: 'Existente',
      email: 'duplicado@example.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Otro',
        email: 'duplicado@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toBe('El usuario ya existe');
  });

  test('POST /api/auth/login - debe autenticar y devolver token', async () => {
    // Crear usuario
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Login User',
        email: 'login@example.com',
        password: '123456'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - debe fallar con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noexiste@example.com',
        password: 'wrong'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.mensaje).toBe('Credenciales inválidas');
  });
});