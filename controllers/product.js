const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Mendapatkan semua produk
const getAllProducts = async (req, res) => {
  try {
    const { search, limit = 10, page = 1, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {
      OR: [
        { name: { contains: search || "" } },
        { product_code: { contains: search || "" } },
        { desc: { contains: search || "" } }
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      skip: offset,
      take: Number(limit),
      include: {
        detail_orders: true,
        ratings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total_data = await prisma.product.count({
      where: whereClause
    });

    res.status(200).json({
      status: true,
      message: 'Data produk berhasil ditampilkan',
      data: products,
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
      message: 'Gagal mendapatkan data produk',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan produk berdasarkan ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        detail_orders: {
          include: {
            order: true
          }
        },
        ratings: {
          include: {
            buyer: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: product,
      message: 'Berhasil mendapatkan data produk'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data produk',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan produk berdasarkan kode produk
const getProductByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await prisma.product.findFirst({
      where: { product_code: code },
      include: {
        detail_orders: true,
        ratings: true
      }
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    res.status(200).json({
      status: true,
      data: product,
      message: 'Berhasil mendapatkan data produk'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mendapatkan data produk',
      error: error.message,
      data: null
    });
  }
};

// Membuat produk baru
const createProduct = async (req, res) => {
  try {
    const { product_code, name, image, type, price, desc } = req.body;

    // Validasi input
    if (!product_code || !name || !type || !price) {
      return res.status(400).json({
        status: false,
        message: 'Field wajib diisi (product_code, name, type, price)',
        data: null
      });
    }

    // Cek apakah kode produk sudah ada
    const existingProduct = await prisma.product.findFirst({
      where: { product_code }
    });

    if (existingProduct) {
      return res.status(400).json({
        status: false,
        message: 'Kode produk sudah digunakan',
        data: null
      });
    }

    const product = await prisma.product.create({
      data: {
        product_code,
        name,
        image: image || null,
        type,
        price: parseFloat(price),
        desc: desc || null
      }
    });

    res.status(201).json({
      status: true,
      data: product,
      message: 'Produk berhasil dibuat'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat produk',
      error: error.message,
      data: null
    });
  }
};

// Mengupdate produk
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_code, name, image, type, price, desc } = req.body;

    // Cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    // Cek apakah kode produk sudah digunakan produk lain
    if (product_code && product_code !== existingProduct.product_code) {
      const duplicateProduct = await prisma.product.findFirst({
        where: { 
          product_code,
          id: { not: parseInt(id) }
        }
      });

      if (duplicateProduct) {
        return res.status(400).json({
          status: false,
          message: 'Kode produk sudah digunakan produk lain',
          data: null
        });
      }
    }

    const updateData = {};
    if (product_code !== undefined) updateData.product_code = product_code;
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (type !== undefined) updateData.type = type;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (desc !== undefined) updateData.desc = desc;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      status: true,
      data: product,
      message: 'Produk berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal mengupdate produk',
      error: error.message,
      data: null
    });
  }
};

// Menghapus produk
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: true,
      message: 'Produk berhasil dihapus',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal menghapus produk',
      error: error.message,
      data: null
    });
  }
};

// Mendapatkan rating rata-rata produk
const getProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        ratings: true
      }
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Produk tidak ditemukan',
        data: null
      });
    }

    const ratings = product.ratings;
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    res.status(200).json({
      status: true,
      data: {
        product_id: product.id,
        product_name: product.name,
        total_ratings: ratings.length,
        average_rating: Math.round(averageRating * 100) / 100,
        ratings: ratings
      },
      message: 'Berhasil mendapatkan rating produk'
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
  getAllProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductRating
};
