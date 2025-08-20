const express = require('express');
const router = express.Router();
const { Addon } = require('../models');
const { auth, ownerOrManagerAuth } = require('../middleware/auth');

// GET all addons for a restaurant
router.get('/', auth, async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        if (!restaurant_id) {
            return res.status(400).json({ msg: 'Restaurant ID is required' });
        }
        const addons = await Addon.findAll({ where: { restaurant_id } });
        res.json(addons);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new addon
router.post('/', ownerOrManagerAuth, async (req, res) => {
    const { name, price, restaurant_id } = req.body;
    try {
        const newAddon = await Addon.create({ name, price, restaurant_id });
        res.json(newAddon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT to update an addon
router.put('/:id', ownerOrManagerAuth, async (req, res) => {
    const { name, price } = req.body;
    try {
        let addon = await Addon.findByPk(req.params.id);
        if (!addon) {
            return res.status(404).json({ msg: 'Addon not found' });
        }

        addon.name = name || addon.name;
        addon.price = price || addon.price;

        await addon.save();
        res.json(addon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE an addon
router.delete('/:id', ownerOrManagerAuth, async (req, res) => {
    try {
        let addon = await Addon.findByPk(req.params.id);
        if (!addon) {
            return res.status(404).json({ msg: 'Addon not found' });
        }

        await addon.destroy();
        res.json({ msg: 'Addon removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ativa ou inativa um adicional
router.patch('/:id/toggle-status', ownerOrManagerAuth, async (req, res) => {
    try {
        const addon = await Addon.findByPk(req.params.id);
        if (!addon) {
            return res.status(404).json({ msg: 'Addon not found' });
        }

        // Assumes the Addon model has an 'is_active' field.
        addon.is_active = !addon.is_active;
        await addon.save();

        res.json(addon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
