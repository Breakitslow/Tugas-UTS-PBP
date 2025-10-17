const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua pesanan
const getAllOrders = async (req, res) => {
  try {
    const { search, limit = 10, page = 1, user_id, buyer_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {
      OR: [
        { order_code: { contains: search || "" } },
        { desc: { contains: search || "" } }
      ]
    };

    if (user_id) {
      whereClause.user_id = parseInt(user_id);
    }

    if (buyer_id) {
      whereClause.buyer_id = BigInt(buyer_id);
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      skip: offset,
      take: Number(limit),
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
        },
        detail_orders: {
          include: {
            product: true
          }
        },
        ratings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total_data = await prisma.order.count({
      where: whereClause
    });

    res.status(200).json({
      status: true,
      message: 'Data pesanan berhasil ditampilkan',
      data: orders,
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
      message: 'Gagal mendapatkan data pesanan',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan pesanan berdasarkan ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
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
        },
        detail_orders: {
          include: {
            product: true
          }
        },
        ratings: {
          include: {
            product: true,
            buyer: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Pesanan tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: order,
      message: 'Berhasil mendapatkan data pesanan'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data pesanan',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan pesanan berdasarkan kode pesanan
const getOrderByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const order = await prisma.order.findFirst({
      where: { order_code: code },
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
        },
        detail_orders: {
          include: {
            product: true
          }
        },
        ratings: true
      }
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Pesanan tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: order,
      message: 'Berhasil mendapatkan data pesanan'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data pesanan',
      error: error.message,
      data: null
    });
  }
};

// Membuat pesanan baru
const createOrder = async (req, res) => {
  try {
    const { order_code, user_id, buyer_id, total, desc, discount, detail_orders } = req.body;

    // Validasi input
    if (!order_code || !total || !detail_orders || !Array.isArray(detail_orders)) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (order_code, total, detail_orders)',
        data: null
      });
    }

    // Cek apakah kode pesanan sudah ada
    const existingOrder = await prisma.order.findFirst({
      where: { order_code }
    });

    if (existingOrder) {
      return res.status(400).json({
        status: false,
        message: 'Kode pesanan sudah digunakan',
        data: null
      });
    }

    // Validasi detail_orders
    for (const detail of detail_orders) {
      if (!detail.product_id || !detail.price || !detail.quantity) {
        return res.status(400).json({
          status: false,
          message: 'Detail pesanan harus memiliki product_id, price, dan quantity',
          data: null
        });
      }

      // Cek apakah produk ada
      const product = await prisma.product.findUnique({
        where: { id: detail.product_id }
      });

      if (!product) {
        return res.status(400).json({
          status: false,
          message: `Produk dengan ID ${detail.product_id} tidak ditemukan`,
          data: null
        });
      }
    }

    // Buat pesanan dengan detail pesanan
    const order = await prisma.order.create({
      data: {
        order_code,
        user_id: user_id ? parseInt(user_id) : null,
        buyer_id: buyer_id ? BigInt(buyer_id) : null,
        total: parseFloat(total),
        desc: desc || '',
        discount: discount ? parseFloat(discount) : 0,
        detail_orders: {
          create: detail_orders.map(detail => ({
            product_id: detail.product_id,
            price: parseFloat(detail.price),
            quantity: parseFloat(detail.quantity),
            sub_total: parseFloat(detail.price) * parseFloat(detail.quantity)
          }))
        }
      },
      include: {
        detail_orders: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      status: true,
      data: order,
      message: 'Pesanan berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat pesanan',
      error: error.message,
      data: null
    });
  }
};

// Mengupdate pesanan
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_code, user_id, buyer_id, total, desc, discount } = req.body;

    // Cek apakah pesanan ada
    const existingOrder = await prisma.order.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: false,
        message: 'Pesanan tidak ditemukan',
        data: null
      });
    }

    // Cek apakah kode pesanan sudah digunakan pesanan lain
    if (order_code && order_code !== existingOrder.order_code) {
      const duplicateOrder = await prisma.order.findFirst({
        where: { 
          order_code,
          id: { not: BigInt(id) }
        }
      });

      if (duplicateOrder) {
        return res.status(400).json({
          status: false,
          message: 'Kode pesanan sudah digunakan pesanan lain',
          data: null
        });
      }
    }

    const updateData = {};
    if (order_code !== undefined) updateData.order_code = order_code;
    if (user_id !== undefined) updateData.user_id = user_id ? parseInt(user_id) : null;
    if (buyer_id !== undefined) updateData.buyer_id = buyer_id ? BigInt(buyer_id) : null;
    if (total !== undefined) updateData.total = parseFloat(total);
    if (desc !== undefined) updateData.desc = desc;
    if (discount !== undefined) updateData.discount = parseFloat(discount);

    const order = await prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        user: true,
        buyer: true,
        detail_orders: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json({
      status: true,
      data: order,
      message: 'Pesanan berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate pesanan',
      error: error.message,
      data: null
    });
  }
};

// Menghapus pesanan
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah pesanan ada
    const existingOrder = await prisma.order.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: false,
        message: 'Pesanan tidak ditemukan',
        data: null
      });
    }

    await prisma.order.delete({
      where: { id: BigInt(id) }
    });

    res.status(200).json({
      status: true,
      message: 'Pesanan berhasil dihapus',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal menghapus pesanan',
      error: error.message,
      data: null
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByCode,
  createOrder,
  updateOrder,
  deleteOrder
};
