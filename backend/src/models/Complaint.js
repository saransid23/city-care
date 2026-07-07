const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 7);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      default: () => `CMP-${nanoid()}`,
    },
    category: {
      type: String,
      required: true,
      enum: ['Pothole', 'Water Supply', 'Streetlight', 'Garbage', 'Electricity'],
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    location: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-classify priority based on keywords in description
complaintSchema.pre('save', function (next) {
  if (this.isNew) {
    const desc = this.description.toLowerCase();
    const criticalKeywords = ['danger', 'emergency', 'hazard', 'accident', 'fire', 'flood', 'electrocution', 'exposed wire', 'collapse'];
    const highKeywords = ['major', 'severe', 'broken', 'days', 'weeks', 'large', 'multiple', 'no water', 'no supply', 'leaking'];
    const mediumKeywords = ['moderate', 'overflowing', 'some', 'few', 'minor damage'];

    if (criticalKeywords.some(k => desc.includes(k))) {
      this.priority = 'Critical';
    } else if (highKeywords.some(k => desc.includes(k))) {
      this.priority = 'High';
    } else if (mediumKeywords.some(k => desc.includes(k))) {
      this.priority = 'Medium';
    } else {
      // Category-based fallback
      if (['Electricity', 'Water Supply'].includes(this.category)) {
        this.priority = 'High';
      } else if (this.category === 'Pothole') {
        this.priority = 'Medium';
      } else {
        this.priority = 'Low';
      }
    }
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
