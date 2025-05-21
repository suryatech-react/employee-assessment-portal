import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Toolbar,
    Divider,
    Box,
    Typography,
    Avatar,
    useTheme,
    IconButton
  } from '@mui/material';
  import { 
    Dashboard, 
    People, 
    Settings,
    Logout,
    ChevronLeft,
    MenuOpen
  } from '@mui/icons-material';
  import { NavLink } from 'react-router-dom';
  import { styled } from '@mui/material/styles';
  import { useState } from 'react';
  
  const menuItems = [
    { text: 'Interview Status Management', icon: <People />, path: '/admin/InterviewManagement' },
  ];
  
  const settingsItems = [
    { text: 'Logout', icon: <Logout />, path: '/logout' }
  ];
  
  const StyledNavLink = styled(NavLink)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
    width: '100%',
    '&.active': {
      '& .MuiListItem-root': {
        backgroundColor: theme.palette.action.selected,
        borderRight: `4px solid ${theme.palette.primary.main}`,
        '& .MuiListItemIcon-root': {
          color: theme.palette.primary.main
        },
        '& .MuiListItemText-primary': {
          fontWeight: theme.typography.fontWeightMedium
        }
      }
    }
  }));
  
  export default function AdminSidebar() {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);
  
    return (
      <Drawer 
        variant="permanent" 
        sx={{ 
          width: collapsed ? 72 : 240,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : 240,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            borderRight: 'none',
            boxShadow: theme.shadows[3]
          }
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          minHeight: '64px !important'
        }}>
          {!collapsed && (
            <Typography variant="h6" noWrap>
              Admin Panel
            </Typography>
          )}
          <IconButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuOpen /> : <ChevronLeft />}
          </IconButton>
        </Toolbar>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: 'calc(100vh - 64px)'
        }}>
          <Box sx={{ p: 2, display: collapsed ? 'none' : 'block' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: theme.palette.action.hover
            }}>
              <Avatar sx={{ width: 40, height: 40 }}>A</Avatar>
              <Box>
                <Typography variant="subtitle2">Admin User</Typography>
                <Typography variant="caption">Super Admin</Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider />
          
          <List sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <StyledNavLink to={item.path} key={item.text}>
                <ListItem sx={{
                  px: collapsed ? 2.5 : 3,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}>
                  <ListItemIcon sx={{ 
                    minWidth: collapsed ? 'auto' : 40,
                    color: theme.palette.text.secondary
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.text} />}
                </ListItem>
              </StyledNavLink>
            ))}
          </List>
          
          <Divider />
          
          <List>
            {settingsItems.map((item) => (
              <StyledNavLink to={item.path} key={item.text}>
                <ListItem sx={{
                  px: collapsed ? 2.5 : 3,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}>
                  <ListItemIcon sx={{ 
                    minWidth: collapsed ? 'auto' : 40,
                    color: theme.palette.text.secondary
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.text} />}
                </ListItem>
              </StyledNavLink>
            ))}
          </List>
        </Box>
      </Drawer>
    );
  }