import File from '../models/File.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Helper to determine file type based on MIME type
const getFileTypeCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/plain') return 'note';
  return 'other';
};

export const uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }



  const file = await File.create({
    name: req.file.filename,
    path: req.file.path,
    owner: req.user.id,
    fileType: req.file.mimetype,
    size: req.file.size
  });

  res.status(201).json({
    success: true,
    data: file
  });
});

export const createNote = asyncHandler(async (req, res, next) => {
  const { title, content, folder } = req.body;

  const note = await File.create({
    name: title,
    content: content,
    owner: req.user.id,
    fileType: 'text/plain', // Assuming notes are plain text
    folder: folder || null // Associate with a folder if provided
  });

  res.status(201).json({
    success: true,
    data: note
  });
});

export const renameFile = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  let file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  if (file.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to rename this file`, 401));
  }

  file.name = name;
  await file.save();

  res.status(200).json({
    success: true,
    data: file
  });
});

export const toggleFavoriteFile = asyncHandler(async (req, res, next) => {
  let file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  if (file.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to modify this file`, 401));
  }

  file.isFavorite = !file.isFavorite;
  await file.save();

  res.status(200).json({
    success: true,
    data: file
  });
});

export const duplicateFile = asyncHandler(async (req, res, next) => {
  const originalFile = await File.findById(req.params.id);

  if (!originalFile) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  if (originalFile.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to duplicate this file`, 401));
  }

  const duplicatedFile = await File.create({
    name: `Copy of ${originalFile.name}`,
    path: originalFile.path, // This might need to be handled differently for actual file duplication
    owner: req.user.id,
    fileType: originalFile.fileType,
    size: originalFile.size,
    folder: originalFile.folder,
    content: originalFile.content // For notes
  });

  res.status(201).json({
    success: true,
    data: duplicatedFile
  });
});

export const deleteFile = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  if (file.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this file`, 401));
  }

  await File.deleteOne({ _id: file._id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  PDF: ['pdf'],
  NOTE: ['note'] // Special type for notes
};

// @route   GET /api/files/:type
// @desc    Get files by type (image, pdf, note)
// @access  Private
export const getFilesByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params; // 'image', 'pdf', 'note', 'other'
  const { folderId, search } = req.query;
  const userId = req.user.id;

  let query = { owner: userId };

  switch (type.toLowerCase()) {
    case 'image':
      query.fileType = { $regex: /^image\// };
      break;
    case 'pdf':
      query.fileType = 'application/pdf';
      break;
    case 'note':
      query.fileType = 'text/plain';
      break;
    case 'other':
      query.fileType = { $nin: [/^image\//, 'application/pdf', 'text/plain'] };
      break;
    default:
      return next(new ErrorResponse('Invalid file type category provided.', 400));
  }

  if (folderId) {
    query.folder = folderId;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      ...(type.toLowerCase() === 'note' ? [{ content: { $regex: search, $options: 'i' } }] : [])
    ];
  }

  const files = await File.find(query).sort({ createdAt: -1 }).lean();

  res.status(200).json({
    success: true,
    count: files.length,
    data: files.map(file => ({
      id: file._id,
      name: file.name,
      fileType: file.fileType,
      category: getFileTypeCategory(file.fileType),
      size: file.size || 0,
      isFavorite: file.isFavorite,
      folder: file.folder,
      createdAt: file.createdAt,
      // Path is available if needed for direct access, but URL generation is frontend responsibility
      path: file.path 
    }))
  });
});

// @route   GET /api/files/all
// @desc    Get all files organized by type
// @access  Private
export const getAllOrganizedFiles = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const files = await File.find({ owner: userId }).sort({ createdAt: -1 }).lean();

  const organizedFiles = {
    images: [],
    pdfs: [],
    notes: [],
    others: []
  };

  files.forEach(file => {
    const category = getFileTypeCategory(file.fileType);
    const fileData = {
      id: file._id,
      name: file.name,
      fileType: file.fileType,
      size: file.size || 0,
      isFavorite: file.isFavorite,
      folder: file.folder,
      createdAt: file.createdAt,
      path: file.path
    };

    if (category === 'note') {
      fileData.contentPreview = file.content ? file.content.substring(0, 100) : '';
      organizedFiles.notes.push(fileData);
    } else if (category === 'image') {
      organizedFiles.images.push(fileData);
    } else if (category === 'pdf') {
      organizedFiles.pdfs.push(fileData);
    } else {
      organizedFiles.others.push(fileData);
    }
  });

  res.status(200).json({
    success: true,
    data: organizedFiles
  });
});