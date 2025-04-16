import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from './Navbar';
import '../styles/FilterDownload.css';

function FilterDownload() {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);

  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    const res = await axios.get('http://localhost:5000/api/mou/filter', { params: filters });
    setResults(res.data);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MOU Results");

    XLSX.writeFile(workbook, "Filtered_MOU_Results.xlsx");
  };

  const handleEdit = (index) => {
    const selected = results[index];
    localStorage.setItem('editData', JSON.stringify(selected));
    window.location.href = `/edit/${index}`;
  };
  
  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updated = [...results];
      updated.splice(index, 1);
      setResults(updated);
      axios.post('http://localhost:5000/api/mou/overwrite', updated); // you'll need this route in backend
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="filter-container">
        <h3>Filter , Edit, Manage & Export MOU Data</h3>
        <div className="filter-inputs">
          <input name="academicYear" placeholder="Academic Year" onChange={handleChange} />
          <input name="facultyName" placeholder="Faculty Name" onChange={handleChange} />
          <input name="duration" placeholder="Duration" onChange={handleChange} />
          <input name="institute" placeholder="Institute" onChange={handleChange} />
          <button onClick={handleSearch}>Search</button>
          {results.length > 0 && (
            <button onClick={handleExportExcel} className="excel-button">Export to Excel</button>
          )}
        </div>

        <div className="table-container">
          {results.length > 0 ? (
            <table>
              <thead>
  <tr>
    <th>Institute</th>
    <th>Duration</th>
    <th>Faculty Name</th>
    <th>Faculty Details</th>
    <th>Signed Document</th>
    <th>Academic Year</th>
    <th>Purpose</th>
    <th>Outcomes</th>
    <th>Actions</th>
  </tr>
</thead>
              <tbody>
                {results.map((row, index) => (
                <tr key={index} className="result-row">
                <td>{row.Institute}</td>
                <td>{row.Duration}</td>
                <td>{row.FacultyName}</td>
                <td>{row.FacultyDetails}</td>
                <td>{row.SignedDoc}</td>
                <td>{row.AcademicYear}</td>
                <td>{row.Purpose}</td>
                <td>{row.Outcomes}</td>
                <td className="action-buttons">
                <button onClick={() => handleEdit(index)} className="edit-btn">✏️</button>
                <button onClick={() => handleDelete(index)} className="delete-btn">🗑</button>
                </td>
                </tr>
                ))}
              </tbody>

            </table>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterDownload;
