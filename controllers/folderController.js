import Folder from "../models/Folder.js";
import Item from "../models/Item.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

async function deleteFolderRecursive(folderId) {
  // Find and delete all items in the current folder
  await Item.deleteMany({ folder: folderId });

  // Find all subfolders
  const subFolders = await Folder.find({ parent: folderId });

  // Recursively delete all subfolders
  for (const subFolder of subFolders) {
    await deleteFolderRecursive(subFolder._id);
  }

  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
}

export const createFolder = asyncHandler(async (req, res, next) => {
  const { name, parent } = req.body;
  const folder = await Folder.create({
    name,
    owner: req.user.id,
    parent: parent || null
  });
  res.status(201).json({ success: true, data: folder });
});

export const renameFolder = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  let folder = await Folder.findById(req.params.id);

  if (!folder) {
    return next(new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404));
  }

  if (folder.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to rename this folder`, 401));
  }

  folder.name = name;
  await folder.save();

  res.status(200).json({ success: true, data: folder });
});

export const toggleFavoriteFolder = asyncHandler(async (req, res, next) => {
  let folder = await Folder.findById(req.params.id);

  if (!folder) {
    return next(new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404));
  }

  if (folder.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to modify this folder`, 401));
  }

  folder.isFavorite = !folder.isFavorite;
  await folder.save();

  res.status(200).json({ success: true, data: folder });
});

export const deleteFolder = asyncHandler(async (req, res, next) => {
  const folder = await Folder.findById(req.params.id);

  if (!folder) {
    return next(new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404));
  }

  if (folder.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this folder`, 401));
  }

  await deleteFolderRecursive(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

export const getAllFolders = asyncHandler(async (req, res, next) => {
  const folders = await Folder.find({ owner: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: folders.length,
    data: folders
  });
});