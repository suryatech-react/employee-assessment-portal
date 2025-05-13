import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function AttendanceChart({ data }) {
  const theme = useTheme();
  return (
    <motion.div initial={{ rotate: -45 }} animate={{ rotate: 0 }} transition={{ duration: 0.6 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Attendance Overview
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="10%" outerRadius="80%" data={data} startAngle={90} endAngle={-270}>
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: theme.palette.text.primary }}
                background
                clockWise
                dataKey="value"
                fill={theme.palette.primary.main}
              />
              <Legend verticalAlign="bottom" height={36} />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

