import Habit from '../data/model/habitModel.js';
import User from '../data/model/userModel.js';

export const getAllHabits = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find entries that belong to the current user
        const habits = await Habit.find({ user: userId });

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
    const { name, description } = req.body;
    const userId = req.user.id; // Access user ID from the JWT token
    try {
        const newHabit = new Habit({ name, description });
        await newHabit.save();

        // Find the user and update their list of habits
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        user.habits.push(newHabit._id);
        await user.save();

        res.status(201).json(newHabit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHabit = async (req, res) => {
    const { id } = req.params;
    const { name, description, completions } = req.body;
    try {
        const habit = await Habit.findByIdAndUpdate(
            id,
            { name, description, completions },
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
        const habit = await Habit.findByIdAndDelete(id);
        if (!habit) {
            return res.status(404).send('Habit not found');
        }

        // Find the user and remove the habit ID from their habits array
        await User.findByIdAndUpdate(habit.user, { $pull: { habits: habit._id } });

        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHabitCompletion = async (req, res) => {
    const { id } = req.params;
    const { date, completed } = req.body;
    try {
        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        const completionIndex = habit.completions.findIndex(c => c.date.toISOString() === new Date(date).toISOString());
        if (completionIndex >= 0) {
            habit.completions[completionIndex].completed = completed;
        } else {
            habit.completions.push({ date, completed });
        }
        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
