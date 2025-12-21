import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';

// Icons
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import WarningIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/ErrorOutline';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      message
      type
      read
      createdAt
    }
  }
`;

const GET_SEARCH_RESULTS = gql`
  query Search($query: String!) {
    search(query: $query) {
      id
      type
      title
      description
      url
    }
  }
`;

const GET_HEADER_SETTINGS = gql`
  query GetHeaderSettings {
    getOrganizationSettings {
      name
      logoUrl
    }
  }
`;

const MARK_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

// ...

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationEl, setNotificationEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationEl);

  const { data, loading } = useQuery(GET_NOTIFICATIONS, {
    pollInterval: 10000,
    fetchPolicy: 'network-only'
  });

  const { data: settingsData } = useQuery(GET_HEADER_SETTINGS);
  const orgSettings = settingsData?.getOrganizationSettings || { name: 'Acme Corp', logoUrl: '' };

  const [markRead] = useMutation(MARK_READ);

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
    handleClose();
    navigate('/login');
  };

  const notifications = data?.getNotifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markRead({ variables: { id } });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon fontSize="small" color="success" />;
      case 'warning': return <WarningIcon fontSize="small" color="warning" />;
      case 'error': return <ErrorIcon fontSize="small" color="error" />;
      default: return <InfoIcon fontSize="small" color="info" />;
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultsEl, setSearchResultsEl] = useState<null | HTMLElement>(null);

  const [performSearch, { data: searchData, loading: searchLoading }] = useLazyQuery(GET_SEARCH_RESULTS, {
    fetchPolicy: 'network-only'
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      performSearch({ variables: { query: value } });
      if (!searchResultsEl) {
        setSearchResultsEl(document.getElementById('search-input-anchor'));
      }
    } else {
      setSearchResultsEl(null);
    }
  };

  const handleSearchResultClick = (url: string) => {
    if (url) {
      navigate(url);
      setSearchOpen(false);
      setSearchTerm('');
      setSearchResultsEl(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, px: 3, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>

      {/* Left: Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/favicon.png"
            alt="Orbit Logo"
            sx={{
              height: 36,
              width: 36,
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1
            }}
          >
            Orbit
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ height: 28, mx: 1, alignSelf: 'center', bgcolor: 'divider' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Tooltip title={orgSettings.name || 'Organization'}>
            {orgSettings.logoUrl ? (
              <Box
                component="img"
                src={orgSettings.logoUrl}
                alt={orgSettings.name}
                sx={{
                  height: 32,
                  width: 'auto',
                  maxWidth: 200,
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
              />
            ) : (
              <Avatar
                variant="rounded"
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.9rem',
                  bgcolor: 'primary.main',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {orgSettings.name?.charAt(0) || 'O'}
              </Avatar>
            )}
          </Tooltip>
        </Box>
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

        {/* Expandable Search */}
        <Box sx={{ position: 'relative' }}>
          <Paper
            id="search-input-anchor"
            component="form"
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: searchOpen ? 280 : 40,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              bgcolor: searchOpen ? 'action.hover' : 'transparent',
              borderRadius: 2,
              border: searchOpen ? '1px solid' : '1px solid transparent',
              borderColor: 'divider'
            }}
            onSubmit={(e) => { e.preventDefault(); }}
          >
            <IconButton
              sx={{ p: '8px' }}
              aria-label="search"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
            <InputBase
              id="global-search-input"
              sx={{ ml: 1, flex: 1, display: searchOpen ? 'block' : 'none' }}
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={() => {
                // Delay hiding to allow clicking results
                setTimeout(() => {
                  if (!searchTerm) setSearchOpen(false);
                }, 200);
              }}
            />
            {searchOpen && (
              <IconButton
                type="button"
                sx={{ p: '8px' }}
                aria-label="close"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchTerm('');
                  setSearchResultsEl(null);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>

          {/* Search Results Dropdown */}
          {searchOpen && searchTerm.length >= 2 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 1,
                width: 320,
                maxHeight: 400,
                overflowY: 'auto',
                zIndex: 1300,
                borderRadius: 2
              }}
            >
              {searchLoading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
              ) : searchData?.search && searchData.search.length > 0 ? (
                <Box sx={{ py: 1 }}>
                  {searchData.search.map((result: any) => (
                    <MenuItem
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result.url)}
                      sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="600" noWrap sx={{ maxWidth: '70%' }}>
                            {result.title}
                          </Typography>
                          <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 1, borderRadius: 1, fontWeight: 'bold', fontSize: '0.65rem' }}>
                            {result.type}
                          </Typography>
                        </Box>
                        {result.description && (
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {result.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No matches found</Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ color: 'text.secondary', ml: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notificationEl}
          id="notification-menu"
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'hidden',
              filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
              mt: 1.5,
              width: 360,
              maxHeight: 400,
              borderRadius: 3,
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
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          </Box>

          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No notifications</Typography>
              </Box>
            ) : (
              notifications.map((notification: any) => (
                <React.Fragment key={notification.id}>
                  <MenuItem
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      whiteSpace: 'normal',
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.read ? 'none' : '3px solid #1976d2'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', width: '100%' }}>
                      <Box sx={{ mt: 0.5 }}>{getIcon(notification.type)}</Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 700} sx={{ lineHeight: 1.3 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(Number(notification.createdAt)).toLocaleString()}
                        </Typography>
                      </Box>
                      {!notification.read && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />
                      )}
                    </Box>
                  </MenuItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </Box>

          <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center', py: 1.5, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="primary" fontWeight="600">Close</Typography>
          </MenuItem>
        </Menu>

        {/* User Profile */}
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 0.5 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 'bold' }}>
              JD
            </Avatar>
          </IconButton>
        </Tooltip>

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
              filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 200,
              borderRadius: 3,
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
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2">John Doe</Typography>
            <Typography variant="caption" color="text.secondary">john.doe@example.com</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;

