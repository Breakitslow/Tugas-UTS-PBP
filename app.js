require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Fix BigInt serialization issue
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routes = require('./routes');
const authRoutes = require('./routes/auth');

app.use('/api', routes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// npm init -y
// npm install express
// npm install prisma
// npm install @prisma/client
// npx prisma init
// buat file app.js
// tulis kode diatas