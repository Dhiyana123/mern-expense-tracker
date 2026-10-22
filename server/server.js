// Main server file for Expense Tracker backend
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Expense from './models/Expense.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===== API ROUTES =====

// GET /expenses - Retrieve expenses with pagination and filtering
app.get('/expenses', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    // Build query for filtering
    const query = category && category !== "All" && category !== "" ? { category } : {};
    
    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters. Page and limit must be positive numbers.' 
      });
    }
    
    // Execute queries in parallel for better performance
    const [expenses, totalCount] = await Promise.all([
      // Get paginated expenses
      Expense.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      
      // Get total count for pagination
      Expense.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    res.json({
      expenses,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ 
      message: 'Error fetching expenses', 
      error: error.message 
    });
  }
});

// GET /categories - Get unique categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Expense.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// GET /expenses/total - Get total expenses amount (optional endpoint)
app.get('/expenses/total', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category && category !== "All" && category !== "" ? { category } : {};
    
    const result = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    
    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
    
    res.json({ totalAmount });
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    res.status(500).json({ 
      message: 'Error calculating total expenses', 
      error: error.message 
    });
  }
});

// POST /expenses - Create a new expense
app.post('/expenses', async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    // Validation
    if (!amount || !category || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ message: 'Category must be a non-empty string' });
    }

    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ message: 'Description must be a non-empty string' });
    }

    const newExpense = new Expense({
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim()
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ 
      message: 'Error creating expense', 
      error: error.message 
    });
  }
});

// PUT /expenses/:id - Update an expense
app.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }
    
    const { amount, category, description } = req.body;

    // Validation
    if (!amount || !category || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { 
        amount: parseFloat(amount),
        category: category.trim(),
        description: description.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error updating expense', 
      error: error.message 
    });
  }
});

// DELETE /expenses/:id - Delete an expense
app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ 
      message: 'Expense deleted successfully',
      deletedExpense 
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ 
      message: 'Error deleting expense', 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});