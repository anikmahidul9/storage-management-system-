import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res, next) => {
  try {
    const items = await Item.find();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Public
export const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Public
export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Public
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};