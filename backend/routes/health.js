const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica a saúde da API
 *     tags: [Health]
 *     description: Retorna o status da API, timestamp e tempo de atividade.
 *     responses:
 *       200:
 *         description: API está saudável.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-27T10:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 */
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
