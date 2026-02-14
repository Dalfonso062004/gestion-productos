const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Publico
const registerUser = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      res.status(400);
      throw new Error('Por favor complete todos los campos');
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('El usuario ya existe');
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        token: generarToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Autenticar usuario (login)
// @route   POST /api/auth/login
// @access  Publico
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email y contraseña son requeridos');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Credenciales inválidas');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Credenciales inválidas');
    }

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      token: generarToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener perfil del usuario (protegido)
// @route   GET /api/auth/perfil
// @access  Privado
const getPerfil = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getPerfil
};