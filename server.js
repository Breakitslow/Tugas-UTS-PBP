// Import module yang dibutuhkan
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'books.json');

async function readBooks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeBooks(books) {
  const json = JSON.stringify(books, null, 2);
  await fs.writeFile(DATA_FILE, json, 'utf8');
}

async function nextId() {
  const books = await readBooks();
  const max = books.reduce((m, b) => Math.max(m, Number(b.id) || 0), 0);
  return String(max + 1);
}

app.get('/books', async (req, res) => {
  const books = await readBooks();
  res.json(books);
});

app.get('/books/:id', async (req, res) => {
  const books = await readBooks();
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan' });
  res.json(book);
});

app.post('/books', async (req, res) => {
  const { title, author, publisher } = req.body;

  if (!title || !author || !publisher) {
    return res.status(400).json({
      error: 'Field title, author, dan publisher wajib diisi'
    });
  }

  const id = await nextId();
  const newBook = { id, title, author, publisher };

  const books = await readBooks();
  books.push(newBook);
  await writeBooks(books);

  res.status(201).json(newBook);
});

app.put('/books/:id', async (req, res) => {
  const { title, author, publisher } = req.body;
  const books = await readBooks();
  const index = books.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Buku tidak ditemukan' });
  }

  if (title !== undefined) books[index].title = title;
  if (author !== undefined) books[index].author = author;
  if (publisher !== undefined) books[index].publisher = publisher;

  await writeBooks(books);
  res.json(books[index]);
});


app.delete('/books/:id', async (req, res) => {
  const books = await readBooks();
  const index = books.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Buku tidak ditemukan' });
  }

  const deleted = books.splice(index, 1)[0];
  await writeBooks(books);

  res.json({ message: 'Buku berhasil dihapus', deleted });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
