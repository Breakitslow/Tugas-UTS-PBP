const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Middleware untuk verifikasi JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Access token diperlukan',
        data: null
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cek apakah user masih ada di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Token tidak valid atau user tidak ditemukan',
        data: null
      });
    }

    // Tambahkan user info ke request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Token sudah expired',
        data: null
      });
    }
    
    return res.status(403).json({
      status: false,
      message: 'Token tidak valid',
      data: null
    });
  }
};

// Middleware untuk role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'User tidak terautentikasi',
        data: null
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: 'Anda tidak memiliki akses untuk resource ini',
        data: null
      });
    }

    next();
  };
};

// Middleware untuk buyer authentication (menggunakan Buyer model)
const authenticateBuyer = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Access token diperlukan',
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const buyer = await prisma.buyer.findUnique({
      where: { id: decoded.buyerId },
      select: {
        id: true,
        username: true,
        phone: true
      }
    });

    if (!buyer) {
      return res.status(401).json({
        status: false,
        message: 'Token tidak valid atau buyer tidak ditemukan',
        data: null
      });
    }

    req.buyer = buyer;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Token sudah expired',
        data: null
      });
    }
    
    return res.status(403).json({
      status: false,
      message: 'Token tidak valid',
      data: null
    });
  }
};

// Middleware untuk resource ownership (user hanya bisa akses data miliknya)
const checkOwnership = (resourceField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'User tidak terautentikasi',
        data: null
      });
    }

    // Admin bisa akses semua data
    if (req.user.role === 'admin') {
      return next();
    }

    // Cek apakah resource milik user
    const resourceId = req.params.id || req.params.user_id;
    if (resourceId && parseInt(resourceId) !== req.user.id) {
      return res.status(403).json({
        status: false,
        message: 'Anda hanya bisa mengakses data milik Anda sendiri',
        data: null
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  authenticateBuyer,
  checkOwnership
};
