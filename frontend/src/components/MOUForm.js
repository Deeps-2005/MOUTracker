import React, { useState } from 'react';
import { mouAPI } from '../utils/api';
import '../styles/MOUForm.css';
import Navbar from './Navbar';

function MOUForm() {
  const [mou, setMou] = useState({
    mouId: '',
    institute: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    faculty: '',
    department: '',
    academicYear: '',
    startDate: '',
    duration: '',
    expiryDate: '',
    purpose: '',
    expectedOutcome: '',
    SignedDoc: null // for file input
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    
    // Auto-calculate expiry date when start date or duration changes
    if (name === 'startDate' || name === 'duration') {
      const updatedMou = { ...mou, [name]: files ? files[0] : value };
      if (updatedMou.startDate && updatedMou.duration) {
        const start = new Date(updatedMou.startDate);
        const years = parseInt(updatedMou.duration);
        if (!isNaN(years)) {
          start.setFullYear(start.getFullYear() + years);
          updatedMou.expiryDate = start.toISOString().split('T')[0];
        }
      }
      setMou(updatedMou);
    } else {
      setMou({ ...mou, [name]: files ? files[0] : value });
    }
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
      if (mou[key] && key !== 'SignedDoc') {
        formData.append(key, mou[key]);
      }
    }
    
    // Add file if present
    if (mou.SignedDoc) {
      formData.append('SignedDoc', mou.SignedDoc);
    }
    
    // Generate MOU ID if not provided
    if (!mou.mouId) {
      formData.set('mouId', `MOU-${Date.now()}`);
    }
    
    try {
      await mouAPI.add(formData);
      setSuccess('MOU added successfully!');
      // Reset form
      setMou({
        mouId: '',
        institute: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        faculty: '',
        department: '',
        academicYear: '',
        startDate: '',
        duration: '',
        expiryDate: '',
        purpose: '',
        expectedOutcome: '',
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

  const fieldLabels = {
    mouId: 'MOU ID (Optional)',
    institute: 'Institute Name',
    contactPerson: 'Contact Person',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    faculty: 'Faculty',
    department: 'Department',
    academicYear: 'Academic Year',
    startDate: 'Start Date',
    duration: 'Duration (years)',
    expiryDate: 'Expiry Date (auto-calculated)',
    purpose: 'Purpose',
    expectedOutcome: 'Expected Outcome'
  };

  return (
    <>
      <Navbar />
      <form className="mou-form" onSubmit={handleSubmit}>
        <h2>Add New MOU</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
        
        {Object.entries(mou).map(([key, val]) => {
          if (key === 'SignedDoc') {
            return (
              <div key={key}>
                <label>Signed Document (PDF, DOC, DOCX, JPG, PNG)</label>
                <input
                  name="SignedDoc"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            );
          } else if (key === 'startDate' || key === 'expiryDate') {
            return (
              <div key={key}>
                <label>{fieldLabels[key]}</label>
                <input
                  name={key}
                  type="date"
                  value={mou[key]}
                  onChange={handleChange}
                  required={key === 'startDate'}
                  disabled={loading || key === 'expiryDate'}
                  readOnly={key === 'expiryDate'}
                />
              </div>
            );
          } else if (key === 'purpose' || key === 'expectedOutcome' || key === 'address') {
            return (
              <div key={key}>
                <label>{fieldLabels[key]}</label>
                <textarea
                  name={key}
                  placeholder={fieldLabels[key]}
                  value={mou[key]}
                  onChange={handleChange}
                  required={key === 'purpose'}
                  disabled={loading}
                  rows="3"
                />
              </div>
            );
          } else {
            return (
              <div key={key}>
                <label>{fieldLabels[key]}</label>
                <input
                  name={key}
                  type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'duration' ? 'number' : 'text'}
                  placeholder={fieldLabels[key]}
                  value={mou[key]}
                  onChange={handleChange}
                  required={!['mouId', 'department', 'expectedOutcome'].includes(key)}
                  disabled={loading}
                  min={key === 'duration' ? '1' : undefined}
                />
              </div>
            );
          }
        })}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </>
  );
}

export default MOUForm;
