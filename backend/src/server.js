const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Restaurant Inventory System API is running',
    timestamp: new Date()
  });
});

// Routes (will be added later)
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/ingredients', require('./routes/ingredient.routes'));
// app.use('/api/locations', require('./routes/location.routes'));
// app.use('/api/stock', require('./routes/stock.routes'));
// app.use('/api/recipes', require('./routes/recipe.routes'));
// app.use('/api/suppliers', require('./routes/supplier.routes'));
// app.use('/api/purchase-orders', require('./routes/purchaseOrder.routes'));
// app.use('/api/reports', require('./routes/report.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
