import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  guests?: string[];
  meetLink?: string;
  color?: string;
  category?: string;
  eventType: 'event' | 'task' | 'appointment';
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String },
  guests: { type: [String], default: [] },
  meetLink: { type: String },
  color: { type: String, default: '#4285f4' },
  category: { type: String },
  eventType: { type: String, enum: ['event', 'task', 'appointment'], default: 'event' },
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, default: 1 },
    endDate: { type: Date }
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Index for performance and collision detection
EventSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
