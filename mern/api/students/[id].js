const { app, connectToDatabase } = require('../../server');

module.exports = async function handler(req, res) {
  try {
    await connectToDatabase();

    const studentId = req.query.id;
    if (!/^\d+$/.test(String(studentId || ''))) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    req.url = `/api/students/${studentId}`;
    return app(req, res);
  } catch (error) {
    console.error('Student API request failed:', error.message);
    return res.status(500).json({ message: 'API service unavailable' });
  }
};