const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

module.exports = {
  get: async (req, res) => {
    try {
      const { search, limit = 10, page = 1 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const user = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: search || "" } },
            { email: { contains: search || "" } },
          ],
        },
        skip: offset,
        take: Number(limit),
      });


      


      const total_data = await prisma.user.count({
        where: {
          OR: [
            { username: { contains: search || "" } },
            { email: { contains: search || "" } },
          ],
        },
      });

      return res.json({
        status: true,
        message: "Data Pengguna Berhasil ditampilkan",
        data: user,
        pagination: {
          total_data,
          total_page: Math.ceil(total_data / Number(limit)),
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },
  post: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const exist = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (exist) {
        throw new Error("Pengguna sudah terdaftar");
      }

      const user = await prisma.user.create({
        data: {
          username,
          password: bcrypt.hashSync(password, 10),
          email,
        },
      });

      return res.json({
        status: true,
        message: "Pengguna berhasil ditambahkan",
        data: user,
      });
    } catch (error) {}
  },
  put: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;
      const exist = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!exist) {
        throw new Error("Pengguna tidak ditemukan!");
      }

      const existUser = await prisma.user.findFirst({
        where: {
          id: { not: Number(id) },
          OR: [{ username }, { email }],
        },
      });

      const passwordHash = password ? bcrypt.hashSync(password, 10) : exist.password;

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: { username, email, password: passwordHash },
      });

      return res.json({
        status: true,
        message: "Pengguna berhasil diubah",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
      if (!exist) {
        throw new Error("Pengguna tidak ditemukan!");
      }
      const data = await prisma.user.delete({
        where: {
          id: Number(id),
        },
      });
      return res.json({
        status: true,
        message: "Pengguna berhasil dihapus",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },
};
