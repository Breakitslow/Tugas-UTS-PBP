const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua voucher
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        buyer: true
      }
    });
    res.status(200).json({
      success: true,
      data: vouchers,
      message: 'Berhasil mendapatkan data semua voucher'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data voucher',
      error: error.message
    });
  }
};

// Mendapatkan voucher berdasarkan ID
const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { id: parseInt(id) },
      include: {
        buyer: true
      }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
      message: 'Berhasil mendapatkan data voucher'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data voucher',
      error: error.message
    });
  }
};

// Mendapatkan voucher berdasarkan kode
const getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const voucher = await prisma.voucher.findFirst({
      where: { code: code },
      include: {
        buyer: true
      }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
      message: 'Berhasil mendapatkan data voucher'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data voucher',
      error: error.message
    });
  }
};

// Membuat voucher baru
const createVoucher = async (req, res) => {
  try {
    const { name, code, expired_time, quantity_max, buyer_id } = req.body;

    // Validasi input
    if (!name || !code || !expired_time || !quantity_max) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib diisi (name, code, expired_time, quantity_max)'
      });
    }

    const voucher = await prisma.voucher.create({
      data: {
        name,
        code,
        expired_time,
        quantity_max: parseInt(quantity_max),
        buyer_id: buyer_id ? BigInt(buyer_id) : null
      }
    });

    res.status(201).json({
      success: true,
      data: voucher,
      message: 'Voucher berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat voucher',
      error: error.message
    });
  }
};

// Mengupdate voucher
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, expired_time, quantity_used, quantity_max, buyer_id } = req.body;

    // Cek apakah voucher ada
    const existingVoucher = await prisma.voucher.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (expired_time !== undefined) updateData.expired_time = expired_time;
    if (quantity_used !== undefined) updateData.quantity_used = parseInt(quantity_used);
    if (quantity_max !== undefined) updateData.quantity_max = parseInt(quantity_max);
    if (buyer_id !== undefined) updateData.buyer_id = buyer_id ? BigInt(buyer_id) : null;

    const voucher = await prisma.voucher.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: voucher,
      message: 'Voucher berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate voucher',
      error: error.message
    });
  }
};

// Menggunakan voucher (increment quantity_used)
const useVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({
      where: { id: parseInt(id) }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    if (voucher.quantity_used >= voucher.quantity_max) {
      return res.status(400).json({
        success: false,
        message: 'Voucher sudah habis digunakan'
      });
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: parseInt(id) },
      data: {
        quantity_used: voucher.quantity_used + 1
      }
    });

    res.status(200).json({
      success: true,
      data: updatedVoucher,
      message: 'Voucher berhasil digunakan'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menggunakan voucher',
      error: error.message
    });
  }
};

// Menghapus voucher
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah voucher ada
    const existingVoucher = await prisma.voucher.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    await prisma.voucher.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Voucher berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus voucher',
      error: error.message
    });
  }
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  useVoucher,
  deleteVoucher
};
