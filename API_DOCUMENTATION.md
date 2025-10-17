# Dokumentasi API E-Commerce

## Base URL
```
http://localhost:3000/api
```

## Tabel dan Endpoints

### 1. Pembeli (Buyers)
**Base Path:** `/buyers`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/buyers` | Mendapatkan semua pembeli |
| GET | `/buyers/:id` | Mendapatkan pembeli berdasarkan ID |
| POST | `/buyers` | Membuat pembeli baru |
| PUT | `/buyers/:id` | Mengupdate pembeli |
| DELETE | `/buyers/:id` | Menghapus pembeli |

**Contoh Request Body untuk POST/PUT:**
```json
{
  "phone": "08123456789",
  "username": "buyer1",
  "activation_code": "ABC123",
  "expired": "2024-12-31T23:59:59.000Z"
}
```

### 2. Voucher
**Base Path:** `/vouchers`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/vouchers` | Mendapatkan semua voucher |
| GET | `/vouchers/:id` | Mendapatkan voucher berdasarkan ID |
| GET | `/vouchers/code/:code` | Mendapatkan voucher berdasarkan kode |
| POST | `/vouchers` | Membuat voucher baru |
| PUT | `/vouchers/:id` | Mengupdate voucher |
| PUT | `/vouchers/:id/use` | Menggunakan voucher (increment quantity_used) |
| DELETE | `/vouchers/:id` | Menghapus voucher |

**Contoh Request Body untuk POST/PUT:**
```json
{
  "name": "Diskon 10%",
  "code": "DISKON10",
  "expired_time": "2024-12-31",
  "quantity_max": 100,
  "buyer_id": 1
}
```

### 3. Pengguna (Users)
**Base Path:** `/users-new`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/users-new` | Mendapatkan semua pengguna |
| GET | `/users-new/:id` | Mendapatkan pengguna berdasarkan ID |
| POST | `/users-new` | Membuat pengguna baru |
| PUT | `/users-new/:id` | Mengupdate pengguna |
| DELETE | `/users-new/:id` | Menghapus pengguna |

**Query Parameters untuk GET:**
- `search`: Pencarian berdasarkan username atau email
- `limit`: Jumlah data per halaman (default: 10)
- `page`: Nomor halaman (default: 1)

**Contoh Request Body untuk POST/PUT:**
```json
{
  "email": "user@example.com",
  "username": "user1",
  "phone": "08123456789",
  "password": "password123",
  "gender": "Laki-laki",
  "dob": "1990-01-01",
  "address": "Jl. Contoh No. 123"
}
```

### 4. Produk
**Base Path:** `/products`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products` | Mendapatkan semua produk |
| GET | `/products/:id` | Mendapatkan produk berdasarkan ID |
| GET | `/products/code/:code` | Mendapatkan produk berdasarkan kode |
| GET | `/products/:id/rating` | Mendapatkan rating rata-rata produk |
| POST | `/products` | Membuat produk baru |
| PUT | `/products/:id` | Mengupdate produk |
| DELETE | `/products/:id` | Menghapus produk |

**Query Parameters untuk GET:**
- `search`: Pencarian berdasarkan nama, kode produk, atau deskripsi
- `type`: Filter berdasarkan tipe produk
- `limit`: Jumlah data per halaman (default: 10)
- `page`: Nomor halaman (default: 1)

**Contoh Request Body untuk POST/PUT:**
```json
{
  "product_code": "PROD001",
  "name": "Produk Contoh",
  "image": "image.jpg",
  "type": "Elektronik",
  "price": 100000,
  "desc": "Deskripsi produk"
}
```

### 5. Pesanan (Orders)
**Base Path:** `/orders`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/orders` | Mendapatkan semua pesanan |
| GET | `/orders/:id` | Mendapatkan pesanan berdasarkan ID |
| GET | `/orders/code/:code` | Mendapatkan pesanan berdasarkan kode |
| POST | `/orders` | Membuat pesanan baru |
| PUT | `/orders/:id` | Mengupdate pesanan |
| DELETE | `/orders/:id` | Menghapus pesanan |

**Query Parameters untuk GET:**
- `search`: Pencarian berdasarkan kode pesanan atau deskripsi
- `user_id`: Filter berdasarkan user ID
- `buyer_id`: Filter berdasarkan buyer ID
- `limit`: Jumlah data per halaman (default: 10)
- `page`: Nomor halaman (default: 1)

**Contoh Request Body untuk POST:**
```json
{
  "order_code": "ORD001",
  "user_id": 1,
  "buyer_id": 1,
  "total": 150000,
  "desc": "Pesanan pertama",
  "discount": 10000,
  "detail_orders": [
    {
      "product_id": 1,
      "price": 100000,
      "quantity": 1
    },
    {
      "product_id": 2,
      "price": 50000,
      "quantity": 1
    }
  ]
}
```

### 6. Detail Pesanan
**Base Path:** `/detail-orders`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/detail-orders` | Mendapatkan semua detail pesanan |
| GET | `/detail-orders/:id` | Mendapatkan detail pesanan berdasarkan ID |
| POST | `/detail-orders` | Membuat detail pesanan baru |
| PUT | `/detail-orders/:id` | Mengupdate detail pesanan |
| DELETE | `/detail-orders/:id` | Menghapus detail pesanan |

**Query Parameters untuk GET:**
- `order_id`: Filter berdasarkan order ID
- `product_id`: Filter berdasarkan product ID
- `limit`: Jumlah data per halaman (default: 10)
- `page`: Nomor halaman (default: 1)

**Contoh Request Body untuk POST/PUT:**
```json
{
  "order_id": 1,
  "product_id": 1,
  "price": 100000,
  "quantity": 2
}
```

### 7. Rating
**Base Path:** `/ratings`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/ratings` | Mendapatkan semua rating |
| GET | `/ratings/:id` | Mendapatkan rating berdasarkan ID |
| GET | `/ratings/product/:product_id` | Mendapatkan rating berdasarkan produk |
| POST | `/ratings` | Membuat rating baru |
| PUT | `/ratings/:id` | Mengupdate rating |
| DELETE | `/ratings/:id` | Menghapus rating |

**Query Parameters untuk GET:**
- `order_id`: Filter berdasarkan order ID
- `product_id`: Filter berdasarkan product ID
- `buyer_id`: Filter berdasarkan buyer ID
- `limit`: Jumlah data per halaman (default: 10)
- `page`: Nomor halaman (default: 1)

**Contoh Request Body untuk POST/PUT:**
```json
{
  "order_id": 1,
  "product_id": 1,
  "buyer_id": 1,
  "rating": 4.5
}
```

## Response Format

Semua response menggunakan format JSON dengan struktur:

```json
{
  "status": true/false,
  "message": "Pesan response",
  "data": null/object/array,
  "pagination": {
    "total_data": 100,
    "total_page": 10,
    "page": 1,
    "limit": 10
  }
}
```

## Error Handling

Response error menggunakan format:

```json
{
  "status": false,
  "message": "Pesan error",
  "error": "Detail error",
  "data": null
}
```

## Status Codes

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Catatan Penting

1. Semua field `createdAt` dan `updatedAt` otomatis dikelola oleh Prisma
2. Field `password` akan di-hash menggunakan bcrypt
3. Field `sub_total` pada detail pesanan dihitung otomatis dari `price * quantity`
4. Rating harus antara 1-5
5. Voucher dapat digunakan dengan endpoint khusus yang akan increment `quantity_used`
6. Semua endpoint mendukung pagination dengan query parameters `limit` dan `page`
7. Field `id` menggunakan BigInt untuk beberapa tabel (buyers, orders, ratings, detail_orders)
