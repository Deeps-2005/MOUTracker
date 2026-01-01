import React, { useState } from 'react';
import { mouAPI } from '../utils/api';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import '../styles/MOUForm.css';
import Navbar from './Navbar';

function MOUForm() {
  const { showToast } = useToast();
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate email
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    }
    
    // Validate phone
    if (name === 'phone' && value && !/^[0-9+\-\s()]*$/.test(value)) {
      setFieldErrors(prev => ({ ...prev, phone: 'Invalid phone format' }));
    }
    
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
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    
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
      showToast('MOU added successfully!', 'success');
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
        showToast(error.response.data.error || error.response.data.message || 'Error adding MOU', 'error');
      } else {
        showToast('Network error. Please try again.', 'error');
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
      {loading ? (
        <LoadingSpinner size="large" message="Submitting MOU..." />
      ) : (
        <form className="mou-form" onSubmit={handleSubmit}>
          <h2>Add New MOU</h2>
          
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
                  {fieldErrors.SignedDoc && <span className="field-error">{fieldErrors.SignedDoc}</span>}
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
                    className={fieldErrors[key] ? 'error' : ''}
                  />
                  {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
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
                  className={fieldErrors[key] ? 'error' : ''}
                />
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
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
                  className={fieldErrors[key] ? 'error' : ''}
                />
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
              </div>
            );
          }
        })}
        
        <button type="submit" disabled={loading || Object.keys(fieldErrors).some(k => fieldErrors[k])}>
          Submit
        </button>
      </form>
      )}
    </>
  );
}

export default MOUForm;
