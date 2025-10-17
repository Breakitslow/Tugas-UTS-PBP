const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// Mendapatkan semua pengguna
const getAllUsers = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search || "" } },
          { email: { contains: search || "" } },
        ],
      },
      skip: offset,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        createdAt: true,
        updatedAt: true
      },
      include: {
        orders: true
      }
    });

    const total_data = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: search || "" } },
          { email: { contains: search || "" } },
        ],
      },
    });

    res.status(200).json({
      status: true,
      message: 'Data pengguna berhasil ditampilkan',
      data: users,
      pagination: {
        total_data,
        total_page: Math.ceil(total_data / Number(limit)),
        page: Number(page),
        limit: Number(limit),
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data pengguna',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan pengguna berdasarkan ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    // Cek apakah user meminta data sendiri atau admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Anda hanya bisa melihat data milik Anda sendiri',
        data: null
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
      include: {
        orders: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Pengguna tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: user,
      message: 'Berhasil mendapatkan data pengguna'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data pengguna',
      error: error.message,
      data: null
    });
  }
};

// Membuat pengguna baru
const createUser = async (req, res) => {
  try {
    const { email, username, phone, password, gender, dob, address } = req.body;

    // Validasi input
    if (!email || !username || !phone || !password || !gender || !dob) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (email, username, phone, password, gender, dob)',
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
        address: address || ''
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        createdAt: true
      }
    });

    res.status(201).json({
      status: true,
      data: user,
      message: 'Pengguna berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat pengguna',
      error: error.message,
      data: null
    });
  }
};

// Mengupdate pengguna
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, phone, password, gender, dob, address } = req.body;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        status: false,
        message: 'Pengguna tidak ditemukan',
        data: null
      });
    }

    // Cek apakah email atau username sudah digunakan user lain
    if (email || username) {
      const existUser = await prisma.user.findFirst({
        where: {
          id: { not: parseInt(id) },
          OR: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : [])
          ],
        },
      });

      if (existUser) {
        return res.status(400).json({
          status: false,
          message: 'Email atau username sudah digunakan pengguna lain',
          data: null
        });
      }
    }

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = new Date(dob);
    if (address !== undefined) updateData.address = address;
    if (password !== undefined) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        gender: true,
        dob: true,
        address: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      status: true,
      data: user,
      message: 'Pengguna berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate pengguna',
      error: error.message,
      data: null
    });
  }
};

// Menghapus pengguna
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        status: false,
        message: 'Pengguna tidak ditemukan',
        data: null
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: true,
      message: 'Pengguna berhasil dihapus',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal menghapus pengguna',
      error: error.message,
      data: null
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
