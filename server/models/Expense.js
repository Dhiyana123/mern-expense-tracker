// Expense model schema for MongoDB
import mongoose from 'mongoose';

// Define the expense schema with required fields
const expenseSchema = new mongoose.Schema({
  // Amount spent (required, must be a positive number)
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  // Category of the expense (e.g., Food, Transport, etc.)
  category: {
    type: String,
    required: true,
    trim: true
  },
  // Description of the expense
  description: {
    type: String,
    required: true,
    trim: true
  },
  // Timestamp for when the expense was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Expense model
const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
