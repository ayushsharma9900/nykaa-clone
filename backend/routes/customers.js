const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
