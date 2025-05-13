import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { FiUploadCloud } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import useAssessmentStore from '../../store/InterviewStore';
import DataTable from '../../components/admin/InterviewTable';
import ChartView from '../../components/admin/ChartView';
import '../../Styles/InterviewManagement.css';

export default function InterviewManagement() {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    data,
    headers,
    loading: isLoading,
    error,
    hasData,
    showCharts,
    setData,
    setHeaders,
    setLoading,
    setError,
    setHasData,
    toggleView
  } = useAssessmentStore();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setHasData(false);
    if (e.target.files) e.target.value = null;

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      reader.onload = (event) => {
        try {
          Papa.parse(event.target.result, {
            header: true,
            complete: (results) => {
              const filteredData = results.data.filter(row => 
                Object.values(row).some(val => val !== undefined && val !== null && val !== '')
              );
              
              if (filteredData.length === 0) {
                throw new Error('CSV file is empty or contains no valid data');
              }

              const cleanedData = filteredData.map(row => {
                const cleanedRow = {};
                Object.keys(row).forEach(key => {
                  const value = row[key];
                  cleanedRow[key.trim()] = typeof value === 'string' ? value.trim() : value;
                });
                return cleanedRow;
              });

              setHeaders(Object.keys(cleanedData[0]));
              setData(cleanedData);
              setHasData(true);
              setLoading(false);
            },
            error: (error) => {
              throw new Error(`CSV parsing error: ${error.message}`);
            }
          });
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } 
    else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (jsonData.length === 0) {
            throw new Error('Excel file is empty or contains no valid data');
          }

          const headers = Object.keys(jsonData[0]);
          const cleanedData = jsonData.map(row => {
            const cleanedRow = {};
            headers.forEach(header => {
              let value = row[header];
              if (value instanceof Date) {
                value = value.toISOString().split('T')[0];
              } else if (typeof value === 'string') {
                value = value.trim();
                if (!isNaN(value) && value !== '') {
                  value = parseFloat(value);
                }
              }
              cleanedRow[header.trim()] = value;
            });
            return cleanedRow;
          });

          setHeaders(headers);
          setData(cleanedData);
          setHasData(true);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } 
    else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
      setLoading(false);
    }
  };

  return (
    <Box className="interview-management">
      {!hasData ? (
        <motion.div 
          className={`upload-container ${dragActive ? 'drag-active' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileUpload} 
            className="file-input"
          />
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="upload-icon"
          >
            <FiUploadCloud size={48} />
          </motion.div>
          <Typography variant="h5" className="upload-title">
            Upload Interview Data
          </Typography>
          <Typography className="upload-subtitle">
            {dragActive ? 'Drop your file here' : 'Click or drag files to upload'}
          </Typography>
          {isLoading && <CircularProgress className="upload-progress" />}
          {error && (
            <Alert severity="error" className="upload-error">
              {error}
            </Alert>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="content-container"
        >
          {showCharts ? (
            <ChartView 
              data={data} 
              onToggleView={toggleView} 
            />
          ) : (
            <DataTable />
          )}
        </motion.div>
      )}
    </Box>
  );
}