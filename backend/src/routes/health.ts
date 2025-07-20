import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
  try {
    // Add database connection check here if needed
    res.status(200).json({
      status: 'Ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected', // Update this with actual DB check
        api: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'Not Ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;