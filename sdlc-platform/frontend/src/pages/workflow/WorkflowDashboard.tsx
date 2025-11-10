import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Define workflow phases as per the Product Engineering Workflow diagram
const workflowPhases = [
  {
    id: 1,
    name: 'Strategic Planning',
    description: 'Strategic Planning and Inception',
    tasks: [
      { id: 1, name: 'Project Definition', status: 'completed' },
      { id: 2, name: 'Threat Modeling', status: 'in_progress' },
      { id: 3, name: 'DFT Creation', status: 'completed' },
      { id: 4, name: 'Project Risk / Issues Assessment', status: 'completed' },
      { id: 5, name: 'Regulatory Assessment', status: 'in_progress' },
      { id: 6, name: 'Requirements Engineering', status: 'completed' },
      { id: 7, name: 'Resource and Budget Planning', status: 'completed' },
      { id: 8, name: 'Traceability Matrix Creation', status: 'not_started' },
      { id: 9, name: 'Critical Workflow Analysis', status: 'in_progress' },
    ],
    progress: 75,
    status: 'in_progress'
  },
  {
    id: 2,
    name: 'Architecture & Design',
    description: 'Architecture and System Design',
    tasks: [
      { id: 10, name: 'Formal Architecture Development', status: 'completed' },
      { id: 11, name: 'Module Design with Feature Signoffs', status: 'in_progress' },
      { id: 12, name: 'Interface Design', status: 'in_progress' },
      { id: 13, name: 'UI Design', status: 'not_started' },
      { id: 14, name: 'Data & UX Data Privacy', status: 'not_started' },
      { id: 15, name: 'Security Design and Threat Modeling', status: 'not_started' },
      { id: 16, name: 'Observability Design', status: 'not_started' },
      { id: 17, name: 'FMEA Analysis and Design', status: 'not_started' },
    ],
    progress: 35,
    status: 'in_progress'
  },
  {
    id: 3,
    name: 'Implementation',
    description: 'Implementation and Construction',
    tasks: [
      { id: 18, name: 'Environment Set-up', status: 'completed' },
      { id: 19, name: 'Code Implementation', status: 'in_progress' },
      { id: 20, name: 'CI/CD Pipelines', status: 'in_progress' },
      { id: 21, name: 'Automated Unit and Integration', status: 'not_started' },
      { id: 22, name: 'Build Merge Analysis on Code Integration', status: 'not_started' },
      { id: 23, name: 'Observability and Operational Environment', status: 'not_started' },
    ],
    progress: 30,
    status: 'in_progress'
  },
  {
    id: 4,
    name: 'Testing',
    description: 'Comprehensive Testing and Validation',
    tasks: [
      { id: 24, name: 'Unit Directive Testing', status: 'in_progress' },
      { id: 25, name: 'System E2E Testing', status: 'not_started' },
      { id: 26, name: 'Critical Workflow Testing', status: 'not_started' },
      { id: 27, name: 'Regulatory Validation', status: 'not_started' },
      { id: 28, name: 'Security Testing', status: 'not_started' },
      { id: 29, name: 'Data Validation', status: 'not_started' },
    ],
    progress: 15,
    status: 'in_progress'
  },
  {
    id: 5,
    name: 'Deployment',
    description: 'Deployment and Operational Readiness',
    tasks: [
      { id: 30, name: 'Training and Service Readiness', status: 'not_started' },
      { id: 31, name: 'Release Plan for Internal Field', status: 'not_started' },
      { id: 32, name: 'Production Monitoring', status: 'not_started' },
      { id: 33, name: 'Metric Recording and Improvement Ops', status: 'not_started' },
      { id: 34, name: 'Deployment State Mapping', status: 'not_started' },
    ],
    progress: 5,
    status: 'not_started'
  }
];

// Status to color and icon mapping
const statusConfig = {
  completed: { color: 'success', icon: <CheckCircleIcon color="success" /> },
  in_progress: { color: 'info', icon: <HourglassTopIcon color="info" /> },
  not_started: { color: 'default', icon: <WarningIcon color="action" /> },
  blocked: { color: 'error', icon: <WarningIcon color="error" /> }
} as const;

