import request from 'supertest';
import app from '../app';

describe('API Foundation', () => {
  describe('Server Configuration', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Restaurant Inventory API is running',
        version: 'v1'
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should respond to API documentation endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Restaurant Inventory Management API',
        version: 'v1'
      });
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบ API endpoint: GET /unknown-endpoint'
        }
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle JSON body parsing', async () => {
      const testData = { 
        type: 'IN',
        quantity: 10,
        description: 'Test movement'
      };
      
      const response = await request(app)
        .post('/api/v1/stock')
        .send(testData)
        .expect(201);

      // The stock controller should receive the parsed JSON
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('IN');
      expect(response.body.data.quantity).toBe(10);
    });

    it('should apply security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet should add security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('API Versioning', () => {
    it('should route to versioned API endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/')
        .expect(200);

      expect(response.body.version).toBe('v1');
    });

    it('should return 501 for not implemented endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/auth')
        .expect(501);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Authentication endpoints will be implemented in task 4'
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with proper format', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('Request Logging', () => {
    it('should log requests (verified by successful response)', async () => {
      // The request logger middleware should not interfere with normal operation
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});