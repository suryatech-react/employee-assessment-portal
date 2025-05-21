import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  FiDownload,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiBarChart2
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify'; 
import ScoreChart from '../Charts/ScoreChart';
import SelfInterestChart from '../Charts/SelfInterestChart';

const ChartView = ({ data, onToggleView }) => {
  const theme = useTheme();
  const [currentChart, setCurrentChart] = useState(0);
  const [exporting, setExporting] = useState(false);
  const chartWrapperRef = useRef(null);

  const charts = [
    {
      title: 'Overall Interview Status',
      component: <ScoreChart data={data} />,
      icon: <FiGrid size={18} />
    },
    {
      title: 'Interview Status for Individuals',
      component: <SelfInterestChart data={data} />,
      icon: <FiBarChart2 size={18} />
    },
  ];

  useEffect(() => {
    console.log('ChartView Data:', data);
  }, [data]);

  const handleDownloadPDF = async () => {
    setExporting(true);
    

    const loadingToast = toast ? toast.info('Preparing PDF export...', { autoClose: false }) : null;
    
    try {
  
      const element = document.getElementById(`chart-${currentChart}`);
      if (!element) {
        throw new Error('Chart element not found');
      }
      
      const originalBackground = element.style.background;
      const styledElements = [];
      
      if (theme.palette.mode === 'dark') {
    
        element.style.background = '#ffffff';
        

        const textElements = element.querySelectorAll('text, .recharts-text, .recharts-cartesian-axis-tick-value');
        textElements.forEach(el => {
          styledElements.push({
            element: el,
            originalFill: el.getAttribute('fill') || '',
            originalColor: el.style.color || ''
          });
          el.setAttribute('fill', '#000000');
          el.style.color = '#000000';
        });
        
        const nonSVGTextElements = element.querySelectorAll('div, span, p');
        nonSVGTextElements.forEach(el => {
          if (el.style.color) {
            styledElements.push({
              element: el,
              originalColor: el.style.color
            });
            el.style.color = '#000000';
          }
        });
        
        // Handle any lines, paths or shapes
        const shapeElements = element.querySelectorAll('path, line, rect, circle');
        shapeElements.forEach(el => {
          const stroke = el.getAttribute('stroke');
          if (stroke && stroke === theme.palette.text.primary) {
            styledElements.push({
              element: el,
              originalStroke: stroke
            });
            el.setAttribute('stroke', '#000000');
          }
        });
      }
      
      // Higher scale for better resolution
      const scale = 3;
      
      // Use html2canvas with improved settings
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: 0,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // Restore original styling after capture
      if (theme.palette.mode === 'dark') {
        element.style.background = originalBackground;
        styledElements.forEach(item => {
          const { element: el, originalFill, originalColor, originalStroke } = item;
          if (originalFill) el.setAttribute('fill', originalFill);
          if (originalColor) el.style.color = originalColor;
          if (originalStroke) el.setAttribute('stroke', originalStroke);
        });
      }
      
      // Calculate proper dimensions while maintaining aspect ratio
      const imgWidth = 210; // A4 width in mm (portrait)
      const pageHeight = 297; // A4 height in mm
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, pageHeight - 60); // Ensure it fits on page
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Add metadata
      pdf.setProperties({
        title: charts[currentChart].title,
        subject: 'Interview Data Chart',
        creator: 'Interview Analysis Dashboard',
        author: 'System'
      });
      
      // Add chart title as text in PDF
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(charts[currentChart].title, 15, 15);
      
      // Add timestamp
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${timestamp}`, 15, 22);
      
      // Add the chart image
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth - 20, imgHeight);
      
      // Add data summary if available
      if (data && Array.isArray(data) && data.length > 0) {
        // Add page for data table
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Data Summary', 15, 15);
        
        // Format data for table
        const tableData = data.map(item => {
          // Extract relevant properties based on your data structure
          return [
            item.name || 'N/A', 
            typeof item.score === 'number' ? item.score.toFixed(2) : 'N/A',
            item.status || 'N/A'
          ];
        });
        
        // Add table headers
        const headers = ['Name', 'Score', 'Status'];
        
        // Draw table if autoTable plugin is available
        if (typeof pdf.autoTable === 'function') {
          pdf.autoTable({
            head: [headers],
            body: tableData,
            startY: 25,
            margin: { top: 25 }
          });
        } else {
          // Simplified table without plugin
          pdf.setFontSize(12);
          pdf.text(headers.join('          '), 15, 30);
          pdf.line(15, 32, 195, 32);
          
          // Add limited number of rows to avoid overflow
          const maxRows = Math.min(tableData.length, 20);
          for (let i = 0; i < maxRows; i++) {
            pdf.text(tableData[i].join('          '), 15, 40 + (i * 10));
          }
          
          // Add indication if rows were truncated
          if (tableData.length > maxRows) {
            pdf.text(`...and ${tableData.length - maxRows} more rows`, 15, 40 + (maxRows * 10));
          }
        }
      }
      
      // Get a descriptive filename
      let fileName;
      if (data && !Array.isArray(data) && data.name) {
        fileName = `${data.name.replace(/\s+/g, '_')}_chart`;
      } else {
        fileName = `${charts[currentChart].title.replace(/\s+/g, '_')}`;
      }
      
      // Add date to filename
      fileName = `${fileName}_${new Date().toISOString().split('T')[0]}`;
      
      // Save the PDF
      pdf.save(`${fileName}.pdf`);
      
      // Success notification
      if (toast) {
        toast.dismiss(loadingToast);
        toast.success('PDF exported successfully');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Error notification for user
      if (toast) {
        toast.dismiss(loadingToast);
        toast.error('Failed to export PDF. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const navigateChart = (direction) => {
    const newIndex =
      direction === 'next'
        ? (currentChart + 1) % charts.length
        : (currentChart - 1 + charts.length) % charts.length;

    setCurrentChart(newIndex);
    chartWrapperRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      p: 3,
      backgroundColor: theme.palette.background.default
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}>
            <FiPieChart size={20} />
          </Avatar>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}>
            {charts[currentChart].title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onToggleView}
            sx={{
              borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300],
              color: theme.palette.text.secondary,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              transition: theme.transitions.create(['border-color', 'color', 'background-color'], {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Back to Table
          </Button>
        </Box>
      </Box>

      {/* Chart Container */}
      <Paper sx={{ 
        flex: 1,
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        backgroundColor: theme.palette.background.paper
      }}>
        <Box ref={chartWrapperRef} sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          transition: 'transform 0.3s ease'
        }}>
          {charts.map((chart, index) => (
            <Box key={index} id={`chart-${index}`} sx={{
              minWidth: '100%',
              height: '100%',
              p: 3
            }}>
              {chart.component}
            </Box>
          ))}
        </Box>

        <IconButton 
          onClick={() => navigateChart('prev')}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            transition: theme.transitions.create(['background-color', 'color'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main
            }
          }}
        >
          <FiChevronLeft size={24} />
        </IconButton>

        <IconButton 
          onClick={() => navigateChart('next')}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            transition: theme.transitions.create(['background-color', 'color'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main
            }
          }}
        >
          <FiChevronRight size={24} />
        </IconButton>
      </Paper>

      {/* Indicators */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        mt: 2
      }}>
        {charts.map((chart, index) => (
          <Tooltip 
            key={index}
            title={chart.title}
            arrow
            placement="top"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 200 }}
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                  fontSize: theme.typography.pxToRem(12),
                  '& .MuiTooltip-arrow': {
                    color: theme.palette.background.paper,
                    '&:before': {
                      border: `1px solid ${theme.palette.divider}`
                    }
                  }
                }
              }
            }}
          >
            <IconButton
              onClick={() => {
                setCurrentChart(index);
                chartWrapperRef.current.style.transform = `translateX(-${index * 100}%)`;
              }}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: currentChart === index 
                  ? theme.palette.primary.main 
                  : theme.palette.action.selected,
                color: currentChart === index 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.secondary,
                transition: theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  backgroundColor: currentChart === index 
                    ? theme.palette.primary.dark 
                    : theme.palette.action.hover
                }
              }}
            >
              {chart.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default ChartView;