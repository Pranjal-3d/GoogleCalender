import { Router } from 'express';
import Settings from '../models/Settings';

const router = Router();

// Get settings (returns only one object)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.patch('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
