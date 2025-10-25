const express = require('express');
const { body, validationResult } = require('express-validator');
const Record = require('../models/Record');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all medical records
router.get('/', auth, async (req, res) => {
  try {
    const { patientId, doctorId, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }
    
    // Additional filters
    if (patientId && req.user.role !== 'patient') {
      query.patientId = patientId;
    }
    if (doctorId && req.user.role !== 'doctor') {
      query.doctorId = doctorId;
    }

    const records = await Record.find(query)
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Record.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name email specialization phone')
      .populate('appointmentId', 'date time reason');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check access permissions
    const canAccess = req.user.role === 'admin' || 
                     record.patientId._id.toString() === req.user._id.toString() ||
                     record.doctorId._id.toString() === req.user._id.toString();

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(record);
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create medical record
router.post('/', auth, authorize('doctor', 'admin'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('prescription').optional().isArray().withMessage('Prescription must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      prescription,
      vitalSigns,
      labResults,
      notes,
      followUpDate
    } = req.body;

    // Validate prescription format if provided
    if (prescription && prescription.length > 0) {
      for (let i = 0; i < prescription.length; i++) {
        const med = prescription[i];
        if (!med.medication || !med.dosage || !med.frequency || !med.duration) {
          return res.status(400).json({ 
            message: `Prescription item ${i + 1} is missing required fields` 
          });
        }
      }
    }

    // Check if appointment exists and belongs to the patient
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.patientId.toString() !== patientId) {
        return res.status(400).json({ message: 'Invalid appointment for this patient' });
      }
    }

    const record = new Record({
      patientId,
      doctorId: req.user._id,
      appointmentId,
      diagnosis,
      symptoms,
      prescription,
      vitalSigns,
      labResults,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });

    await record.save();

    // Update appointment status if linked
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    }

    const populatedRecord = await Record.findById(record._id)
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time reason');

    res.status(201).json({
      message: 'Medical record created successfully',
      record: populatedRecord
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medical record
router.put('/:id', auth, authorize('doctor', 'admin'), [
  body('diagnosis').optional().notEmpty().withMessage('Diagnosis cannot be empty'),
  body('prescription').optional().isArray().withMessage('Prescription must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await Record.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if user can update this record
    const canUpdate = req.user.role === 'admin' || 
                     record.doctorId.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      diagnosis,
      symptoms,
      prescription,
      vitalSigns,
      labResults,
      notes,
      followUpDate
    } = req.body;

    // Validate prescription format if provided
    if (prescription && prescription.length > 0) {
      for (let i = 0; i < prescription.length; i++) {
        const med = prescription[i];
        if (!med.medication || !med.dosage || !med.frequency || !med.duration) {
          return res.status(400).json({ 
            message: `Prescription item ${i + 1} is missing required fields` 
          });
        }
      }
    }

    const updateData = {
      diagnosis: diagnosis || record.diagnosis,
      symptoms: symptoms !== undefined ? symptoms : record.symptoms,
      prescription: prescription !== undefined ? prescription : record.prescription,
      vitalSigns: vitalSigns !== undefined ? vitalSigns : record.vitalSigns,
      labResults: labResults !== undefined ? labResults : record.labResults,
      notes: notes !== undefined ? notes : record.notes,
      followUpDate: followUpDate !== undefined ? (followUpDate ? new Date(followUpDate) : null) : record.followUpDate
    };

    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone dateOfBirth gender')
     .populate('doctorId', 'name email specialization')
     .populate('appointmentId', 'date time reason');

    res.json({
      message: 'Medical record updated successfully',
      record: updatedRecord
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft delete medical record
router.delete('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if user can delete this record
    const canDelete = req.user.role === 'admin' || 
                     record.doctorId.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Record.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
