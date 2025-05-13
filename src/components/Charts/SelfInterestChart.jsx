import React, { useState, useMemo, useEffect } from 'react';
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
    Divider
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
    FiActivity
} from 'react-icons/fi';
import '../../Styles/SelfInterestChart.css';

const SelfInterestChart = ({ data }) => {
    const theme = useTheme();
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [animated, setAnimated] = useState(false);
    
    // Extract unique employee names
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

    // Progress data for bars
    const progressData = useMemo(() => {
        if (!employeeDetails) return [];
        
        return [
            {
                label: 'Technical Skills',
                value: employeeDetails['Avg Score - Technical (Out of 5)'] || 0,
                max: 5,
                color: '#6c63ff',
                icon: <FiCode />
            },
            {
                label: 'Communication',
                value: employeeDetails['Communication Score (Out of 5)'] || 0,
                max: 5,
                color: '#4CAF50',
                icon: <FiActivity />
            },
            {
                label: 'Interview Score',
                value: employeeDetails['2nd Round Scores'] || 0,
                max: 5,
                color: '#FF9800',
                icon: <FiBarChart2 />
            },
            {
                label: 'Experience',
                value: parseFloat(employeeDetails['Experience (in Years)']) || 0,
                max: 10,
                color: '#2196F3',
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

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="progress-chart-wrapper"
        >
            <Card className="progress-chart-container">
                <CardContent>
                    {/* Employee Selector */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                            <InputLabel>Select Employee</InputLabel>
                            <Select
                                value={selectedEmployee}
                                label="Select Employee"
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300
                                        }
                                    }
                                }}
                            >
                                {employeeOptions.map(name => (
                                    <MenuItem key={name} value={name}>{name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </motion.div>

                    {selectedEmployee ? (
                        <>
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
                                        bgcolor: theme.palette.primary.main,
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
                                        />
                                        <Chip 
                                            icon={<FiAward size={14} />}
                                            label={`${employeeDetails['Experience (in Years)'] || '?'} yrs`}
                                            size="small"
                                            variant="outlined"
                                            className="meta-chip"
                                        />
                                        <Chip 
                                            icon={<FiMapPin size={14} />}
                                            label={employeeDetails['Location'] || 'Unknown'}
                                            size="small"
                                            variant="outlined"
                                            className="meta-chip"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <Divider sx={{ my: 3 }} />

                            {/* Progress Bars - Hybrid Layout (Horizontal and Vertical) */}
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    mb: 2,
                                    fontWeight: 600
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
                                    color: theme.palette.text.secondary
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
                                <Typography sx={{ mt: 2 }}>Select an employee to view progress</Typography>
                            </Box>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SelfInterestChart;