const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// POST /api/complaints — submit a new complaint (requires citizen login)
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { category, description, location } = req.body;
    const photo = req.file ? req.file.filename : null;

    const complaint = new Complaint({
      category,
      description,
      location,
      photo,
      reportedBy: req.user._id,
    });
    await complaint.save();

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/complaints/stats — aggregated statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const critical = await Complaint.countDocuments({ priority: 'Critical' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    // By category
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // By priority
    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Daily complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const daily = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { total, critical, pending, resolved, byCategory, byPriority, daily },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/complaints — get all with optional filters
router.get('/', async (req, res) => {
  try {
    const { priority, status, category } = req.query;
    const filter = {};
    if (priority && priority !== 'All Priorities') filter.priority = priority;
    if (status && status !== 'All Status') filter.status = status;
    if (category && category !== 'All Categories') filter.category = category;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/complaints/:id — get single complaint by complaintId
router.get('/:id', async (req, res) => {
  try {
    // Check mock complaints for the Home page display items
    const MOCK_COMPLAINTS = {
      'CMP-89XF2': {
        complaintId: 'CMP-89XF2',
        category: 'Infrastructure',
        description: 'A critical sinkhole on Main St was reported and filled before rush hour, preventing major accidents.',
        location: 'Main St',
        priority: 'Critical',
        status: 'Resolved',
        createdAt: new Date().toISOString()
      },
      'CMP-21PQ9': {
        complaintId: 'CMP-21PQ9',
        category: 'Electricity',
        description: 'A localized grid failure affecting the city hospital was prioritized and fixed in under an hour.',
        location: 'City Hospital',
        priority: 'Critical',
        status: 'Resolved',
        createdAt: new Date().toISOString()
      },
      'CMP-44RM1': {
        complaintId: 'CMP-44RM1',
        category: 'Water Supply',
        description: 'Rapid response teams stopped a massive leak downtown, saving thousands of gallons of water.',
        location: 'Downtown',
        priority: 'Critical',
        status: 'Resolved',
        createdAt: new Date().toISOString()
      }
    };

    if (MOCK_COMPLAINTS[req.params.id]) {
      return res.json({ success: true, data: MOCK_COMPLAINTS[req.params.id] });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/complaints/:id/status — update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { status },
      { new: true, runValidators: true }
    );
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
