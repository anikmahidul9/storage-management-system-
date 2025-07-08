import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, required: true }, // File or Folder ID
  itemType: { type: String, enum: ['file', 'folder'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permission: { type: String, enum: ['view', 'edit'], default: 'view' },
  createdAt: { type: Date, default: Date.now }
});

const Share = mongoose.model('Share', shareSchema);
export default Share;