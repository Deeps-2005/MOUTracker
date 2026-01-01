import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mouAPI } from '../utils/api';
import Navbar from './Navbar';
import '../styles/MOUForm.css';

function EditMOU() {
  const { id } = useParams(); // Changed from index to id
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('Failed to fetch MOU details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
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
      setSuccess('MOU updated successfully!');
      setTimeout(() => {
        navigate('/search');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to update MOU');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
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

  if (loading && !mou.mouId) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <p>Loading MOU details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>Edit MOU</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>{success}</div>}
        
        <form className="mou-form" onSubmit={handleUpdate}>
          {Object.entries(mou).filter(([key]) => key !== 'SignedDoc' && key !== 'id').map(([key, val]) => {
            if (key === 'status') {
              return (
                <div key={key}>
                  <label>{fieldLabels[key]}</label>
                  <select
                    name={key}
                    value={mou[key]}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px' }}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="renewed">Renewed</option>
                    <option value="terminated">Terminated</option>
                  </select>
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
            } else if (key === 'mouId') {
              return (
                <div key={key}>
                  <label>{fieldLabels[key]}</label>
                  <input
                    name={key}
                    type="text"
                    value={mou[key]}
                    disabled
                    readOnly
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
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
                    required={!['department', 'expectedOutcome'].includes(key)}
                    disabled={loading}
                    min={key === 'duration' ? '1' : undefined}
                  />
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
              disabled={loading}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Leave empty to keep existing document</small>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Updating...' : 'Update MOU'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/search')} 
              disabled={loading}
              style={{ flex: 1, backgroundColor: '#95a5a6' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMOU;
