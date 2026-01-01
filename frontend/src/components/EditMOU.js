import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mouAPI } from '../utils/api';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import Navbar from './Navbar';
import '../styles/MOUForm.css';

function EditMOU() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    status: 'active',
    SignedDoc: null
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMOU();
  }, [id]);

  const fetchMOU = async () => {
    try {
      setLoading(true);
      const data = await mouAPI.getById(id);
      
      // Format dates for input fields
      const formattedMou = {
        ...data,
        startDate: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
        expiryDate: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
        mouId: data.mou_id,
        institute: data.institute || '',
        contactPerson: data.contact_person || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        faculty: data.faculty || '',
        department: data.department || '',
        academicYear: data.academic_year || '',
        duration: data.duration || '',
        purpose: data.purpose || '',
        expectedOutcome: data.expected_outcome || '',
        status: data.status || 'active',
        SignedDoc: null
      };
      
      setMou(formattedMou);
    } catch (error) {
      showToast('Failed to fetch MOU details', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdate = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    
    const formData = new FormData();
    
    // Append all fields with correct backend field names
    formData.append('institute', mou.institute);
    formData.append('contactPerson', mou.contactPerson);
    formData.append('email', mou.email);
    formData.append('phone', mou.phone);
    formData.append('address', mou.address);
    formData.append('faculty', mou.faculty);
    formData.append('department', mou.department);
    formData.append('academicYear', mou.academicYear);
    formData.append('startDate', mou.startDate);
    formData.append('duration', mou.duration);
    formData.append('expiryDate', mou.expiryDate);
    formData.append('purpose', mou.purpose);
    formData.append('expectedOutcome', mou.expectedOutcome);
    formData.append('status', mou.status);
    
    // Add file if uploaded
    if (mou.SignedDoc) {
      formData.append('SignedDoc', mou.SignedDoc);
    }
    
    try {
      await mouAPI.update(id, formData);
      showToast('MOU updated successfully!', 'success');
      setTimeout(() => {
        navigate('/search');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        showToast(error.response.data.error || 'Failed to update MOU', 'error');
      } else {
        showToast('Network error. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldLabels = {
    mouId: 'MOU ID (Read-only)',
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
    expectedOutcome: 'Expected Outcome',
    status: 'Status'
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner size="large" message="Loading MOU details..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {submitting ? (
        <LoadingSpinner size="large" message="Updating MOU..." />
      ) : (
        <form className="mou-form" onSubmit={handleUpdate}>
          <h2>Edit MOU</h2>
          
          {Object.entries(mou).filter(([key]) => key !== 'SignedDoc' && key !== 'id').map(([key, val]) => {
            if (key === 'status') {
              return (
                <div key={key}>
                  <label>{fieldLabels[key]}</label>
                  <select
                    name={key}
                    value={mou[key]}
                    onChange={handleChange}
                    disabled={submitting}
                    className={fieldErrors[key] ? 'error' : ''}
                    style={{ padding: '10px', fontSize: '16px', border: '1px solid var(--border, #ccc)', borderRadius: 'var(--radius-md, 6px)' }}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="renewed">Renewed</option>
                    <option value="terminated">Terminated</option>
                  </select>
                  {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
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
                    disabled={submitting || key === 'expiryDate'}
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
                    disabled={submitting}
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
                    required={!['department', 'expectedOutcome'].includes(key)}
                    disabled={submitting || key === 'mouId'}
                    readOnly={key === 'mouId'}
                    min={key === 'duration' ? '1' : undefined}
                    className={fieldErrors[key] ? 'error' : ''}
                    style={key === 'mouId' ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                  />
                  {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
                </div>
              );
            }
          })}
          
          <div>
            <label>Update Signed Document (Optional)</label>
            <input
              name="SignedDoc"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
          
          <button type="submit" disabled={submitting || Object.keys(fieldErrors).some(k => fieldErrors[k])}>
            Update MOU
          </button>
        </form>
      )}
    </>
  );
}

export default EditMOU;
