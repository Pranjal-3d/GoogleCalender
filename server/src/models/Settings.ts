import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  focusMode: boolean;
  theme: 'light' | 'dark' | 'system';
  hiddenCalendars: string[];
  workingHours: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

const SettingsSchema: Schema = new Schema({
  focusMode: { type: Boolean, default: false },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  hiddenCalendars: { type: [String], default: [] },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    enabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  capped: { size: 1024, max: 1 } // Only keep one settings document for now (single user)
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
