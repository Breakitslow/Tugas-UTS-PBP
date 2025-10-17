# Setup E-Commerce API

## Prerequisites

Pastikan Anda sudah menginstall:
- Node.js (versi 16 atau lebih baru)
- MySQL Database
- npm atau yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

Dependencies yang akan diinstall:
- `@prisma/client`: Prisma ORM client
- `prisma`: Prisma CLI
- `express`: Web framework
- `bcrypt`: Password hashing

### 2. Setup Database

#### a. Buat Database MySQL
```sql
CREATE DATABASE ecommerce_db;
```

#### b. Setup Environment Variables
Buat file `.env` di root project dengan isi:

```env
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_db"
```

Ganti `username`, `password`, dan `ecommerce_db` sesuai dengan konfigurasi database Anda.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migration

```bash
npx prisma db push
```

Atau jika ingin membuat migration file:

```bash
npx prisma migrate dev --name init
```

### 5. Start Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Database Schema

API ini menggunakan 7 tabel utama:

1. **buyers** - Data pembeli
2. **vouchers** - Data voucher/diskon
3. **users** - Data pengguna
4. **products** - Data produk
5. **orders** - Data pesanan
6. **detail_orders** - Detail item dalam pesanan
7. **ratings** - Rating produk

## API Endpoints

### Base URL: `http://localhost:3000/api`

- `/buyers` - CRUD pembeli
- `/vouchers` - CRUD voucher
- `/users-new` - CRUD pengguna
- `/products` - CRUD produk
- `/orders` - CRUD pesanan
- `/detail-orders` - CRUD detail pesanan
- `/ratings` - CRUD rating

Lihat file `API_DOCUMENTATION.md` untuk dokumentasi lengkap.

## Testing API

### Contoh menggunakan curl:

#### 1. Buat produk baru:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "product_code": "PROD001",
    "name": "Laptop Gaming",
    "type": "Elektronik",
    "price": 10000000,
    "desc": "Laptop gaming high-end"
  }'
```

#### 2. Dapatkan semua produk:
```bash
curl http://localhost:3000/api/products
```

#### 3. Buat pembeli baru:
```bash
curl -X POST http://localhost:3000/api/buyers \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08123456789",
    "username": "buyer1",
    "activation_code": "ABC123",
    "expired": "2024-12-31T23:59:59.000Z"
  }'
```

## Troubleshooting

### 1. Database Connection Error
- Pastikan MySQL server berjalan
- Cek konfigurasi DATABASE_URL di file `.env`
- Pastikan database sudah dibuat

### 2. Prisma Client Error
```bash
npx prisma generate
```

### 3. Migration Error
```bash
npx prisma db push --force-reset
```

### 4. Port Already in Use
Ganti port di file `app.js` atau `server.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

## File Structure

```
project-root/
├── controllers/
│   ├── buyer.js
│   ├── voucher.js
│   ├── user_new.js
│   ├── product.js
│   ├── order.js
│   ├── detail_order.js
│   └── rating.js
├── routes/
│   ├── buyer.js
│   ├── voucher.js
│   ├── user_new.js
│   ├── product.js
│   ├── order.js
│   ├── detail_order.js
│   ├── rating.js
│   └── index.js
├── prisma/
│   └── schema.prisma
├── app.js
├── server.js
├── package.json
├── API_DOCUMENTATION.md
└── README_SETUP.md
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (GUI untuk database)
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## Production Deployment

### 1. Build Production
```bash
npm install --production
```

### 2. Environment Variables
Pastikan semua environment variables sudah diset dengan benar.

### 3. Database
Pastikan database production sudah di-migrate.

### 4. Start Production Server
```bash
node app.js
```

## Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository ini.

