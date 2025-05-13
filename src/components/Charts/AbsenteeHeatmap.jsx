import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function AbsenteeHeatmap({ data }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Absentee Heatmap
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {data.map((cell, idx) => {
              const intensity = Math.min(1, cell.count / Math.max(...data.map(d => d.count)));
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  sx={{
                    width: '100%',
                    height: 40,
                    bgcolor: `rgba(233,30,99,${intensity})`,
                    borderRadius: 1
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

