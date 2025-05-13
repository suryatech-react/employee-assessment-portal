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
  Fade
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
import ScoreChart from '../Charts/ScoreChart';
import SelfInterestChart from '../Charts/SelfInterestChart';

const ChartView = ({ data, onToggleView }) => {
  const theme = useTheme();
  const [currentChart, setCurrentChart] = useState(0);
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
    try {
      const element = document.getElementById(`chart-${currentChart}`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: 0
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);

      const fileName = data?.name || charts[currentChart].title;
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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

          <Button
            variant="contained"
            startIcon={<FiDownload size={18} />}
            onClick={handleDownloadPDF}
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              boxShadow: 'none',
              transition: theme.transitions.create(['background-color', 'box-shadow'], {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: theme.shadows[2]
              }
            }}
          >
            Export Report
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