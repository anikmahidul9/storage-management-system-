import File from "../models/File.js";
import Folder from "../models/Folder.js";
import Share from "../models/Share.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

export const shareItem = asyncHandler(async (req, res, next) => {
  const { itemId, itemType, sharedWith, permission } = req.body;
  
  // Validate item type
  if (!['file', 'folder'].includes(itemType)) {
    return next(new ErrorResponse('Invalid item type', 400));
  }

  // Check if item exists
  const model = itemType === 'file' ? File : Folder;
  const item = await model.findById(itemId);
  if (!item) return next(new ErrorResponse('Item not found', 404));
  if (item.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Access denied', 403));
  }

  const share = await Share.create({
    item: itemId,
    itemType,
    owner: req.user.id,
    sharedWith,
    permission
  });

  res.status(201).json({ success: true, data: share });
});

export const getSharedItems = asyncHandler(async (req, res, next) => {
  const sharedItems = await Share.find({ sharedWith: req.user.id })
    .populate({ path: 'item', model: 'File' }) 
    .populate('owner', 'username email');
  res.status(200).json({ success: true, data: sharedItems });
});