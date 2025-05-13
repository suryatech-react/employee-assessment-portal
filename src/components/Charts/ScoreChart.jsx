import React, { useMemo } from 'react';
import { Box, Typography, useTheme, Tooltip, Fade } from '@mui/material';
import { motion } from 'framer-motion';

const ScoreChart = ({ data }) => {
  const theme = useTheme();

  const NAME_FIELDS = ['Resource Name', 'Employee Name', 'Name', 'Candidate Name'];
  const SCORE_FIELDS = ['Score', 'Rating', 'Assessment', 'Grade', 'Technical Score', 'Communication Score', 'Overall Score'];

  const getEmployeeDetails = (employeeName) => {
    if (!data || !Array.isArray(data)) return null;
    
    const employee = data.find(emp => {
      const nameField = NAME_FIELDS.find(field =>
        Object.keys(emp).some(key => key.toLowerCase().includes(field.toLowerCase()))
      );
      const nameKey = nameField
        ? Object.keys(emp).find(key =>
            key.toLowerCase().includes(nameField.toLowerCase())
          )
        : null;
      return nameKey && String(emp[nameKey]).trim() === String(employeeName).trim();
    });
    
    if (!employee) return null;
    
    return {
      project: employee['Current Project'] || employee['Project'] || 'Not specified',
      experience: employee['Experience (in Years)'] || employee['Experience'] || 'Not specified',
      location: employee['Location'] || 'Not specified',
      skills: employee['Primary Skills'] || employee['Skills'] || 'Not specified',
      status: employee['Interview Status'] || employee['Status'] || 'Not specified',
      comments: employee['SK comments'] || employee['Comments'] || 'No comments available'
    };
  };

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data
      .map((employee) => {
        const nameField = NAME_FIELDS.find(field =>
          Object.keys(employee).some(key => key.toLowerCase().includes(field.toLowerCase()))
        );
        const nameKey = nameField
          ? Object.keys(employee).find(key =>
              key.toLowerCase().includes(nameField.toLowerCase())
            )
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

        return {
          name: employeeName,
          score: parseFloat(avgScore.toFixed(2)),
          percent: Math.min(Math.max((avgScore / 5) * 100, 0)),
          details: getEmployeeDetails(employeeName)
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [data]);

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
          backgroundColor: theme.palette.grey[100],
          borderRadius: '8px',
          padding: '16px'
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
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '8px',
      boxShadow: theme.shadows[1],
      p: 2
    }}>
      {chartData.map((item, index) => (
        <Tooltip 
          key={`${item.name}-${index}`}
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">{item.name}</Typography>
              <Typography variant="caption" component="div">
                <div><strong>Project:</strong> {item.details?.project}</div>
                <div><strong>Experience:</strong> {item.details?.experience}</div>
                <div><strong>Location:</strong> {item.details?.location}</div>
                <div><strong>Skills:</strong> {item.details?.skills}</div>
                <div><strong>Status:</strong> {item.details?.status}</div>
                <div><strong>Comments:</strong> {item.details?.comments}</div>
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
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[4],
                maxWidth: 300,
                transform: 'translateX(10px) translateY(-10px)',
                '& .MuiTooltip-arrow': {
                  color: theme.palette.background.paper,
                  '&:before': {
                    border: `1px solid ${theme.palette.divider}`
                  }
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
              gap: '16px',
              width: '100%',
              marginBottom: '12px',
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
              <Typography variant="body1" noWrap sx={{ maxWidth: '120px' }}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.score.toFixed(1)} / 5
              </Typography>
            </Box>

            <Box sx={{ 
              flexGrow: 1,
              height: '20px',
              backgroundColor: theme.palette.grey[300],
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                style={{
                  height: '100%',
                  borderRadius: '10px',
                  position: 'relative',
                  backgroundColor:
                    item.percent >= 80 ? theme.palette.success.main :
                    item.percent >= 50 ? theme.palette.warning.main :
                    theme.palette.error.main,
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.4), rgba(255,255,255,0.2))'
                }}
              />
            </Box>
          </motion.div>
        </Tooltip>
      ))}
    </Box>
  );
};

export default ScoreChart;