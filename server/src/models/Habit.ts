import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  name: string;
  emoji: string;
  completedDates: Date[]; // Dates when this habit was completed
  color?: string;
}

const HabitSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  emoji: { type: String, default: '✨' },
  completedDates: { type: [Date], default: [] },
  color: { type: String, default: '#0b57d0' },
  alarmTime: { type: String, default: null }, // format: "HH:mm"
  isAlarmEnabled: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IHabit>('Habit', HabitSchema);
