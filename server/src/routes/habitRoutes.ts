import { Router } from 'express';
import Habit from '../models/Habit';

const router = Router();

// Get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle habit completion for a specific date
router.post('/:id/toggle', async (req, res) => {
  try {
    const { date } = req.body;
    const habitDate = new Date(date);
    habitDate.setHours(0, 0, 0, 0);

    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const existingIndex = habit.completedDates.findIndex(d => 
      new Date(d).getTime() === habitDate.getTime()
    );

    if (existingIndex > -1) {
      habit.completedDates.splice(existingIndex, 1);
    } else {
      habit.completedDates.push(habitDate);
    }

    await habit.save();
    res.json(habit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Initial habits seeding (single-use)
router.post('/seed', async (req, res) => {
  try {
    const count = await Habit.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Habits already exist' });

    const initialHabits = [
      { name: 'Drink Water', emoji: '💧' },
      { name: 'Read', emoji: '📚' },
      { name: 'Work out', emoji: '🏋️' },
      { name: 'Meditate', emoji: '🧘' },
      { name: 'Deep Work', emoji: '🧠' },
      { name: 'Learn Something', emoji: '🎓' },
      { name: 'Journal', emoji: '📓' }
    ];

    await Habit.insertMany(initialHabits);
    res.json({ message: 'Habits seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create new habit
router.post('/', async (req, res) => {
  try {
    const habit = new Habit(req.body);
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update habit
router.patch('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
