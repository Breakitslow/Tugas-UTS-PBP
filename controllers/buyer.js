const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua pembeli
const getAllBuyers = async (req, res) => {
  try {
    const buyers = await prisma.buyer.findMany({
      include: {
        vouchers: true,
        orders: true,
        ratings: true
      }
    });
    res.status(200).json({
      success: true,
      data: buyers,
      message: 'Berhasil mendapatkan data semua pembeli'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data pembeli',
      error: error.message
    });
  }
};

// Mendapatkan pembeli berdasarkan ID
const getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await prisma.buyer.findUnique({
      where: { id: BigInt(id) },
      include: {
        vouchers: true,
        orders: true,
        ratings: true
      }
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Pembeli tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: buyer,
      message: 'Berhasil mendapatkan data pembeli'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data pembeli',
      error: error.message
    });
  }
};

// Membuat pembeli baru
const createBuyer = async (req, res) => {
  try {
    const { phone, username, activation_code, expired } = req.body;

    // Validasi input
    if (!phone || !username || !activation_code || !expired) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (phone, username, activation_code, expired)'
      });
    }

    const buyer = await prisma.buyer.create({
      data: {
        phone,
        username,
        activation_code,
        expired: new Date(expired)
      }
    });

    res.status(201).json({
      success: true,
      data: buyer,
      message: 'Pembeli berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat pembeli',
      error: error.message
    });
  }
};

// Mengupdate pembeli
const updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, username, activation_code, expired } = req.body;

    // Cek apakah pembeli ada
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingBuyer) {
      return res.status(404).json({
        success: false,
        message: 'Pembeli tidak ditemukan'
      });
    }

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (username !== undefined) updateData.username = username;
    if (activation_code !== undefined) updateData.activation_code = activation_code;
    if (expired !== undefined) updateData.expired = new Date(expired);

    const buyer = await prisma.buyer.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: buyer,
      message: 'Pembeli berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate pembeli',
      error: error.message
    });
  }
};

// Menghapus pembeli
const deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah pembeli ada
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingBuyer) {
      return res.status(404).json({
        success: false,
        message: 'Pembeli tidak ditemukan'
      });
    }

    await prisma.buyer.delete({
      where: { id: BigInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Pembeli berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pembeli',
      error: error.message
    });
  }
};

module.exports = {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer
};