// TabPanel component for the workflow phases
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `workflow-tab-${index}`,
    'aria-controls': `workflow-tabpanel-${index}`,
  };
}

const WorkflowDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Engineering Workflow
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/projects/1/workflow/new')}
        >
          Start New Workflow
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="workflow phases tabs"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Phase 1: Planning</Typography>
                  <Chip 
                    size="small" 
                    label="75%" 
                    color="primary" 
                    sx={{ ml: 1, height: '20px' }} 
                  />
                </Box>
              } 
              {...a11yProps(0)} 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Phase 2: Architecture</Typography>
                  <Chip 
                    size="small" 
                    label="35%" 
                    color="primary" 
                    sx={{ ml: 1, height: '20px' }} 
                  />
                </Box>
              } 
              {...a11yProps(1)} 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Phase 3: Implementation</Typography>
                  <Chip 
                    size="small" 
                    label="30%" 
                    color="primary" 
                    sx={{ ml: 1, height: '20px' }} 
                  />
                </Box>
              } 
              {...a11yProps(2)} 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Phase 4: Testing</Typography>
                  <Chip 
                    size="small" 
                    label="15%" 
                    color="primary" 
                    sx={{ ml: 1, height: '20px' }} 
                  />
                </Box>
              } 
              {...a11yProps(3)} 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Phase 5: Deployment</Typography>
                  <Chip 
                    size="small" 
                    label="5%" 
                    color="primary" 
                    sx={{ ml: 1, height: '20px' }} 
                  />
                </Box>
              } 
              {...a11yProps(4)} 
            />
          </Tabs>
        </Box>

        {workflowPhases.map((phase, index) => (
          <TabPanel key={phase.id} value={value} index={index}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Phase {index + 1}: {phase.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {phase.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2">{phase.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={phase.progress} 
                    sx={{ mt: 0.5, height: 8, borderRadius: 1 }} 
                  />
                </Box>
                <Chip 
                  label={phase.status.replace('_', ' ')} 
                  color={statusConfig[phase.status as keyof typeof statusConfig].color as any} 
                />
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Tasks & Activities
            </Typography>
            
            <Grid container spacing={3}>
              {phase.tasks.map((task) => (
                <Grid item xs={12} md={6} key={task.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {statusConfig[task.status as keyof typeof statusConfig].icon}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {task.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={task.status.replace('_', ' ')} 
                          size="small"
                          color={statusConfig[task.status as keyof typeof statusConfig].color as any}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/workflow/${phase.id}/task/${task.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Task">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/workflow/${phase.id}/task/${task.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                disabled={index === 0}
                onClick={() => setValue(index - 1)}
              >
                Previous Phase
              </Button>
              <Button 
                variant="contained" 
                endIcon={<ArrowForwardIcon />}
                disabled={index === workflowPhases.length - 1}
                onClick={() => setValue(index + 1)}
              >
                Next Phase
              </Button>
            </Box>
          </TabPanel>
        ))}
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Metrics
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Overall Progress" 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={32} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} 
                      />
                      <Typography variant="body2" sx={{ ml: 2 }}>32%</Typography>
                    </Box>
                  } 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Time Elapsed" secondary="45 days (60% of planned timeline)" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Tasks Completed" secondary="10 of 34 tasks (29%)" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Tasks In Progress" secondary="8 of 34 tasks (24%)" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quality Management Status
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Building Phase" secondary="Complete" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <HourglassTopIcon color="info" />
                </ListItemIcon>
                <ListItemText primary="QA" secondary="In Progress - Architecture and Patterns Spec" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="UAT" secondary="Not Started" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="SQA/SQCT" secondary="Not Started" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="Environment Record" secondary="Not Started" />
              </ListItem>
            </List>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => navigate('/quality')}
            >
              View Quality Management
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowDashboard;
