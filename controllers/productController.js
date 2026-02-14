const Product = require('../models/Product');

// @desc    Obtener todos los productos del usuario autenticado
// @route   GET /api/products
// @access  Privado
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ usuario: req.user._id });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un producto por ID (solo si pertenece al usuario)
// @route   GET /api/products/:id
// @access  Privado
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!product) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Privado
const createProduct = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;

    if (!nombre || precio === undefined) {
      res.status(400);
      throw new Error('Nombre y precio son obligatorios');
    }

    const product = await Product.create({
      nombre,
      descripcion,
      precio,
      stock,
      usuario: req.user._id
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Privado
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!product) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }

    const { nombre, descripcion, precio, stock } = req.body;
    product.nombre = nombre || product.nombre;
    product.descripcion = descripcion !== undefined ? descripcion : product.descripcion;
    product.precio = precio !== undefined ? precio : product.precio;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Privado
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!product) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }

    await product.deleteOne();
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};