import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getItems = asyncHandler(async (req, res, next) => {
  const items = await Item.find({ user: req.user.id });
  res.status(200).json({ success: true, data: items });
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
export const getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new Error(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.user.toString() !== req.user.id) {
    return next(new Error(`User ${req.params.id} is not authorized to access this item`, 401));
  }

  res.status(200).json({ success: true, data: item });
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
export const createItem = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = asyncHandler(async (req, res, next) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(new Error(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.user.toString() !== req.user.id) {
    return next(new Error(`User ${req.params.id} is not authorized to update this item`, 401));
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: item });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new Error(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.user.toString() !== req.user.id) {
    return next(new Error(`User ${req.params.id} is not authorized to delete this item`, 401));
  }

  await item.remove();

  res.status(200).json({ success: true, data: {} });
});