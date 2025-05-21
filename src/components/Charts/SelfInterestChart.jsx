import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiAward,
  FiBriefcase,
  FiMapPin,
  FiCode,
  FiClipboard,
  FiBarChart2,
  FiActivity,
  FiDownload
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import '../../Styles/SelfInterestChart.css';

const SelfInterestChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [animated, setAnimated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);


  const blueTheme = {
    dark: '#1a365d',
    medium: '#2b6cb0',
    light: '#4299e1',
    lighter: '#bee3f8',
    lightest: '#ebf8ff'
  };

  const employeeOptions = useMemo(() => {
    const names = new Set();
    data.forEach(row => {
      if (row['Resource Name']) {
        names.add(row['Resource Name']);
      }
    });
    return Array.from(names).sort();
  }, [data]);

  // Get employee details
  const employeeDetails = useMemo(() => {
    if (!selectedEmployee) return null;
    return data.find(row => row['Resource Name'] === selectedEmployee) || null;
  }, [selectedEmployee, data]);

  // Progress data for bars with blue-themed colors
  const progressData = useMemo(() => {
    if (!employeeDetails) return [];
    
    return [
      {
        label: 'Technical Skills',
        value: employeeDetails['Avg Score - Technical (Out of 5)'] || 0,
        max: 5,
        color: blueTheme.dark,
        icon: <FiCode />
      },
      {
        label: 'Communication',
        value: employeeDetails['Communication Score (Out of 5)'] || 0,
        max: 5,
        color: blueTheme.medium,
        icon: <FiActivity />
      },
      {
        label: 'Interview Score',
        value: employeeDetails['2nd Round Scores'] || 0,
        max: 5,
        color: blueTheme.light,
        icon: <FiBarChart2 />
      },
      {
        label: 'Experience',
        value: parseFloat(employeeDetails['Experience (in Years)']) || 0,
        max: 10,
        color: blueTheme.lighter,
        icon: <FiAward />
      }
    ].filter(item => item.value > 0);
  }, [employeeDetails]);

  // Trigger animation when employee changes
  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [selectedEmployee]);

  // Function to download the chart as a PDF
  const downloadPDF = async () => {
    if (!chartRef.current || !selectedEmployee) return;
    
    setIsDownloading(true);
    
    try {
      // Set a temporary class for better PDF capture
      chartRef.current.classList.add('download-preparation');
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
      });
      
      // Create a new PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to maintain aspect ratio
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margins on each side
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      
      // Create a title for the PDF based on employee data
      const title = `${selectedEmployee}_Performance_Metrics.pdf`;
      
      // Save the PDF
      pdf.save(title);
      
      // Remove temporary class
      chartRef.current.classList.remove('download-preparation');
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsDownloading(false);
      chartRef.current.classList.remove('download-preparation');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="progress-chart-wrapper"
    >
      <Card className="progress-chart-container">
        <CardContent>
          {/* Employee Selector with Download Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '20px'
            }}
          >
            <FormControl size="small" sx={{ width: '70%' }}>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Select Employee"
                onChange={(e) => setSelectedEmployee(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      backgroundColor: blueTheme.lightest
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: blueTheme.light
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: blueTheme.medium
                  }
                }}
              >
                {employeeOptions.map(name => (
                  <MenuItem 
                    key={name} 
                    value={name}
                    sx={{
                      '&:hover': {
                        backgroundColor: blueTheme.lighter
                      }
                    }}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              disabled={!selectedEmployee || isDownloading}
              onClick={downloadPDF}
              sx={{
                minWidth: '40px',
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: theme.transitions.create(['background-color', 'box-shadow'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <FiDownload />
            </Button>
          </motion.div>

          {/* Chart content that will be captured in the download */}
          <div ref={chartRef}>
            {selectedEmployee ? (
              <>
                {/* Hidden title only visible in downloaded PDF */}
                <div className="download-only-title" style={{
                  display: 'none',
                  textAlign: 'center',
                  padding: '10px',
                  backgroundColor: blueTheme.lightest,
                  borderRadius: '8px',
                  border: `1px solid ${blueTheme.lighter}`,
                  marginBottom: '15px'
                }}>
                  <Typography variant="h5" style={{
                    color: blueTheme.dark,
                    fontWeight: 600
                  }}>
                    {selectedEmployee} - Performance Report
                  </Typography>
                  <Typography variant="subtitle1" style={{
                    color: blueTheme.medium
                  }}>
                    Generated on {new Date().toLocaleDateString()}
                  </Typography>
                </div>
                
                {/* Employee Header */}
                <motion.div 
                  className="employee-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Avatar 
                    className="employee-avatar pulse-avatar"
                    sx={{ 
                      bgcolor: blueTheme.dark,
                      width: 72,
                      height: 72
                    }}
                  >
                    <FiUser size={30} />
                  </Avatar>
                  <div className="employee-details">
                    <Typography className="employee-name">
                      {selectedEmployee}
                    </Typography>
                    <div className="employee-meta">
                      <Chip 
                        icon={<FiBriefcase size={14} />}
                        label={employeeDetails['Current Project'] || 'No project'}
                        size="small"
                        variant="outlined"
                        className="meta-chip"
                        sx={{
                          borderColor: blueTheme.light,
                          color: blueTheme.dark
                        }}
                      />
                      <Chip 
                        icon={<FiAward size={14} />}
                        label={`${employeeDetails['Experience (in Years)'] || '?'} yrs`}
                        size="small"
                        variant="outlined"
                        className="meta-chip"
                        sx={{
                          borderColor: blueTheme.light,
                          color: blueTheme.dark
                        }}
                      />
                      <Chip 
                        icon={<FiMapPin size={14} />}
                        label={employeeDetails['Location'] || 'Unknown'}
                        size="small"
                        variant="outlined"
                        className="meta-chip"
                        sx={{
                          borderColor: blueTheme.light,
                          color: blueTheme.dark
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                <Divider sx={{ 
                  my: 3,
                  borderColor: blueTheme.lighter 
                }} />

                {/* Progress Bars - Hybrid Layout (Horizontal and Vertical) */}
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    fontWeight: 600,
                    color: blueTheme.dark
                  }}
                >
                  <FiBarChart2 /> Performance Metrics
                </Typography>
                
                <div className="progress-visualization">
                  {/* Horizontal Progress Bars */}
                  <motion.div 
                    className="horizontal-progress-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {progressData.map((item, index) => (
                      <motion.div
                        key={`h-${index}`}
                        className="progress-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="progress-label">
                          <span className="progress-icon" style={{ color: item.color }}>
                            {item.icon}
                          </span>
                          {item.label}
                        </div>
                        <div className="progress-bar-container">
                          <motion.div 
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: animated ? `${(item.value / item.max) * 100}%` : '0%'
                            }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                            style={{
                              backgroundColor: item.color
                            }}
                          >
                            <span className="progress-value">
                              {item.value.toFixed(1)}/{item.max}
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Vertical Progress Bars */}
                  <motion.div 
                    className="vertical-progress-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {progressData.map((item, index) => (
                      <motion.div
                        key={`v-${index}`}
                        className="vertical-progress-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <div className="vertical-bar-wrapper">
                          <motion.div 
                            className="vertical-progress-bar"
                            initial={{ height: 0 }}
                            animate={{ 
                              height: animated ? `${(item.value / item.max) * 100}%` : '0%'
                            }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 + index * 0.15 }}
                            style={{
                              backgroundColor: item.color
                            }}
                          >
                            <div className="vertical-progress-value">
                              {item.value.toFixed(1)}
                            </div>
                          </motion.div>
                        </div>
                        <div className="vertical-progress-label">
                          <span className="vertical-progress-icon" style={{ color: item.color }}>
                            {item.icon}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Comments */}
                {employeeDetails['SK comments'] && (
                  <motion.div
                    className="employee-comments"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div className="comment-icon">
                      <FiClipboard size={18} />
                    </div>
                    <div className="comment-text">
                      {employeeDetails['SK comments']}
                    </div>
                  </motion.div>
                )}
                
                {/* Hidden metadata footer only for download */}
                <div className="download-metadata" style={{
                  display: 'none',
                  marginTop: '20px',
                  padding: '10px',
                  borderTop: `1px dashed ${blueTheme.lighter}`,
                  fontSize: '0.85rem',
                  color: blueTheme.medium,
                  justifyContent: 'space-between'
                }}>
                  <div>Employee ID: {employeeDetails['Employee ID'] || 'N/A'}</div>
                  <div>Generated: {new Date().toLocaleString()}</div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 300,
                    backgroundColor: blueTheme.lightest,
                    borderRadius: '12px'
                  }}
                  className="empty-state"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2
                    }}
                  >
                    <FiUser size={64} className="empty-icon" />
                  </motion.div>
                  <Typography sx={{ mt: 2, color: blueTheme.medium }}>
                    Select an employee to view progress
                  </Typography>
                </Box>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* CSS for download functionality */}
      <style jsx>{`
        .download-preparation .download-only-title,
        .download-preparation .download-metadata {
          display: block !important;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #chartRef, #chartRef * {
            visibility: visible;
          }
          #chartRef {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SelfInterestChart;