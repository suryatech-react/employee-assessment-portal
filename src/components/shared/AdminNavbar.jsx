import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function AdminNavbar() {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'linear-gradient(45deg,rgb(25, 74, 148), #2a5298)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', letterSpacing: '1px', color: '#fff' }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
