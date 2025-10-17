const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua detail pesanan
const getAllDetailOrders = async (req, res) => {
  try {
    const { search, limit = 10, page = 1, order_id, product_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {};

    if (order_id) {
      whereClause.order_id = BigInt(order_id);
    }

    if (product_id) {
      whereClause.product_id = parseInt(product_id);
    }

    const detailOrders = await prisma.detailOrder.findMany({
      where: whereClause,
      skip: offset,
      take: Number(limit),
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            buyer: {
              select: {
                id: true,
                username: true,
                phone: true
              }
            }
          }
        },
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total_data = await prisma.detailOrder.count({
      where: whereClause
    });

    res.status(200).json({
      status: true,
      message: 'Data detail pesanan berhasil ditampilkan',
      data: detailOrders,
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
      message: 'Gagal mendapatkan data detail pesanan',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan detail pesanan berdasarkan ID
const getDetailOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const detailOrder = await prisma.detailOrder.findUnique({
      where: { id: BigInt(id) },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true
              }
            },
            buyer: {
              select: {
                id: true,
                username: true,
                phone: true
              }
            }
          }
        },
        product: true
      }
    });

    if (!detailOrder) {
      return res.status(404).json({
        status: false,
        message: 'Detail pesanan tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: detailOrder,
      message: 'Berhasil mendapatkan data detail pesanan'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data detail pesanan',
      error: error.message,
      data: null
    });
  }
};

// Membuat detail pesanan baru
const createDetailOrder = async (req, res) => {
  try {
    const { order_id, product_id, price, quantity } = req.body;

    // Validasi input
    if (!order_id || !product_id || !price || !quantity) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (order_id, product_id, price, quantity)',
        data: null
      });
    }

    // Cek apakah pesanan ada
    const order = await prisma.order.findUnique({
      where: { id: BigInt(order_id) }
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Pesanan tidak ditemukan',
        data: null
      });
    }

    // Cek apakah produk ada
    const product = await prisma.product.findUnique({
      where: { id: parseInt(product_id) }
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    const subTotal = parseFloat(price) * parseFloat(quantity);

    const detailOrder = await prisma.detailOrder.create({
      data: {
        order_id: BigInt(order_id),
        product_id: parseInt(product_id),
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        sub_total: subTotal
      },
      include: {
        order: true,
        product: true
      }
    });

    res.status(201).json({
      status: true,
      data: detailOrder,
      message: 'Detail pesanan berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat detail pesanan',
      error: error.message,
      data: null
    });
  }
};

// Mengupdate detail pesanan
const updateDetailOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, product_id, price, quantity } = req.body;

    // Cek apakah detail pesanan ada
    const existingDetailOrder = await prisma.detailOrder.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingDetailOrder) {
      return res.status(404).json({
        status: false,
        message: 'Detail pesanan tidak ditemukan',
        data: null
      });
    }

    // Cek apakah pesanan ada (jika order_id diupdate)
    if (order_id && order_id !== existingDetailOrder.order_id.toString()) {
      const order = await prisma.order.findUnique({
        where: { id: BigInt(order_id) }
      });

      if (!order) {
        return res.status(404).json({
          status: false,
          message: 'Pesanan tidak ditemukan',
          data: null
        });
      }
    }

    // Cek apakah produk ada (jika product_id diupdate)
    if (product_id && product_id !== existingDetailOrder.product_id) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(product_id) }
      });

      if (!product) {
        return res.status(404).json({
          status: false,
          message: 'Produk tidak ditemukan',
          data: null
        });
      }
    }

    const updateData = {};
    if (order_id !== undefined) updateData.order_id = BigInt(order_id);
    if (product_id !== undefined) updateData.product_id = parseInt(product_id);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);

    // Hitung ulang sub_total jika price atau quantity berubah
    if (price !== undefined || quantity !== undefined) {
      const finalPrice = price !== undefined ? parseFloat(price) : existingDetailOrder.price;
      const finalQuantity = quantity !== undefined ? parseFloat(quantity) : existingDetailOrder.quantity;
      updateData.sub_total = finalPrice * finalQuantity;
    }

    const detailOrder = await prisma.detailOrder.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        order: true,
        product: true
      }
    });

    res.status(200).json({
      status: true,
      data: detailOrder,
      message: 'Detail pesanan berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate detail pesanan',
      error: error.message,
      data: null
    });
  }
};

// Menghapus detail pesanan
const deleteDetailOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah detail pesanan ada
    const existingDetailOrder = await prisma.detailOrder.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingDetailOrder) {
      return res.status(404).json({
        status: false,
        message: 'Detail pesanan tidak ditemukan',
        data: null
      });
    }

    await prisma.detailOrder.delete({
      where: { id: BigInt(id) }
    });

    res.status(200).json({
      status: true,
      message: 'Detail pesanan berhasil dihapus',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal menghapus detail pesanan',
      error: error.message,
      data: null
    });
  }
};

module.exports = {
  getAllDetailOrders,
  getDetailOrderById,
  createDetailOrder,
  updateDetailOrder,
  deleteDetailOrder
};
