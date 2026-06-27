import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    let query = {};
    if (start && end) {
      query = {
        $or: [
          { startTime: { $gte: new Date(start as string), $lte: new Date(end as string) } },
          { endTime: { $gte: new Date(start as string), $lte: new Date(end as string) } },
          { startTime: { $lte: new Date(start as string) }, endTime: { $gte: new Date(end as string) } }
        ]
      };
    }
    const events = await Event.find(query).sort({ startTime: 1 });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime, description, color, location, guests, meetLink, isRecurring, recurrenceRule, eventType, metadata } = req.body;

    // Check for overlaps (skip for appointment templates)
    const overlapping = eventType === 'appointment' ? null : await Event.findOne({
      eventType: { $ne: 'appointment' },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
      ]
    });

    if (overlapping && !req.query.force) {
      return res.status(409).json({
        message: 'Collision detected: This event overlaps with an existing one.',
        overlappingEvent: overlapping
      });
    }

    const newEvent = new Event({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description,
      color,
      location,
      guests,
      meetLink,
      eventType: eventType || 'event',
      isRecurring,
      recurrenceRule,
      metadata
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (startTime && endTime) {
      const overlapping = await Event.findOne({
        _id: { $ne: id },
        $or: [
          { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
          { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
          { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
        ]
      });

      if (overlapping && !req.query.force) {
        return res.status(409).json({
          message: 'Collision detected: This update will overlap with an existing event.',
          overlappingEvent: overlapping
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
