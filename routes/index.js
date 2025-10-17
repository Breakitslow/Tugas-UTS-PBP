const router = require('express').Router();

// Routes lama
router.use('/student', require('./student'));
router.use('/book', require('./book'));
router.use('/user', require('./user'));

// Routes baru berdasarkan skema database
router.use('/buyers', require('./buyer'));
router.use('/vouchers', require('./voucher'));
router.use('/products', require('./product'));
router.use('/orders', require('./order'));
router.use('/detail-orders', require('./detail_order'));
router.use('/ratings', require('./rating'));
router.use('/users-new', require('./user_new'));

router.get('/', (req, res) => {
  res.json({
    message: 'Saya berhasil menginstall express!'
  })
});


router.post('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman POST!'
  })
});

router.put('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman PUT!'
  })
});

router.delete('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman DELETE!'
  })
});


module.exports = router;

// npm install prisma
// npm install @prisma/client
// npx prisma init

 