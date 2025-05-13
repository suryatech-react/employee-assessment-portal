import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  TableSortLabel,
  Typography,
  TablePagination,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { FiDownload, FiPieChart, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import useAssessmentStore from '../../store/InterviewStore';
import * as XLSX from 'xlsx';
import '../../Styles/InterviewTable.css';

export default function InterviewTable() {
  const { data, headers, toggleView } = useAssessmentStore();

  const [billableFilter, setBillableFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (data.length) setLoading(false);
  }, [data]);

  const billableKey = useMemo(() => headers.find(h => /billable/i.test(h.key || h)), [headers]);
  const projectKey = useMemo(() => headers.find(h => /current project/i.test(h.key || h)), [headers]);

  const allHeaders = useMemo(() => {
    if (headers?.length) return headers;
    return data.length ? Array.from(new Set(data.flatMap(row => Object.keys(row)))) : [];
  }, [headers, data]);

  const { uniqueBillable, uniqueProjects } = useMemo(() => {
    const bSet = new Set();
    const pSet = new Set();
    data.forEach(item => {
      if (billableKey && item[billableKey]) bSet.add(item[billableKey]);
      if (projectKey && item[projectKey]) pSet.add(item[projectKey]);
    });
    return {
      uniqueBillable: Array.from(bSet).sort(),
      uniqueProjects: Array.from(pSet).sort()
    };
  }, [data, billableKey, projectKey]);

  const cleanValue = value => {
    if (value === undefined || value === null || String(value).toLowerCase() === 'nan') return '';
    if (!isNaN(value) && typeof value === 'string') return Number(value);
    return value;
  };

  const processedData = useMemo(() => {
    return data
      .map(row => {
        const cleanedRow = {};
        allHeaders.forEach(h => {
          const headerKey = typeof h === 'object' ? h.key : h;
          cleanedRow[headerKey] = cleanValue(row[headerKey]);
        });
        return cleanedRow;
      })
      .filter(item => {
        const matchesBillable = !billableFilter || (billableKey && item[billableKey] === billableFilter);
        const matchesProject = !projectFilter || (projectKey && item[projectKey] === projectFilter);
        const matchesSearch = !searchText || 
          Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchText.toLowerCase())
          );
        return matchesBillable && matchesProject && matchesSearch;
      })
      .sort((a, b) => {
        if (!orderBy) return 0;
        const aV = cleanValue(a[orderBy]);
        const bV = cleanValue(b[orderBy]);
        return order === 'asc'
          ? String(aV).localeCompare(String(bV))
          : String(bV).localeCompare(String(aV));
      });
  }, [data, allHeaders, billableFilter, projectFilter, searchText, orderBy, order, billableKey, projectKey]);

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        processedData.map(row =>
          allHeaders.reduce((acc, h) => {
            const headerKey = typeof h === 'object' ? h.key : h;
            return { ...acc, [headerKey]: row[headerKey] ?? '' };
          }, {})
        ),
        { header: allHeaders.map(h => typeof h === 'object' ? h.key : h) }
      );
      XLSX.utils.book_append_sheet(wb, ws, 'InterviewStatus');
      XLSX.writeFile(wb, `Interview_Status_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      setError('Failed to export data');
      setSnackbarOpen(true);
    }
  };

  const handleSort = header => {
    const isAsc = orderBy === header && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(header);
  };

  const handleClearFilters = () => {
    setBillableFilter('');
    setProjectFilter('');
    setSearchText('');
    setPage(0);
  };

  const renderHeader = (header) => {
    if (typeof header === 'object') {
      return header.label || header.key;
    }
    return header;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} thickness={4} sx={{ color: '#6c63ff' }} />
      </Box>
    );
  }

  return (
    <Box className="interview-table-container">
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box className="table-header">
        <Box className="table-title">
          <Avatar className="table-title-avatar" sx={{ bgcolor: 'primary.main' }}>
            <FiPieChart />
          </Avatar>
          <Box className="table-title-text">
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Interview Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Chip 
                label={`${processedData.length} records`} 
                size="small" 
                sx={{ 
                  height: '20px', 
                  fontSize: '0.75rem',
                  mr: 1 
                }} 
              />
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Box className="action-buttons">
          <Tooltip title="Export to Excel">
            <IconButton 
              onClick={handleExport}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <FiDownload size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle View">
            <IconButton 
              onClick={toggleView}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <FiPieChart size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box className="filter-controls">
        <TextField
          className="search-field"
          placeholder="Search..."
          size="small"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch className="search-icon" />
              </InputAdornment>
            ),
            sx: {
              height: 40,
              borderRadius: '4px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '1px',
              }
            }
          }}
          sx={{
            width: isMobile ? '100%' : '300px',
            '& .MuiInputBase-input': {
              padding: '10px 14px',
              fontSize: '14px',
            }
          }}
        />

        <Tooltip title={filtersExpanded ? "Hide filters" : "Show filters"}>
          <Button
            variant="outlined"
            startIcon={<FiFilter />}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            sx={{
              height: 40,
              ml: 'auto',
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.light',
                backgroundColor: 'action.hover',
              }
            }}
          >
            Filters
          </Button>
        </Tooltip>
      </Box>

      {filtersExpanded && (
        <Box className="advanced-filters" sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2, 
          flexWrap: 'wrap',
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1
        }}>
          {billableKey && (
            <TextField
              select
              label="Billable Status"
              size="small"
              variant="outlined"
              value={billableFilter}
              onChange={e => { setBillableFilter(e.target.value); setPage(0); }}
              sx={{
                minWidth: 200,
                '& .MuiSelect-select': {
                  py: '10px',
                },
              }}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              {uniqueBillable.map(b => (
                <MenuItem key={b} value={b} sx={{ fontSize: '14px' }}>{b}</MenuItem>
              ))}
            </TextField>
          )}
          {projectKey && (
            <TextField
              select
              label="Project"
              size="small"
              variant="outlined"
              value={projectFilter}
              onChange={e => { setProjectFilter(e.target.value); setPage(0); }}
              sx={{
                minWidth: 200,
                '& .MuiSelect-select': {
                  py: '10px',
                },
              }}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              {uniqueProjects.map(p => (
                <MenuItem key={p} value={p} sx={{ fontSize: '14px' }}>{p}</MenuItem>
              ))}
            </TextField>
          )}
          <Button 
            variant="text"
            startIcon={<FiX />}
            onClick={handleClearFilters}
            sx={{
              height: 40,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'transparent',
              }
            }}
          >
            Clear all
          </Button>
        </Box>
      )}

      <Box className="table-wrapper">
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'auto'
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {allHeaders.map(header => {
                  const headerKey = typeof header === 'object' ? header.key : header;
                  return (
                    <TableCell 
                      key={headerKey} 
                      sx={{
                        backgroundColor: 'background.paper',
                        fontWeight: 600,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === headerKey}
                        direction={orderBy === headerKey ? order : 'asc'}
                        onClick={() => handleSort(headerKey)}
                        sx={{
                          '&.MuiTableSortLabel-root': {
                            color: 'inherit',
                          },
                          '&.Mui-active': {
                            color: 'primary.main',
                          },
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                      >
                        {renderHeader(header)}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {processedData.length > 0 ? (
                processedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, idx) => (
                    <TableRow 
                      key={idx} 
                      hover 
                      sx={{
                        '&:nth-of-type(even)': {
                          backgroundColor: 'action.hover',
                        },
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        }
                      }}
                    >
                      {allHeaders.map(header => {
                        const headerKey = typeof header === 'object' ? header.key : header;
                        return (
                          <TableCell 
                            key={headerKey}
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 200,
                              borderBottom: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {String(row[headerKey] ?? '')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={allHeaders.length} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={processedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>
    </Box>
  );
}