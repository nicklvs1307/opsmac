const express = require('express');
const router = express.Router();

// Placeholder route for /labels/users
router.get('/users', (req, res) => {
  res.status(200).json({ message: 'Labels for users route hit successfully!' });
});

// Placeholder route for /labels/stock-counts
router.get('/stock-counts', (req, res) => {
  res.status(200).json({ message: 'Labels for stock counts route hit successfully!' });
});

// Placeholder route for /labels/productions
router.get('/productions', (req, res) => {
  res.status(200).json({ message: 'Labels for productions route hit successfully!' });
});

module.exports = router;