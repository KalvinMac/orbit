import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
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

// GraphQL Queries
const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
    }
  }
`;

const GET_PROJECT_WORKFLOW = gql`
  query GetProjectWorkflow($projectId: ID!) {
    getProjectWorkflow(projectId: $projectId) {
      id
      phaseType
      status
      phaseName
      statusColor
      isActive
      tasks {
        id
        title
        status
        statusColor
      }
    }
  }
`;

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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projectsData } = useQuery(GET_PROJECTS, {
    onCompleted: (data) => {
      if (data.projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data.projects[0].id);
      }
    }
  });

  const { loading, error, data } = useQuery(GET_PROJECT_WORKFLOW, {
    variables: { projectId: selectedProjectId },
    skip: !selectedProjectId
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Error: {error.message}</Typography></Box>;

  const workflowPhases = data?.getProjectWorkflow || [];

  // Map backend data to UI structure if needed, or use directly
  // The UI expects: id, name, description, tasks (id, name, status), progress, status
  // Our backend returns: id, phaseType, phaseName, status, statusColor, tasks (id, title, status, statusColor)

  const mappedPhases = workflowPhases.map((phase: any, index: number) => ({
    id: phase.id,
    name: phase.phaseName,
    description: phase.phaseType, // Using type as description for now
    tasks: phase.tasks.map((task: any) => ({
      id: task.id,
      name: task.title,
      status: task.status
    })),
    progress: phase.status === 'completed' ? 100 : (phase.status === 'in_progress' ? 50 : 0), // Mock progress based on status
    status: phase.status
  }));

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Engineering Workflow
        </Typography>
        <Box>
          {selectedProjectId && (
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => navigate(`/projects/${selectedProjectId}/workflow-editor`)}
            >
              Edit Workflow
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/projects/new')}
          >
            Start New Workflow
          </Button>
        </Box>
      </Box>

      {mappedPhases.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No workflow phases found for this project.
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate('/projects')}
          >
            Go to Projects
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="workflow phases tabs"
              >
                {mappedPhases.map((phase: any, index: number) => (
                  <Tab
                    key={phase.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>Phase {index + 1}: {phase.name.split(' ')[0]}</Typography>
                        <Chip
                          size="small"
                          label={`${phase.progress}%`}
                          color={phase.status === 'completed' ? 'success' : 'primary'}
                          sx={{ ml: 1, height: '20px' }}
                        />
                      </Box>
                    }
                    {...a11yProps(index)}
                  />
                ))}
              </Tabs>
            </Box>

            {mappedPhases.map((phase: any, index: number) => (
              <TabPanel key={phase.id} value={value} index={index}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Phase {index + 1}: {phase.name}
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
                      color={statusConfig[phase.status as keyof typeof statusConfig]?.color as any || 'default'}
                    />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Tasks & Activities
                </Typography>

                <Grid container spacing={3}>
                  {phase.tasks.map((task: any) => (
                    <Grid item xs={12} md={6} key={task.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {statusConfig[task.status as keyof typeof statusConfig]?.icon || <InfoOutlinedIcon />}
                              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                {task.name}
                              </Typography>
                            </Box>
                            <Chip
                              label={task.status.replace('_', ' ')}
                              size="small"
                              color={statusConfig[task.status as keyof typeof statusConfig]?.color as any || 'default'}
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
                    disabled={index === mappedPhases.length - 1}
                    onClick={() => setValue(index + 1)}
                  >
                    Next Phase
                  </Button>
                </Box>
              </TabPanel>
            ))}
          </Paper>
        </>
      )}

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
