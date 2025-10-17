const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Register user baru
const register = async (req, res) => {
  try {
    const { email, username, phone, password, gender, dob, address, role = 'user' } = req.body;

    // Validasi input
    if (!email || !username || !phone || !password || !gender || !dob) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (email, username, phone, password, gender, dob)',
        data: null
      });
    }

    // Validasi role
    const allowedRoles = ['admin', 'user'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: 'Role tidak valid. Gunakan: admin, user',
        data: null
      });
    }

    // Cek apakah email atau username sudah ada
    const exist = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (exist) {
      return res.status(400).json({
        status: false,
        message: 'Email atau username sudah terdaftar',
        data: null
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        phone,
        password: hashedPassword,
        gender,
        dob: new Date(dob),
        address: address || '',
        role
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      username: user.username,
      role: user.role 
    });

    res.status(201).json({
      status: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal melakukan registrasi',
      error: error.message,
      data: null
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier bisa email atau username

    if (!identifier || !password) {
      return res.status(400).json({
        status: false,
        message: 'Email/username dan password wajib diisi',
        data: null
      });
    }

    // Cari user berdasarkan email atau username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Email/username atau password salah',
        data: null
      });
    }

    // Verifikasi password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: false,
        message: 'Email/username atau password salah',
        data: null
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      username: user.username,
      role: user.role 
    });

    // Return user data tanpa password
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      status: true,
      message: 'Login berhasil',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal melakukan login',
      error: error.message,
      data: null
    });
  }
};

// Register buyer
const registerBuyer = async (req, res) => {
  try {
    const { phone, username } = req.body;

    if (!phone || !username) {
      return res.status(400).json({
        status: false,
        message: 'Phone dan username wajib diisi',
        data: null
      });
    }

    // Cek apakah phone atau username sudah ada
    const exist = await prisma.buyer.findFirst({
      where: {
        OR: [{ username }, { phone }],
      },
    });

    if (exist) {
      return res.status(400).json({
        status: false,
        message: 'Phone atau username sudah terdaftar',
        data: null
      });
    }

    // Generate activation code
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expired = new Date();
    expired.setMinutes(expired.getMinutes() + 30); // 30 menit

    const buyer = await prisma.buyer.create({
      data: {
        phone,
        username,
        activation_code: activationCode,
        expired
      },
      select: {
        id: true,
        phone: true,
        username: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ 
      buyerId: buyer.id, 
      username: buyer.username 
    }, '7d'); // Token berlaku 7 hari untuk buyer

    res.status(201).json({
      status: true,
      message: 'Registrasi buyer berhasil',
      data: {
        buyer,
        token,
        activationCode // Untuk testing, sebaiknya dikirim via SMS
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal melakukan registrasi buyer',
      error: error.message,
      data: null
    });
  }
};

// Login buyer
const loginBuyer = async (req, res) => {
  try {
    const { phone, activationCode } = req.body;

    if (!phone || !activationCode) {
      return res.status(400).json({
        status: false,
        message: 'Phone dan activation code wajib diisi',
        data: null
      });
    }

    // Cari buyer berdasarkan phone
    const buyer = await prisma.buyer.findFirst({
      where: { phone }
    });

    if (!buyer) {
      return res.status(401).json({
        status: false,
        message: 'Phone tidak terdaftar',
        data: null
      });
    }

    // Verifikasi activation code dan expired time
    if (buyer.activation_code !== activationCode) {
      return res.status(401).json({
        status: false,
        message: 'Activation code salah',
        data: null
      });
    }

    if (new Date() > buyer.expired) {
      return res.status(401).json({
        status: false,
        message: 'Activation code sudah expired',
        data: null
      });
    }

    // Generate token
    const token = generateToken({ 
      buyerId: buyer.id, 
      username: buyer.username 
    }, '7d');

    res.json({
      status: true,
      message: 'Login buyer berhasil',
      data: {
        buyer: {
          id: buyer.id,
          phone: buyer.phone,
          username: buyer.username,
          createdAt: buyer.createdAt
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal melakukan login buyer',
      error: error.message,
      data: null
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      status: true,
      message: 'Profile berhasil diambil',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengambil profile',
      error: error.message,
      data: null
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { email, username, phone, gender, dob, address } = req.body;
    const userId = req.user.id;

    // Cek apakah email atau username sudah digunakan user lain
    if (email || username) {
      const exist = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
              ]
            }
          ]
        }
      });

      if (exist) {
        return res.status(400).json({
          status: false,
          message: 'Email atau username sudah digunakan',
          data: null
        });
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = new Date(dob);
    if (address !== undefined) updateData.address = address;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      status: true,
      message: 'Profile berhasil diupdate',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate profile',
      error: error.message,
      data: null
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Current password dan new password wajib diisi',
        data: null
      });
    }

    // Ambil user dengan password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verifikasi current password
    const isValidPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: false,
        message: 'Current password salah',
        data: null
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      status: true,
      message: 'Password berhasil diubah',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengubah password',
      error: error.message,
      data: null
    });
  }
};

module.exports = {
  register,
  login,
  registerBuyer,
  loginBuyer,
  getProfile,
  updateProfile,
  changePassword
};
