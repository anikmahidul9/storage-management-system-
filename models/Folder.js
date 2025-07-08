import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  isFavorite: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  lockPassword: { type: String, select: false }, // Hashed password
  lockedAt: { type: Date },
  lockReason: { type: String },
  inheritLock: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;