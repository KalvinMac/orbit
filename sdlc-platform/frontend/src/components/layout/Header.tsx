import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationEl, setNotificationEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationEl(null);
  };

  const handleLogout = () => {
    // Handle logout logic here
    handleClose();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h6" noWrap component="div">
        SDLC Management Platform
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Notifications */}
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          onClick={handleNotificationClick}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <Menu
          anchorEl={notificationEl}
          id="notification-menu"
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              width: 360,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2">New requirement approved</Typography>
              <Typography variant="caption" color="text.secondary">User Authentication Requirement has been approved</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2">Test case failed</Typography>
              <Typography variant="caption" color="text.secondary">API Integration Test TC-001 failed</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2">Deployment completed</Typography>
              <Typography variant="caption" color="text.secondary">Project A has been deployed to staging</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center' }}>
            <Typography variant="body2" color="primary">View all notifications</Typography>
          </MenuItem>
        </Menu>
        
        {/* User Profile */}
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
