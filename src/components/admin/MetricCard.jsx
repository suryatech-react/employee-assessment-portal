import { Card, CardContent, Typography, Box } from '@mui/material';

export default function MetricCard({ title, value, icon, trend }) {
  return (
    <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <Box sx={{ fontSize: 40 }}>{icon}</Box>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
        {trend && (
          <Typography variant="caption" color="success.main">
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
