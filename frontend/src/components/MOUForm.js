import React, { useState } from 'react';
import axios from 'axios';
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

  const handleChange = e => {
    const { name, value, files } = e.target;
    setMou({ ...mou, [name]: files ? files[0] : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();

    for (const key in mou) {
      formData.append(key, mou[key]);
    }
    const addedDate = new Date().toISOString(); 
    formData.append('AddedDate', addedDate);
    try {
      await axios.post('http://localhost:5000/api/mou/add', formData);
      alert('MOU added!');
    } catch (error) {
      alert('Error adding MOU');
    }
  };

  return (
    <>
      <Navbar />
      <form className="mou-form" onSubmit={handleSubmit}>
        {Object.entries(mou).map(([key, val]) =>
          key !== 'SignedDoc' ? (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={mou[key]}
              onChange={handleChange}
              required
            />
          ) : (
            <input
              key={key}
              name="SignedDoc"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleChange}
              required
            />
          )
        )}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default MOUForm;
