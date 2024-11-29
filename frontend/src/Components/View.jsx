import React, { useState } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import Sample from './Sample';

const View = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showSample, setShowSample] = useState(false);
  const [showCsv, setShowCsv] = useState(true);
  const [loading, setLoading] = useState(false);

  const rowsPerPage = 30;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowSample = () => {
    setShowCsv(false); 
    setShowSample(true);
  };

  const handleShowCsv = () => {
    setShowCsv(true); 
    setShowSample(false);
  };

  const handleSubmitToS3 = async () => {
    setLoading(true);
    try {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((field) => JSON.stringify(row[field] || '')).join(',')
        ),
      ];
      const csvContent = csvRows.join('\n');

      const csvData = new Blob([csvContent], { type: 'text/csv' });

      const formData = new FormData();
      formData.append('file', csvData, 'data.csv');

      const response = await axios.post('http://127.0.0.1:8000/upload-to-s3/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(response.data.message); 
    } catch (error) {
      console.error(error);
      alert('Failed to upload the file to S3.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-40 flex-col overflow-scroll h-screen">
      <div className="flex justify-center items-center mb-4">
      <motion.button
          className="btn button mx-auto w-96 max-w-1/2"
          whileHover={{ x: -7, y: -7 }}
          onClick={handleSubmitToS3}
        >
          {loading ? (
            <div className="loader"></div>
          ) : (
            "Submit Data for Analysis 🚀"
          )}
        </motion.button>

        <motion.button
          className="btn button mx-auto w-96 max-w-1/2"
          whileHover={{ x: -7, y: -7 }}
          onClick={handleShowSample}
        >
          Analyze Reports 📊
        </motion.button>

        <motion.button
          className="btn button mx-auto w-96 max-w-1/2"
          whileHover={{ x: -7, y: -7 }}
          onClick={handleShowCsv}
        >
          View CSV 📑
        </motion.button>
      </div>

      {showCsv ? (
        <>
          <div className="flex justify-center mb-4 px-10">
            <div className="flex justify-center my-1 mx-20 w-3/5">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 mx-1 border rounded-xl ${
                    index + 1 === currentPage
                      ? 'bg-white text-[#1b263b]'
                      : 'bg-[#1b263b] text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <table className="table-auto w-full border p-20 overflow-scroll h-screen">
            <thead>
              <tr>
                {Object.keys(data[0]).map((header) => (
                  <th key={header} className="border px-4 py-2 bg-gray-100">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((cell, i) => (
                    <td key={i} className="border px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : showSample ? (
        <Sample />
      ) : null}
    </div>
  );
};

export default View;
