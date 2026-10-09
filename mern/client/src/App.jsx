import { useEffect, useState } from 'react';
import axios from 'axios';

const emptyForm = {
  name: '',
  email: '',
  age: '',
  course: '',
  year: '1st Year',
  grade: 'A',
  status: 'Active',
  phone: ''
};

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const validateForm = () => {
    const { name, email, age, course, phone } = formData;

    if (!name.trim() || !email.trim() || !course.trim() || !phone.trim()) {
      return 'Please fill in all required fields.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError('');

    try {
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      resetForm();
      fetchDashboard();
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      age: student.age,
      course: student.course,
      year: student.year,
      grade: student.grade,
      status: student.status,
      phone: student.phone
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`);
      fetchDashboard();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading student management...</div>;
  }

  const activeStudents = students.filter((student) => student.status === 'Active').length;

  return (
    <div className="student-app">
      <main className="main-panel">
        <header className="topbar">
          <div className="title-block">
            <h1>Student Management</h1>
          </div>
        </header>

        <section className="stats-grid" aria-label="Student totals">
          <div className="stat-card blue">
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
          <div className="stat-card green">
            <span>Active</span>
            <strong>{activeStudents}</strong>
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <h3>{editingId ? 'Edit Student' : 'Add Student'}</h3>
          </div>

          <form onSubmit={handleSubmit} noValidate className="student-form">
              <div className="field-group two-col">
                <label>
                  Full Name
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </label>
                <label>
                  Phone
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </label>
              </div>

              <div className="field-group two-col">
                <label>
                  Email
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </label>
                <label>
                  Age
                  <input type="text" name="age" value={formData.age} onChange={handleChange} />
                </label>
                <label>
                  Course
                  <input type="text" name="course" value={formData.course} onChange={handleChange} />
                </label>
              </div>

              <div className="field-group two-col">
                <label>
                  Year
                  <select name="year" value={formData.year} onChange={handleChange}>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </label>
                <label>
                  Grade
                  <select name="grade" value={formData.grade} onChange={handleChange}>
                    <option>A</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </label>
              </div>

              <div className="field-group">
                <label>
                  Status
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Probation</option>
                    <option>Graduated</option>
                  </select>
                </label>
              </div>

              {formError && (
                <div className="form-error" role="alert">
                  <span className="error-icon">!</span>
                  {formError}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="primary-btn">{editingId ? 'Update' : 'Save'}</button>
                <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
              </div>
          </form>
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <h3>Student List</h3>
            <span className="table-count">{students.length} records</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Course</th>
                <th>Year</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.age}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>{student.grade}</td>
                  <td>
                    <span className={`status ${student.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="mini-btn edit" onClick={() => handleEdit(student)}>Edit</button>
                    <button className="mini-btn delete" onClick={() => handleDelete(student.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
