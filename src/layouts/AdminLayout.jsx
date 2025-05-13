import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/shared/AdminSidebar';

export default function AdminLayout() {  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AdminSidebar />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          p: 3,
          width: 'calc(100% - 240px)' 
        }}
      >
        <Outlet /> 
      </Box>
    </Box>
  );
}