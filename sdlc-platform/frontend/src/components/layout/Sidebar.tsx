import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { alpha, useTheme } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AssignmentIcon from '@mui/icons-material/AssignmentRounded';
import ArchitectureIcon from '@mui/icons-material/ArchitectureRounded';
import CodeIcon from '@mui/icons-material/CodeRounded';
import BugReportIcon from '@mui/icons-material/BugReportRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import DescriptionIcon from '@mui/icons-material/DescriptionRounded';
import GroupIcon from '@mui/icons-material/GroupRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import ExpandLess from '@mui/icons-material/ExpandLessRounded';
import ExpandMore from '@mui/icons-material/ExpandMoreRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [openWorkflow, setOpenWorkflow] = React.useState(true);
  const [openQuality, setOpenQuality] = React.useState(false);

  const handleWorkflowClick = () => {
    setOpenWorkflow(!openWorkflow);
  };

  const handleQualityClick = () => {
    setOpenQuality(!openQuality);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const ListHeader = ({ title }: { title: string }) => (
    <Typography
      variant="caption"
      sx={{
        px: 3,
        py: 2,
        display: 'block',
        color: 'text.secondary',
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Typography>
  );

  const listItemSx = {
    mb: 0.5,
    borderRadius: 2,
    mx: 1,
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      },
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
      },
      '& .MuiListItemText-primary': {
        color: 'primary.main',
        fontWeight: 600,
      },
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.05),
    },
  };

  const subListItemSx = {
    ...listItemSx,
    pl: 4,
    mx: 1,
    mb: 0.5,
  };

  return (
    <Box sx={{ pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List component="nav" sx={{ px: 0, pt: 2, flex: 1 }}>
        <ListItem disablePadding sx={{ width: 'auto' }}>
          <ListItemButton
            selected={isActiveRoute('/')}
            onClick={() => navigate('/')}
            sx={listItemSx}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
          </ListItemButton>
        </ListItem>



        <ListHeader title="Management" />

        <List component="nav" sx={{ px: 0 }}>
          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/okr')}
              onClick={() => navigate('/okr')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <TrendingUpIcon />
              </ListItemIcon>
              <ListItemText primary="OKRs" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>



          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/projects')}
              onClick={() => navigate('/projects')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Projects" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/requirements')}
              onClick={() => navigate('/requirements')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Requirements" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/test-cases')}
              onClick={() => navigate('/test-cases')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BugReportIcon />
              </ListItemIcon>
              <ListItemText primary="Test Cases" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/deployments')}
              onClick={() => navigate('/deployments')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <RocketLaunchIcon />
              </ListItemIcon>
              <ListItemText primary="Deployments" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/dvfs')}
              onClick={() => navigate('/dvfs')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <VerifiedIcon />
              </ListItemIcon>
              <ListItemText primary="DVFs" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/team')}
              onClick={() => navigate('/team')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Team" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ width: 'auto' }}>
            <ListItemButton
              selected={isActiveRoute('/team/capacity')}
              onClick={() => navigate('/team/capacity')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Capacity" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ my: 2, mx: 3, opacity: 0.1 }} />

        <List component="nav" sx={{ px: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={isActiveRoute('/settings')}
              onClick={() => navigate('/settings')}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
        </List>

      </List>
    </Box>
  );
};

export default Sidebar;
