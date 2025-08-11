const express = require('express');
const router = express.Router();
const { models } = require('../config/database');

// Get menu items for a specific table (public dine-in menu)
router.get('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ msg: 'Mesa não encontrada.' });
    }

    // Fetch products associated with the restaurant of this table
    const products = await models.Product.findAll({
      where: { restaurant_id: table.restaurant_id }
    });

    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Start a new table session
router.post('/:tableId/start-session', async (req, res) => {
  const { tableId } = req.params;
  const { customer_count } = req.body; // Optional

  try {
    const table = await models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ msg: 'Mesa não encontrada.' });
    }

    // Check for active session for this table
    const activeSession = await models.TableSession.findOne({
      where: { table_id: tableId, status: 'active' }
    });

    if (activeSession) {
      return res.status(200).json({ msg: 'Sessão ativa já existe para esta mesa.', session: activeSession });
    }

    const session = await models.TableSession.create({
      table_id: tableId,
      customer_count: customer_count || 0,
      status: 'active'
    });
    res.status(201).json({ msg: 'Sessão iniciada com sucesso.', session });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Call a waiter
router.post('/:sessionId/call-waiter', async (req, res) => {
  const { sessionId } = req.params;
  const { description } = req.body; // Optional: for specific requests

  try {
    const session = await models.TableSession.findByPk(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ msg: 'Sessão não encontrada ou não está ativa.' });
    }

    const waiterCall = await models.WaiterCall.create({
      table_session_id: sessionId,
      type: 'waiter',
      description: description || null,
      status: 'pending'
    });

    // Optionally update session status to 'waiter_called'
    session.status = 'waiter_called';
    await session.save();

    res.status(200).json({ msg: 'Chamada para o garçom registrada com sucesso.', waiterCall });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Request a bill
router.post('/:sessionId/request-bill', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await models.TableSession.findByPk(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ msg: 'Sessão não encontrada ou não está ativa.' });
    }

    // Create a waiter call for bill request
    const waiterCall = await models.WaiterCall.create({
      table_session_id: sessionId,
      type: 'bill',
      description: 'Solicitação de conta',
      status: 'pending'
    });

    // Update session status to 'bill_requested'
    session.status = 'bill_requested';
    await session.save();

    res.status(200).json({ msg: 'Solicitação de conta registrada com sucesso.', waiterCall });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get current status of the table session
router.get('/:sessionId/status', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await models.TableSession.findByPk(sessionId, {
      include: [{
        model: models.WaiterCall,
        as: 'waiterCalls',
        where: { status: 'pending' }, // Only show pending calls
        required: false // Don't require a pending call to return session
      }]
    });
    if (!session) {
      return res.status(404).json({ msg: 'Sessão não encontrada.' });
    }
    res.json({ status: session.status, pending_calls: session.waiterCalls });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// End a table session (admin/waiter action, not public)
// router.post('/:sessionId/end-session', auth, async (req, res) => { ... });

module.exports = router;