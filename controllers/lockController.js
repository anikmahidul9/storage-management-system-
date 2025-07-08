import bcrypt from 'bcryptjs';
import File from '../models/File.js';
import Folder from '../models/Folder.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Lock an item
export const lockItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password, reason, inheritLock } = req.body;
  const isFile = req.path.includes('/files/');
  const Model = isFile ? File: Folder;

  // Verify ownership
  const item = await Model.findById(id);
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }
  if (item.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Only owner can lock items', 403));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update lock status
  const update = {
    isLocked: true,
    lockPassword: hashedPassword,
    lockedAt: new Date(),
    lockReason: reason || '',
    ...(!isFile && { inheritLock: !!inheritLock })
  };

  const lockedItem = await Model.findByIdAndUpdate(id, update, { new: true });

  // If folder with inheritLock, lock all children
  if (!isFile && inheritLock) {
    await lockFolderContents(id, password, reason);
  }

  res.status(200).json({
    success: true,
    message: 'Item locked successfully',
    lockedAt: lockedItem.lockedAt
  });
});

// Unlock an item
export const unlockItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;
  const isFile = req.path.includes('/files/');
  const Model = isFile ? File : Folder;

  // Verify ownership and password
  const item = await Model.findById(id).select('+lockPassword');
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }
  if (item.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Only owner can unlock items', 403));
  }

  const isValid = await bcrypt.compare(password, item.lockPassword);
  if (!isValid) return next(new ErrorResponse('Invalid password', 401));

  // Unlock the item
  const update = {
    isLocked: false,
    lockPassword: undefined,
    lockedAt: undefined,
    lockReason: undefined,
    ...(!isFile && { inheritLock: false })
  };

  await Model.findByIdAndUpdate(id, update);

  // If folder with inheritLock, unlock all children
  if (!isFile && item.inheritLock) {
    await unlockFolderContents(id);
  }

  res.status(200).json({ success: true, message: 'Item unlocked successfully' });
});

// Helper functions
async function lockFolderContents(folderId, password, reason) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Lock files in folder
  await File.updateMany(
    { folder: folderId },
    { 
      isLocked: true,
      lockPassword: hashedPassword,
      lockedAt: new Date(),
      lockReason: reason 
    }
  );

  // Lock subfolders
  await Folder.updateMany(
    { parent: folderId },
    { 
      isLocked: true,
      lockPassword: hashedPassword,
      lockedAt: new Date(),
      lockReason: reason,
      inheritLock: true 
    }
  );
}

async function unlockFolderContents(folderId) {
  await File.updateMany(
    { folder: folderId },
    { 
      isLocked: false,
      lockPassword: undefined,
      lockedAt: undefined,
      lockReason: undefined 
    }
  );

  await Folder.updateMany(
    { parent: folderId },
    { 
      isLocked: false,
      lockPassword: undefined,
      lockedAt: undefined,
      lockReason: undefined,
      inheritLock: false 
    }
  );
}