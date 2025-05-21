import React, { useState, useRef, useEffect } from 'react';
import { 
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
  Fade
} from '@mui/material';
import { 
  FiUploadCloud, 
  FiFileText, 
  FiBarChart2,
  FiInfo,
  FiArrowRight
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import useAssessmentStore from '../../store/InterviewStore';
import DataTable from '../../components/admin/InterviewTable';
import ChartView from '../../components/admin/ChartView';
import '../../Styles/InterviewManagement.css';

export default function InterviewManagement() {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    <Container maxWidth="xl" className="interview-management" sx={{ py: 3 }}>
      <Paper 
        elevation={0} 
        className="page-header" 
        sx={{ 
          mb: 3, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: '12px', 
          background: `linear-gradient(145deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}05)`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.dark,
              letterSpacing: '-0.01em'
            }}
          >
            Interview Data Analytics
          </Typography>
          <Typography  
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.secondary, 
              mt: 1,
              fontSize: '0.95rem'
            }}
          >
            Upload and analyze interview data for deeper insights
          </Typography>
        </Box>
      </Paper>

      {!hasData ? (
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden', 
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease'
          }}
        >
          <Box 
            className={`upload-container ${dragActive ? 'drag-active' : ''}`}
            onClick={triggerFileInput}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: { xs: 3, sm: 5 },
              minHeight: '350px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: dragActive ? `${theme.palette.primary.light}10` : 'transparent',
              '&:hover': {
                backgroundColor: `${theme.palette.primary.light}05`
              }
            }}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
            />
            
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                sx={{
                  width: { xs: '80px', sm: '100px' },
                  height: { xs: '80px', sm: '100px' },
                  borderRadius: '50%',
                  backgroundColor: `${theme.palette.primary.main}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                  transition: 'transform 0.3s ease',
                  animation: dragActive ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                <FiUploadCloud 
                  size={isMobile ? 36 : 48} 
                  color={theme.palette.primary.main} 
                />
              </Box>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  color: theme.palette.text.primary 
                }}
              >
                {dragActive ? 'Drop your file here' : 'Upload Interview Data'}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 3
                }}
              >
                Click or drag files to upload
              </Typography>
              
              <Fade in={!isLoading}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<FiArrowRight />}
                  onClick={triggerFileInput}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    fontWeight: 500
                  }}
                >
                  Select Files
                </Button>
              </Fade>
              
              {isLoading && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress 
                    size={40} 
                    thickness={4} 
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2, 
                      color: theme.palette.primary.main,
                      fontWeight: 500
                    }}
                  >
                    Processing your file...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  borderRadius: '8px',
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                {error}
              </Alert>
            </Box>
          )}
          
          <Divider />
          
          <CardContent sx={{ p: 0 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                p: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  flex: 1,
                  borderRight: { xs: 'none', sm: `1px solid ${theme.palette.divider}` },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                  pb: { xs: 2, sm: 0 },
                  mb: { xs: 2, sm: 0 }
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: `${theme.palette.info.light}15`,
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiFileText size={20} color={theme.palette.info.main} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                    Parse CSV & Excel
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Support for all interview data formats
                  </Typography>
                </Box>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  flex: 1
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: `${theme.palette.success.light}15`,
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiBarChart2 size={20} color={theme.palette.success.main} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                    Visualize Data
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Interactive charts and analytics
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                bgcolor: `${theme.palette.warning.light}10`, 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <FiInfo size={20} color={theme.palette.warning.main} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Supported formats: CSV, XLSX, XLS
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Fade in={hasData} timeout={500}>
          <Box className="content-container">
            {showCharts ? ( 
              <ChartView 
                data={data} 
                onToggleView={toggleView} 
              />
            ) : (
              <DataTable />
            )}
          </Box>
        </Fade>
      )}
    </Container>
  );
}