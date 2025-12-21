import React, { useState } from 'react';
import { mouAPI } from '../utils/api';
import '../styles/MOUForm.css';
import Navbar from './Navbar';

function MOUForm() {
  const [mou, setMou] = useState({
    Institute: '',
    Duration: '',
    FacultyName: '',
    FacultyDetails: '',
    AcademicYear: '',
    Purpose: '',
    Outcomes: '',
    SignedDoc: null // for file input
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    setMou({ ...mou, [name]: files ? files[0] : value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();

    for (const key in mou) {
      if (mou[key]) {
        formData.append(key, mou[key]);
      }
    }
    const addedDate = new Date().toISOString(); 
    formData.append('AddedDate', addedDate);
    
    try {
      await mouAPI.add(formData);
      setSuccess('MOU added successfully!');
      // Reset form
      setMou({
        Institute: '',
        Duration: '',
        FacultyName: '',
        FacultyDetails: '',
        AcademicYear: '',
        Purpose: '',
        Outcomes: '',
        SignedDoc: null
      });
      // Reset file input
      e.target.reset();
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || error.response.data.message || 'Error adding MOU');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <form className="mou-form" onSubmit={handleSubmit}>
        <h2>Add New MOU</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
        {Object.entries(mou).map(([key, val]) =>
          key !== 'SignedDoc' ? (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={mou[key]}
              onChange={handleChange}
              required
              disabled={loading}
            />
          ) : (
            <input
              key={key}
              name="SignedDoc"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleChange}
              disabled={loading}
            />
          )
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </>
  );
}

export default MOUForm;
