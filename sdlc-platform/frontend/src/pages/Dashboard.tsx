import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CodeIcon from '@mui/icons-material/Code';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Mock data
const projectsData = [
  {
    id: '1',
    name: 'SDLC Platform Development',
    description: 'Development of the SDLC Management Platform',
    status: 'in_progress',
    currentPhase: 'architecture',
    progress: 45,
    activeTasks: 8,
    completedTasks: 12,
    dueDate: '2023-12-15'
  },
  {
    id: '2',
    name: 'API Integration Service',
    description: 'Service for integrating with external APIs',
    status: 'planning',
    currentPhase: 'planning',
    progress: 15,
    activeTasks: 5,
    completedTasks: 3,
    dueDate: '2023-11-20'
  },
  {
    id: '3',
    name: 'Authentication Module',
    description: 'User authentication and authorization module',
    status: 'testing',
    currentPhase: 'testing',
    progress: 75,
    activeTasks: 3,
    completedTasks: 18,
    dueDate: '2023-10-30'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'requirement',
    title: 'User authentication requirement',
    status: 'approved',
    timestamp: '1 hour ago',
    user: 'Jane Smith'
  },
  {
    id: 2,
    type: 'test',
    title: 'API Integration Test',
    status: 'failed',
    timestamp: '3 hours ago',
    user: 'John Doe'
  },
  {
    id: 3,
    type: 'deployment',
    title: 'Deploy to staging',
    status: 'completed',
    timestamp: '5 hours ago',
    user: 'Alex Johnson'
  },
  {
    id: 4,
    type: 'architecture',
    title: 'Database schema design',
    status: 'in_review',
    timestamp: '1 day ago',
    user: 'Maria Garcia'
  }
];

// Status to color mapping
const statusColors = {
  'planning': 'info',
  'in_progress': 'primary',
  'testing': 'warning',
  'completed': 'success',
  'on_hold': 'default',
  'approved': 'success',
  'failed': 'error',
  'in_review': 'secondary'
} as const;

// Phase to icon mapping
const phaseIcons = {
  'planning': <AssignmentIcon />,
  'architecture': <ArchitectureIcon />,
  'implementation': <CodeIcon />,
  'testing': <BugReportIcon />,
  'deployment': <RocketLaunchIcon />
};

type StatusType = keyof typeof statusColors;
type PhaseType = keyof typeof phaseIcons;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Activity Icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'requirement':
        return <AssignmentIcon />;
      case 'test':
        return <BugReportIcon />;
      case 'deployment':
        return <RocketLaunchIcon />;
      case 'architecture':
        return <ArchitectureIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button variant="contained" onClick={() => navigate('/projects/new')}>
          New Project
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Projects Overview
        </Typography>
        <Grid container spacing={3}>
          {projectsData.map((project) => (
            <Grid item xs={12} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={project.status.replace('_', ' ')} 
                      color={statusColors[project.status as StatusType]} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      icon={phaseIcons[project.currentPhase as PhaseType]}
                      label={project.currentPhase} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ borderRadius: 1 }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Tasks: {project.completedTasks}/{project.activeTasks + project.completedTasks}
                    </Typography>
                    <Typography variant="body2">
                      Due: {project.dueDate}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: statusColors[activity.status as StatusType] + '.light' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.user}
                          </Typography>
                          {` — ${activity.timestamp}`}
                          <br />
                          <Chip 
                            label={activity.status.replace('_', ' ')} 
                            color={statusColors[activity.status as StatusType]} 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button color="primary" onClick={() => navigate('/activities')}>
                View All Activities
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Progress
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'primary.light', width: 30, height: 30 }}>
                      <AssignmentIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body1">Strategic Planning</Typography>
                  </Box>
                  <Typography variant="body2">80%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={80} sx={{ borderRadius: 1 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'secondary.light', width: 30, height: 30 }}>
                      <ArchitectureIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body1">Architecture & Design</Typography>
                  </Box>
                  <Typography variant="body2">65%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={65} color="secondary" sx={{ borderRadius: 1 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'info.light', width: 30, height: 30 }}>
                      <CodeIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body1">Implementation</Typography>
                  </Box>
                  <Typography variant="body2">40%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={40} color="info" sx={{ borderRadius: 1 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'warning.light', width: 30, height: 30 }}>
                      <BugReportIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body1">Testing & Validation</Typography>
                  </Box>
                  <Typography variant="body2">20%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={20} color="warning" sx={{ borderRadius: 1 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'success.light', width: 30, height: 30 }}>
                      <RocketLaunchIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body1">Deployment & Operations</Typography>
                  </Box>
                  <Typography variant="body2">10%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={10} color="success" sx={{ borderRadius: 1 }} />
              </Box>
            </Stack>
            
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 3 }}
              fullWidth
              onClick={() => navigate('/workflow')}
            >
              View Detailed Workflow
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
