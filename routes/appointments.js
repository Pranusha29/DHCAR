const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all appointments
router.get('/', auth, async (req, res) => {
  try {
    const { doctorId, patientId, status, date, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }
    
    // Additional filters
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ date: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name email specialization phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check access permissions
    const canAccess = req.user.role === 'admin' || 
                     appointment.patientId._id.toString() === req.user._id.toString() ||
                     appointment.doctorId._id.toString() === req.user._id.toString();

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment
router.post('/', auth, [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').optional().notEmpty().withMessage('Reason cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId, date, time, reason, notes, duration = 30 } = req.body;

    // Check if doctor exists and is active
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found or inactive' });
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(date);
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['scheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Patients can only book for themselves, admins can book for any patient
    const patientId = req.user.role === 'admin' ? req.body.patientId || req.user._id : req.user._id;

    const appointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      time,
      reason,
      notes,
      duration
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', auth, [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().notEmpty().withMessage('Time is required'),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     appointment.patientId.toString() === req.user._id.toString() ||
                     appointment.doctorId.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { date, time, status, reason, notes, duration } = req.body;

    // Check for conflicts if time is being changed
    if (date || time) {
      const appointmentDate = date ? new Date(date) : appointment.date;
      const appointmentTime = time || appointment.time;
      const doctorId = appointment.doctorId;

      const existingAppointment = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
        status: { $in: ['scheduled'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'Time slot is already booked' });
      }
    }

    const updateData = {
      date: date ? new Date(date) : appointment.date,
      time: time || appointment.time,
      status: status || appointment.status,
      reason: reason !== undefined ? reason : appointment.reason,
      notes: notes !== undefined ? notes : appointment.notes,
      duration: duration || appointment.duration
    };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone')
     .populate('doctorId', 'name email specialization');

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' || 
                     appointment.patientId.toString() === req.user._id.toString() ||
                     appointment.doctorId.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
