import Habit from '../models/Habit.js';

export const getAllHabits = async (req, res) => {
    try {
      const habits = await Habit.find();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
export const getHabit = async (req, res) => {
    const { id } = req.params;
    try {
      const habit = await Habit.findById(id);
      if (!habit) return res.status(404).json({ message: 'Habit not found' });
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

export const createHabit = async (req, res) => {
  const { name, description, frequency } = req.body;
  try {
    const newHabit = new Habit({ name, description, frequency });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabit = async (req, res) => {
  const { id } = req.params;
  const { name, description, frequency, completed } = req.body;
  try {
    const habit = await Habit.findByIdAndUpdate(
      id,
      { name, description, frequency, completed },
      { new: true }
    );
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  const { id } = req.params;
  try {
    await Habit.findByIdAndDelete(id);
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
