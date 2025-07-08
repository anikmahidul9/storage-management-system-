import File from "../models/File.js";
import Folder from "../models/Folder.js";
import Share from "../models/Share.js";


export const shareItem = async (req, res) => {
  try {
    const { itemId, itemType, sharedWith, permission } = req.body;
    
    // Validate item type
    if (!['file', 'folder'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    // Check if item exists
    const model = itemType === 'file' ? File : Folder;
    const item = await model.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const share = new Share({
      item: itemId,
      itemType,
      owner: req.user.id,
      sharedWith,
      permission
    });

    await share.save();
    res.status(201).json(share);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSharedItems = async (req, res) => {
  try {
    const sharedItems = await Share.find({ sharedWith: req.user.id })
      .populate({ path: 'item', model: 'File' }) 
      .populate('owner', 'username email');
    res.json(sharedItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};