const { app, connectToDatabase } = require('../server');

module.exports = async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('API request failed:', error.message);
    return res.status(500).json({ message: 'API service unavailable' });
  }
};