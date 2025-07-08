const checkLockStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isFile = req.path.includes('/files/');
    const Model = isFile ? File : Folder;
    
    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Skip check for owners
    if (item.owner.toString() === req.user.id) return next();

    // Check lock status
    if (item.isLocked) {
      // Verify password if provided
      if (req.headers['x-lock-password']) {
        const isValid = await bcrypt.compare(
          req.headers['x-lock-password'],
          item.lockPassword
        );
        if (isValid) return next();
      }
      
      return res.status(423).json({ // 423 = Locked
        error: 'Item is locked',
        lockedAt: item.lockedAt,
        reason: item.lockReason
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Lock check failed' });
  }
};

export default checkLockStatus;