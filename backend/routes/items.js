const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Item = require('../models/Item');

// GET /api/items/search?name=xyz
// Search items by name or category(type). 
// Note: Placed before /:id route to avoid match conflict
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ msg: 'Search query is required' });
        }
        
        // Search by name (itemName) or type using regex
        const items = await Item.find({
            $or: [
                { itemName: { $regex: name, $options: 'i' } },
                { type: { $regex: name, $options: 'i' } }
            ]
        }).populate('user', ['name', 'email']);
        
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().populate('user', ['name', 'email']).sort({ date: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', ['name', 'email']);
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Item not found' });
        }
        res.status(500).send('Server Error');
    }
});

// POST /api/items
router.post('/', auth, async (req, res) => {
    try {
        const { itemName, description, type, location, date, contactInfo } = req.body;

        const newItem = new Item({
            itemName,
            description,
            type,
            location,
            date,
            contactInfo,
            user: req.user.id
        });

        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/items/:id
router.put('/:id', auth, async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) return res.status(404).json({ msg: 'Item not found' });

        // Ensure user owns item
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to update this item' });
        }

        const { itemName, description, type, location, date, contactInfo } = req.body;

        const itemFields = {};
        if (itemName) itemFields.itemName = itemName;
        if (description) itemFields.description = description;
        if (type) itemFields.type = type;
        if (location) itemFields.location = location;
        if (date) itemFields.date = date;
        if (contactInfo) itemFields.contactInfo = contactInfo;

        item = await Item.findByIdAndUpdate(
            req.params.id,
            { $set: itemFields },
            { new: true }
        );

        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/items/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) return res.status(404).json({ msg: 'Item not found' });

        // Ensure user owns item
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this item' });
        }

        await item.deleteOne();

        res.json({ msg: 'Item removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Item not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
