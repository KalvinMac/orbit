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

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/')}
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItemButton onClick={handleWorkflowClick}>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Engineering Workflow" />
          {openWorkflow ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={openWorkflow} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Phase 1: Strategic Planning */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/workflow/planning')}
              onClick={() => navigate('/workflow/planning')}
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phase 1: Planning" 
                secondary="Strategic Planning and Inception" 
                secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
              />
            </ListItemButton>
            
            {/* Phase 2: Architecture */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/workflow/architecture')}
              onClick={() => navigate('/workflow/architecture')}
            >
              <ListItemIcon>
                <ArchitectureIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phase 2: Architecture" 
                secondary="Architecture and System Design"
                secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
              />
            </ListItemButton>
            
            {/* Phase 3: Implementation */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/workflow/implementation')}
              onClick={() => navigate('/workflow/implementation')}
            >
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phase 3: Implementation" 
                secondary="Implementation and Construction"
                secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
              />
            </ListItemButton>
            
            {/* Phase 4: Testing */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/workflow/testing')}
              onClick={() => navigate('/workflow/testing')}
            >
              <ListItemIcon>
                <BugReportIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phase 4: Testing" 
                secondary="Comprehensive Testing and Validation"
                secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
              />
            </ListItemButton>
            
            {/* Phase 5: Deployment */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/workflow/deployment')}
              onClick={() => navigate('/workflow/deployment')}
            >
              <ListItemIcon>
                <RocketLaunchIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Phase 5: Deployment" 
                secondary="Deployment and Operational Readiness"
                secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
              />
            </ListItemButton>
          </List>
        </Collapse>
        
        <ListItemButton onClick={handleQualityClick}>
          <ListItemIcon>
            <VerifiedIcon />
          </ListItemIcon>
          <ListItemText primary="Quality Management" />
          {openQuality ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={openQuality} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* QM Phase 1 */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/quality/building-phase')}
              onClick={() => navigate('/quality/building-phase')}
            >
              <ListItemText primary="Building Phase" />
            </ListItemButton>
            
            {/* QM Phase 2 */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/quality/qa')}
              onClick={() => navigate('/quality/qa')}
            >
              <ListItemText primary="QA" />
            </ListItemButton>
            
            {/* QM Phase 3 */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/quality/uat')}
              onClick={() => navigate('/quality/uat')}
            >
              <ListItemText primary="UAT" />
            </ListItemButton>
            
            {/* QM Phase 4 */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/quality/sqa-sqct')}
              onClick={() => navigate('/quality/sqa-sqct')}
            >
              <ListItemText primary="SQA/SQCT" />
            </ListItemButton>
            
            {/* QM Phase 5 */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActiveRoute('/quality/environment')}
              onClick={() => navigate('/quality/environment')}
            >
              <ListItemText primary="Environment Record" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/projects')}
            onClick={() => navigate('/projects')}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/requirements')}
            onClick={() => navigate('/requirements')}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Requirements" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/test-cases')}
            onClick={() => navigate('/test-cases')}
          >
            <ListItemIcon>
              <BugReportIcon />
            </ListItemIcon>
            <ListItemText primary="Test Cases" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/deployments')}
            onClick={() => navigate('/deployments')}
          >
            <ListItemIcon>
              <RocketLaunchIcon />
            </ListItemIcon>
            <ListItemText primary="Deployments" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/team')}
            onClick={() => navigate('/team')}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Team" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActiveRoute('/settings')}
            onClick={() => navigate('/settings')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          SDLC Platform v1.0
        </Typography>
      </Box>
    </>
  );
};

export default Sidebar;
