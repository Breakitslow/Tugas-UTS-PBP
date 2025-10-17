const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua rating
const getAllRatings = async (req, res) => {
  try {
    const { search, limit = 10, page = 1, order_id, product_id, buyer_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {};

    if (order_id) {
      whereClause.order_id = BigInt(order_id);
    }

    if (product_id) {
      whereClause.product_id = parseInt(product_id);
    }

    if (buyer_id) {
      whereClause.buyer_id = BigInt(buyer_id);
    }

    const ratings = await prisma.rating.findMany({
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
        product: true,
        buyer: {
          select: {
            id: true,
            username: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total_data = await prisma.rating.count({
      where: whereClause
    });

    res.status(200).json({
      status: true,
      message: 'Data rating berhasil ditampilkan',
      data: ratings,
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
      message: 'Gagal mendapatkan data rating',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan rating berdasarkan ID
const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await prisma.rating.findUnique({
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
        product: true,
        buyer: {
          select: {
            id: true,
            username: true,
            phone: true
          }
        }
      }
    });

    if (!rating) {
      return res.status(404).json({
        status: false,
        message: 'Rating tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: rating,
      message: 'Berhasil mendapatkan data rating'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data rating',
      error: error.message,
      data: null
    });
  }
};

// Membuat rating baru
const createRating = async (req, res) => {
  try {
    const { order_id, product_id, buyer_id, rating } = req.body;

    // Validasi input
    if (!order_id || !product_id || !buyer_id || rating === undefined || rating === null) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (order_id, product_id, buyer_id, rating)',
        data: null
      });
    }

    // Validasi rating harus antara 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: false,
        message: 'Rating harus antara 1-5',
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

    // Cek apakah pembeli ada
    const buyer = await prisma.buyer.findUnique({
      where: { id: BigInt(buyer_id) }
    });

    if (!buyer) {
      return res.status(404).json({
        status: false,
        message: 'Pembeli tidak ditemukan',
        data: null
      });
    }

    // Cek apakah sudah ada rating untuk kombinasi order_id, product_id, dan buyer_id
    const existingRating = await prisma.rating.findFirst({
      where: {
        order_id: BigInt(order_id),
        product_id: parseInt(product_id),
        buyer_id: BigInt(buyer_id)
      }
    });

    if (existingRating) {
      return res.status(400).json({
        status: false,
        message: 'Rating sudah ada untuk pesanan, produk, dan pembeli ini',
        data: null
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        order_id: BigInt(order_id),
        product_id: parseInt(product_id),
        buyer_id: BigInt(buyer_id),
        rating: parseFloat(rating)
      },
      include: {
        order: true,
        product: true,
        buyer: true
      }
    });

    res.status(201).json({
      status: true,
      data: newRating,
      message: 'Rating berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat rating',
      error: error.message,
      data: null
    });
  }
};

// Mengupdate rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, product_id, buyer_id, rating } = req.body;

    // Cek apakah rating ada
    const existingRating = await prisma.rating.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingRating) {
      return res.status(404).json({
        status: false,
        message: 'Rating tidak ditemukan',
        data: null
      });
    }

    // Validasi rating harus antara 1-5
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        status: false,
        message: 'Rating harus antara 1-5',
        data: null
      });
    }

    // Cek apakah pesanan ada (jika order_id diupdate)
    if (order_id && order_id !== existingRating.order_id.toString()) {
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
    if (product_id && product_id !== existingRating.product_id) {
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

    // Cek apakah pembeli ada (jika buyer_id diupdate)
    if (buyer_id && buyer_id !== existingRating.buyer_id.toString()) {
      const buyer = await prisma.buyer.findUnique({
        where: { id: BigInt(buyer_id) }
      });

      if (!buyer) {
        return res.status(404).json({
          status: false,
          message: 'Pembeli tidak ditemukan',
          data: null
        });
      }
    }

    const updateData = {};
    if (order_id !== undefined) updateData.order_id = BigInt(order_id);
    if (product_id !== undefined) updateData.product_id = parseInt(product_id);
    if (buyer_id !== undefined) updateData.buyer_id = BigInt(buyer_id);
    if (rating !== undefined) updateData.rating = parseFloat(rating);

    const updatedRating = await prisma.rating.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        order: true,
        product: true,
        buyer: true
      }
    });

    res.status(200).json({
      status: true,
      data: updatedRating,
      message: 'Rating berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate rating',
      error: error.message,
      data: null
    });
  }
};

// Menghapus rating
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah rating ada
    const existingRating = await prisma.rating.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingRating) {
      return res.status(404).json({
        status: false,
        message: 'Rating tidak ditemukan',
        data: null
      });
    }

    await prisma.rating.delete({
      where: { id: BigInt(id) }
    });

    res.status(200).json({
      status: true,
      message: 'Rating berhasil dihapus',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal menghapus rating',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan rating berdasarkan produk
const getRatingsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const ratings = await prisma.rating.findMany({
      where: { product_id: parseInt(product_id) },
      skip: offset,
      take: Number(limit),
      include: {
        order: true,
        product: true,
        buyer: {
          select: {
            id: true,
            username: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total_data = await prisma.rating.count({
      where: { product_id: parseInt(product_id) }
    });

    // Hitung rata-rata rating
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    res.status(200).json({
      status: true,
      message: 'Data rating produk berhasil ditampilkan',
      data: {
        product_id: parseInt(product_id),
        average_rating: Math.round(averageRating * 100) / 100,
        total_ratings: total_data,
        ratings: ratings
      },
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
      message: 'Gagal mendapatkan rating produk',
      error: error.message,
      data: null
    });
  }
};

module.exports = {
  getAllRatings,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
  getRatingsByProduct
};
