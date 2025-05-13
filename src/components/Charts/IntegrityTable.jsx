import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { motion } from 'framer-motion';

export default function IntegrityTable({ data }) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Integrity Scores
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              {Object.keys(data[0] || {}).map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {Object.values(row).map((val, j) => (
                  <TableCell key={j}>{val}</TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
