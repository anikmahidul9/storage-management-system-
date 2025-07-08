import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileType: { type: String, required: true }, // Added fileType
  path: { type: String, required: false }, // Made path optional
  size: { type: Number }, // Made size optional
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  isFavorite: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  lockPassword: { type: String, select: false }, // Hashed password
  lockedAt: { type: Date },
  lockReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  content: { type: String } // For notes
});

const File = mongoose.model('File', fileSchema);
export default File;