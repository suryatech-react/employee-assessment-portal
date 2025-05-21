import React, { useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Tooltip,
  Fade,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ScoreChart = ({ data }) => {
  // Hooks called at the top level
  const theme = useTheme();
  const chartRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Constants
  const NAME_FIELDS = ['Resource Name', 'Employee Name', 'Name', 'Candidate Name'];
  const SCORE_FIELDS = ['Score', 'Rating', 'Assessment', 'Grade', 'Technical Score', 'Communication Score', 'Overall Score'];

  // Helper functions
  const getBarColor = (percent) => {
    if (percent >= 90) return '#0b2545';
    if (percent >= 75) return '#1e3a8a';
    if (percent >= 60) return '#2563eb';
    if (percent >= 45) return '#3b82f6';
    if (percent >= 30) return '#4c9ed9';
    return '#5aa6b1';
  };

  const getAltBarColor = (percent) => {
    if (percent >= 90) return '#1e3a5f';
    if (percent >= 75) return '#245d8c';
    if (percent >= 60) return '#3c82a9';
    if (percent >= 45) return '#4a9db8';
    if (percent >= 30) return '#5eb2c4';
    return '#6dbbcc';
  };

  const getEmployeeDetails = (employeeName) => {
    if (!data || !Array.isArray(data)) return null;

    const employee = data.find(emp => {
      const nameField = NAME_FIELDS.find(field =>
        Object.keys(emp).some(key => key.toLowerCase().includes(field.toLowerCase()))
      );
      const nameKey = nameField
        ? Object.keys(emp).find(key =>
            key.toLowerCase().includes(nameField.toLowerCase()))
        : null;
      return nameKey && String(emp[nameKey]).trim() === String(employeeName).trim();
    });

    if (!employee) return null;

    return {
      project: employee['Current Project'] || employee['Project'] || 'Not specified',
      experience: employee['Experience (in Years)'] || employee['Experience'] || 'Not specified',
    };
  };

  // Proper useMemo hook usage
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data
      .map((employee, index) => {
        const nameField = NAME_FIELDS.find(field =>
          Object.keys(employee).some(key => key.toLowerCase().includes(field.toLowerCase()))
        );
        const nameKey = nameField
          ? Object.keys(employee).find(key =>
              key.toLowerCase().includes(nameField.toLowerCase()))
          : null;

        const employeeName = nameKey ? String(employee[nameKey]).trim() : 'Unknown';

        const scoreColumns = Object.keys(employee).filter(key =>
          SCORE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))
        );

        const scores = scoreColumns
          .map((col) => {
            const val = employee[col];
            const numVal = typeof val === 'number' 
              ? val 
              : typeof val === 'string' 
                ? parseFloat(val.replace(/[^0-9.]/g, '')) || 0 
                : 0;
            return Math.min(Math.max(numVal, 0), 5);
          })
          .filter(score => !isNaN(score));

        const avgScore = scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

        const percent = Math.min(Math.max((avgScore / 5) * 100, 0));
        
        const color = index % 2 === 0 ? getBarColor(percent) : getAltBarColor(percent);

        return {
          name: employeeName,
          score: parseFloat(avgScore.toFixed(2)),
          percent: percent,
          color: color,
          details: getEmployeeDetails(employeeName)
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [data]);

  const downloadAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      // Store original styles
      const originalStyle = {
        overflow: scrollContainerRef.current.style.overflow,
        height: scrollContainerRef.current.style.height,
        maxHeight: scrollContainerRef.current.style.maxHeight
      };
      
      // Temporarily modify the scroll container to show all content
      scrollContainerRef.current.style.overflow = 'visible';
      scrollContainerRef.current.style.height = 'auto';
      scrollContainerRef.current.style.maxHeight = 'none';
      
      // Add export class for showing PDF-specific elements
      chartRef.current.classList.add('pdf-export');
      
      // Calculate total height for the PDF
      const chartHeight = chartRef.current.offsetHeight;
      const chartWidth = chartRef.current.offsetWidth;
      
      // Capture the entire chart
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowHeight: chartHeight,
        height: chartHeight,
        width: chartWidth
      });

      // Create PDF with appropriate dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit PDF page
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content is too tall for one page, split it across multiple pages
      if (pdfHeight > 270) { // A4 height minus margins
        const totalPages = Math.ceil(pdfHeight / 270);
        const heightPerPage = canvas.height / totalPages;
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // For each page, crop a portion of the canvas
          const sourceY = page * heightPerPage;
          const sourceHeight = Math.min(heightPerPage, canvas.height - sourceY);
          
          pdf.addImage(
            imgData, 
            'PNG', 
            10, 10, 
            pdfWidth, 
            (sourceHeight * pdfWidth) / canvas.width,
            null,
            'FAST',
            0,
            sourceY / canvas.height,
            1,
            sourceHeight / canvas.height
          );
        }
      } else {
        // If it fits on one page, just add the image
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      }
      
      pdf.save('Employee_Scores_Report.pdf');
      
      // Restore original styles
      chartRef.current.classList.remove('pdf-export');
      scrollContainerRef.current.style.overflow = originalStyle.overflow;
      scrollContainerRef.current.style.height = originalStyle.height;
      scrollContainerRef.current.style.maxHeight = originalStyle.maxHeight;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Restore styles on error
      if (chartRef.current && scrollContainerRef.current) {
        chartRef.current.classList.remove('pdf-export');
        scrollContainerRef.current.style.overflow = 'auto';
        scrollContainerRef.current.style.maxHeight = '500px';
      }
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h6" color="textSecondary">
          No valid score data available.
        </Typography>
      </motion.div>
    );
  }

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      p: 5,
      border: '1px solid #e2e8f0'
    }}>
      <Box sx={{
        position: 'absolute',
        top: 10,
        right: 12,
        zIndex: 1
      }}>
        <Button
          variant="contained"
          onClick={downloadAsPDF}
          sx={{
            minWidth: '40px',
            width: '40px',
            height: '40px',
            padding: 0,
            color: 'white',
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
      </Box>

      <div ref={chartRef} style={{ marginTop: 24 }}>
        <Box sx={{ 
          display: 'none',
          textAlign: 'center',
          mb: 2,
          '.pdf-export &': {
            display: 'block'
          }
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Employee Performance Scores
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Box 
          ref={scrollContainerRef}
          sx={{ 
            maxHeight: '500px',
            overflowY: 'auto',
            pr: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
            '.pdf-export &': {
              maxHeight: 'none',
              overflow: 'visible',
              height: 'auto'
            }
          }}
        >
          {chartData.map((item, index) => (
            <Tooltip 
              key={`${item.name}-${index}`}
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  <Typography variant="caption" component="div">
                    <div><strong>Project:</strong> {item.details?.project}</div>
                    <div><strong>Experience:</strong> {item.details?.experience}</div>
                  </Typography>
                </Box>
              }
              arrow
              placement="right"
              followCursor
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 100 }}
              enterDelay={200}
              leaveDelay={100}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#1e293b',
                    color: '#f8fafc',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    maxWidth: 300,
                    '& .MuiTooltip-arrow': {
                      color: '#1e293b'
                    }
                  }
                },
                popper: {
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [10, -10],
                      },
                    },
                  ],
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '5px',
                  gap: '16px',
                  width: '100%',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '180px',
                  minWidth: '180px'
                }}>
                  <Typography variant="body1" noWrap sx={{ 
                    maxWidth: '120px',
                    fontWeight: 500,
                    color: '#1e293b'
                  }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    {item.score.toFixed(1)} / 5
                  </Typography>
                </Box>

                <Box sx={{ 
                  flexGrow: 1,
                  height: '25px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
                }}>
                  <motion.div
                    initial={{ width: 0, scaleX: 0 }}
                    animate={{ 
                      width: `${item.percent}%`, 
                      scaleX: 1 
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 50,
                      damping: 12,
                      delay: index * 0.1
                    }}
                    style={{
                      height: '100%',
                      borderRadius: '6px',
                      position: 'relative',
                      backgroundColor: item.color,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      transformOrigin: 'left'
                    }}
                  >
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        delay: index * 0.1 + 0.3,
                        duration: 0.4 
                      }}
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {item.percent.toFixed(0)}%
                    </motion.span>
                  </motion.div>
                </Box>
              </motion.div>
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ 
          display: 'none',
          mt: 3,
          pt: 2,
          borderTop: '1px dashed #e2e8f0',
          fontSize: '0.8rem',
          color: '#64748b',
          '.pdf-export &': {
            display: 'flex',
            justifyContent: 'space-between'
          }
        }}>
          <div>Total Employees: {chartData.length}</div>
          <div>Average Score: {(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length).toFixed(1)} / 5</div>
        </Box>
      </div>
    </Box>
  );
};

export default ScoreChart;