const request = require('supertest');
const { app } = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

let token;
let userId;

beforeAll(async () => {
  const dbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/gestion-productos-test';
  await mongoose.connect(dbUri);
});

beforeEach(async () => {
  await User.deleteMany();
  await Product.deleteMany();

  // Crear usuario y obtener token
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      nombre: 'Test User',
      email: 'test@example.com',
      password: '123456'
    });

  token = userRes.body.token;
  userId = userRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Product Endpoints', () => {
  test('GET /api/products - debe devolver lista vacía inicial', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/products - debe crear un nuevo producto', async () => {
    const newProduct = {
      nombre: 'Producto Test',
      descripcion: 'Descripción',
      precio: 100,
      stock: 10
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe(newProduct.nombre);
    expect(res.body.usuario).toBe(userId);
  });

  test('POST /api/products - debe fallar si falta nombre', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ precio: 50 });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toContain('Nombre y precio son obligatorios');
  });

  test('GET /api/products/:id - debe obtener un producto por id', async () => {
    // Crear producto primero
    const product = await Product.create({
      nombre: 'Mi Producto',
      precio: 200,
      usuario: userId
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Mi Producto');
  });

  test('PUT /api/products/:id - debe actualizar un producto', async () => {
    const product = await Product.create({
      nombre: 'Original',
      precio: 100,
      usuario: userId
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Actualizado', precio: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Actualizado');
    expect(res.body.precio).toBe(150);
  });

  test('DELETE /api/products/:id - debe eliminar un producto', async () => {
    const product = await Product.create({
      nombre: 'A eliminar',
      precio: 50,
      usuario: userId
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Producto eliminado');

    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });

  test('Debe fallar al acceder a productos sin token', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(401);
    expect(res.body.mensaje).toBe('No autorizado, no se proporcionó token');
  });
});