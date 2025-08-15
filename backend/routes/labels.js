'use strict';
const express = require('express');
console.log('labels.js: typeof express:', typeof express);
console.log('labels.js: typeof express.Router:', typeof express.Router);

const router = express.Router();
console.log('labels.js: typeof router after express.Router():', typeof router, 'router instanceof express.Router:', router instanceof express.Router);

console.log('labels.js: typeof router before export:', typeof router, 'router instanceof express.Router:', router instanceof express.Router);
module.exports = router;