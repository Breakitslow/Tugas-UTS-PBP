const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Memulai setup E-Commerce API...\n');

try {
  // 1. Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client berhasil di-generate\n');

  // 2. Cek apakah file .env ada
  if (!fs.existsSync('.env')) {
    console.log('⚠️  File .env tidak ditemukan!');
    console.log('📝 Membuat file .env.example...');
    
    const envExample = `# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_db"

# Server Configuration
PORT=3000
NODE_ENV=development`;
    
    fs.writeFileSync('.env.example', envExample);
    console.log('✅ File .env.example berhasil dibuat');
    console.log('📋 Silakan copy .env.example ke .env dan sesuaikan konfigurasi database Anda\n');
  }

  // 3. Cek apakah database sudah di-setup
  console.log('🗄️  Untuk setup database, jalankan salah satu perintah berikut:');
  console.log('   - npx prisma db push (untuk development)');
  console.log('   - npx prisma migrate dev --name init (untuk production)\n');

  // 4. Informasi server
  console.log('🌐 Untuk menjalankan server:');
  console.log('   - npm run dev (development)');
  console.log('   - node app.js (production)\n');

  // 5. Informasi endpoints
  console.log('📚 API Endpoints yang tersedia:');
  console.log('   - GET    /api/buyers');
  console.log('   - GET    /api/vouchers');
  console.log('   - GET    /api/users-new');
  console.log('   - GET    /api/products');
  console.log('   - GET    /api/orders');
  console.log('   - GET    /api/detail-orders');
  console.log('   - GET    /api/ratings\n');

  console.log('📖 Lihat API_DOCUMENTATION.md untuk dokumentasi lengkap');
  console.log('📖 Lihat README_SETUP.md untuk instruksi setup detail\n');

  console.log('🎉 Setup selesai! Selamat coding! 🎉');

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Pastikan Node.js sudah terinstall');
  console.log('2. Pastikan dependencies sudah diinstall (npm install)');
  console.log('3. Cek konfigurasi database di file .env');
  console.log('4. Pastikan MySQL server berjalan');
}
