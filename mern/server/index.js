const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { studentsSeed } = require('./data/sampleData');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5010;
let students = [...studentsSeed];
let databaseConnected = false;
let connectionPromise;

const studentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  course: { type: String, required: true },
  year: String,
  grade: String,
  status: String,
  phone: String
}, { versionKey: false, id: false });

const Student = mongoose.model('Student', studentSchema);

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to use the deployed API');
  }

  if (databaseConnected) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then(async () => {
        if (await Student.countDocuments() === 0) {
          await Student.insertMany(studentsSeed);
        }
        databaseConnected = true;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

app.use(cors());
app.use(express.json());

async function getStudents() {
  if (databaseConnected) {
    return Student.find().sort({ id: -1 }).lean();
  }

  return students;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running.',
    database: databaseConnected ? 'connected' : 'in-memory'
  });
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    res.json({ students: await getStudents() });
  } catch (error) {
    console.error('Failed to load students:', error.message);
    res.status(500).json({ message: 'Failed to load students' });
  }
});

app.get('/api/students', async (_req, res) => {
  try {
    res.json(await getStudents());
  } catch (error) {
    console.error('Failed to load students:', error.message);
    res.status(500).json({ message: 'Failed to load students' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const studentData = { ...req.body, id: Date.now() };
    if (databaseConnected) {
      const student = await Student.create(studentData);
      return res.status(201).json(student);
    }

    students.unshift(studentData);
    res.status(201).json(studentData);
  } catch (error) {
    console.error('Failed to create student:', error.message);
    res.status(500).json({ message: 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates._id;

  if (databaseConnected) {
    try {
      const student = await Student.findOneAndUpdate(
        { id: Number(id) },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      return res.json(student);
    } catch (error) {
      console.error('Failed to update student:', error.message);
      return res.status(500).json({ message: 'Failed to update student' });
    }
  }

  const studentIndex = students.findIndex((item) => item.id === Number(id));
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  students[studentIndex] = { ...students[studentIndex], ...updates };
  res.json(students[studentIndex]);
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;

  if (databaseConnected) {
    try {
      const student = await Student.findOneAndDelete({ id: Number(id) }).lean();
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      return res.json(student);
    } catch (error) {
      console.error('Failed to delete student:', error.message);
      return res.status(500).json({ message: 'Failed to delete student' });
    }
  }

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
      await connectToDatabase();
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGODB_URI not set, using in-memory sample data');
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, connectToDatabase };
