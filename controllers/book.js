const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const { search, limit = 10, page = 1 } = req.query;
      const where = {};

      if (search) {
        where.OR = [{ title: { contains: search } }];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const books = await prisma.book.findMany({
        where,
        take: Number(limit),
        skip: offset,
      });

      const total_data = await prisma.book.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data buku",
        data: books,
        pagination: {
          total_data,
          total_page,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },
  post: async (req, res) => {
    try {
      const { title, author, publisher, year } = req.body;

      const exist = await prisma.book.findFirst({
        where: {
          title: title,
        },
      });

      if (exist) {
        throw new Error("Buku sudah terdaftar");
      }

      const book = await prisma.book.create({
        data: {
          title,
          author,
          publisher,
          year: Number(year),
        },
      });
      return res.json({
        status: true,
        message: "Berhasil menambahkan data buku",
        data: book,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },
  put: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, publisher, year } = req.body;

      const exist = await prisma.book.findFirst({
        where: { id: Number(id) },
      });

      if (!exist) {
        throw new Error("Buku tidak ditemukan");
      }

      const existBook = await prisma.book.findFirst({
        where: {
          OR: [
            {
              title: {
                contains: title,
              },
            },
          ],
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existBook) {
        throw new Error("Buku sudah ada!");
      }

      const book = await prisma.book.update({
        where: {
          id: Number(id),
        },
        data: {
          title,
          author,
          publisher,
          year: Number(year),
        },
      });

      return res.json({
        status: true,
        message: "Buku berhasil diubah",
        data: book,
      });
    } catch (error) {
      console.log(error.message);
      return res.json({
        error: error.message,
      });
    }
  },
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.book.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!exist) {
        throw new Error("Buku tidak ditemukan");
      }

      const book = await prisma.book.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({
        status: true,
        message: "Buku berhasil dihapus",
        data: book,
      });
    } catch (error) {
      return res.json({
        error: error.message,
      });
    }
  },
};
