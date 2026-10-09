const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
 
const app = express();
 

app.use(express.json());
 

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173', 
  'http://localhost:3000'  
].filter(Boolean);
 
app.use(cors({
  origin: function (origin, callback) {
   
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Not Allowed for this origin'));
    }
  },
  credentials: true
}));
 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));
 

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running smoothly' });
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello mula sa Render Backend!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});