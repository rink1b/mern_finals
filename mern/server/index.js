const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { studentsSeed } = require('./data/sampleData');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5010;
let students = [...studentsSeed];

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running.' });
});

app.get('/api/dashboard', (_req, res) => {
  res.json({ students });
});

app.get('/api/students', (_req, res) => {
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const student = {
    id: Date.now(),
    ...req.body
  };

  students.unshift(student);
  res.status(201).json(student);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const studentIndex = students.findIndex((item) => item.id === Number(id));

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  students[studentIndex] = { ...students[studentIndex], ...req.body };
  res.json(students[studentIndex]);
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const studentIndex = students.findIndex((item) => item.id === Number(id));

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const [removed] = students.splice(studentIndex, 1);
  res.json(removed);
});

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGODB_URI not set, using in-memory sample data');
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

startServer();
