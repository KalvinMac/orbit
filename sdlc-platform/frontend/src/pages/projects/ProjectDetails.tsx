import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  RocketLaunch as RocketIcon,
  BugReport as BugIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  VerifiedUser as VerifiedIcon,
  AccountTree as WorkflowIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// GraphQL
const GET_PROJECT = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      description
      status
      progress
      startDate
      targetEndDate
      actualEndDate
      owner {
        id
        firstName
        lastName
        email
      }
      lead {
        id
        firstName
        lastName
        email
      }
      objective {
        id
        title
      }
      dvfId
      dvf {
        id
        title
        status
      }
      workflowPhases {
        id
        phaseType
        status
        startDate
        endDate
        tasks {
          id
          title
          status
          priority
        }
      }
      qualityManagement {
        id
        phase
        status
        deliverables
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: String!, $data: UpdateProjectInput!) {
    updateProject(id: $id, data: $data) {
      id
      name
      description
      status
      progress
      startDate
      targetEndDate
      objective {
        id
        title
      }
    }
  }
`;

const GET_OBJECTIVES = gql`
  query GetObjectives {
    objectives {
      id
      title
    }
  }
`;

const INITIALIZE_WORKFLOW = gql`
  mutation InitializeWorkflow($projectId: ID!) {
    initializeWorkflow(projectId: $projectId) {
      id
      phaseType
      status
    }
  }
`;

const INITIALIZE_QUALITY = gql`
  mutation InitializeQualityGates($projectId: ID!) {
    initializeQualityGates(projectId: $projectId) {
      id
      phase
      status
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $phaseId: ID!, $title: String!, $taskType: String!, $priority: String!, $status: String!) {
    createTask(projectId: $projectId, phaseId: $phaseId, title: $title, taskType: $taskType, priority: $priority, status: $status) {
      id
      title
      status
      priority
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $status: String, $title: String, $priority: String) {
    updateTask(id: $id, status: $status, title: $title, priority: $priority) {
      id
      title
      status
      priority
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const UPDATE_QUALITY_GATE = gql`
  mutation UpdateQualityGate($id: ID!, $status: String, $deliverablesJSON: String) {
    updateQualityGate(id: $id, status: $status, deliverablesJSON: $deliverablesJSON) {
      id
      status
      deliverables
    }
  }
`;

const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
    }
  }
`;

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // State for Workflow Stepper
  const [activeStep, setActiveStep] = useState(0);

  // State for Task Management
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', status: 'todo', id: '' });

  const { loading, error, data, refetch } = useQuery(GET_PROJECT, {
    variables: { id },
    skip: !id,
  });

  const { data: objectivesData } = useQuery(GET_OBJECTIVES);
  const { data: usersData } = useQuery(GET_USERS);
  const { data: dvfsData } = useQuery(gql`query GetDVFs { getDVFs { id title } }`);

  const [updateProject] = useMutation(UPDATE_PROJECT, { onCompleted: () => { setOpenEditDialog(false); refetch(); } });

  const [initWorkflow] = useMutation(INITIALIZE_WORKFLOW, { onCompleted: () => refetch() });
  const [initQuality] = useMutation(INITIALIZE_QUALITY, { onCompleted: () => refetch() });

  const [createTask] = useMutation(CREATE_TASK, { onCompleted: () => { setNewTaskOpen(false); refetch(); } });
  const [updateTask] = useMutation(UPDATE_TASK, { onCompleted: () => { setEditTaskOpen(false); refetch(); } });
  const [deleteTask] = useMutation(DELETE_TASK, { onCompleted: () => refetch() });

  const [updateQuality] = useMutation(UPDATE_QUALITY_GATE, { onCompleted: () => refetch() });


  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>Error: {error.message}</Alert>;
  if (!data?.project) return <Alert severity="warning" sx={{ m: 4 }}>Project not found</Alert>;

  const project = data.project;

  // Enhance Workflow Data logic
  // Typically phases are ordered. Let's assume backend returns them, but we might want to map them to a standard order if they are incomplete
  const PHASE_ORDER = ['planning', 'architecture', 'implementation', 'testing', 'deployment'];
  const sortedPhases = project.workflowPhases
    ? [...project.workflowPhases].sort((a: any, b: any) => PHASE_ORDER.indexOf(a.phaseType) - PHASE_ORDER.indexOf(b.phaseType))
    : [];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status.toLowerCase(),
      progress: project.progress,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      targetEndDate: project.targetEndDate ? project.targetEndDate.split('T')[0] : '',
      objectiveId: project.objective?.id || '',
      dvfId: project.dvf?.id || '',
      ownerId: project.owner?.id || '',
      leadId: project.lead?.id || '',
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    const progressVal = parseInt(editForm.progress, 10);

    const safeDate = (dateStr: string) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    updateProject({
      variables: {
        id: project.id,
        data: {
          name: editForm.name,
          description: editForm.description,
          status: editForm.status,
          progress: isNaN(progressVal) ? 0 : progressVal,
          startDate: safeDate(editForm.startDate),
          targetEndDate: safeDate(editForm.targetEndDate),
          objectiveId: editForm.objectiveId || null,
          dvfId: editForm.dvfId || null,
          ownerId: editForm.ownerId || null,
          leadId: editForm.leadId || null
        }
      }
    });
  };

  const StatusChip = ({ status }: { status: string }) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    const s = status.toLowerCase();
    switch (s) {
      case 'completed': color = 'success'; break;
      case 'in_progress': color = 'primary'; break;
      case 'planning': color = 'info'; break;
      case 'on_hold': color = 'warning'; break;
      case 'cancelled': color = 'error'; break;
    }
    return <Chip label={status.replace('_', ' ').toUpperCase()} color={color} variant="filled" sx={{ borderRadius: 1, fontWeight: 600 }} />;
  };

  const getPhaseLabel = (type: string) => {
    switch (type) {
      case 'planning': return 'Planning & Inception';
      case 'architecture': return 'Architecture & Design';
      case 'implementation': return 'Implementation';
      case 'testing': return 'Testing & Validation';
      case 'deployment': return 'Deployment';
      default: return type;
    }
  };

  // --- Handlers ---

  const handleAddTaskClick = (phaseId: string) => {
    setCurrentPhaseId(phaseId);
    setTaskForm({ title: '', priority: 'medium', status: 'todo', id: '' });
    setNewTaskOpen(true);
  };

  const handleEditTaskClick = (task: any) => {
    setTaskForm({ title: task.title, priority: task.priority, status: task.status, id: task.id });
    setEditTaskOpen(true);
  };

  const handleSubmitTask = () => {
    if (newTaskOpen && currentPhaseId) {
      createTask({
        variables: {
          projectId: project.id,
          phaseId: currentPhaseId,
          title: taskForm.title,
          taskType: 'custom',
          priority: taskForm.priority,
          status: 'todo'
        }
      });
    } else if (editTaskOpen) {
      updateTask({
        variables: {
          id: taskForm.id,
          title: taskForm.title,
          priority: taskForm.priority,
          status: taskForm.status
        }
      });
    }
  };

  const handleTaskToggle = (task: any) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    updateTask({ variables: { id: task.id, status: newStatus } });
  };

  const handleTaskDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask({ variables: { id } });
    }
  };

  const handleDeliverableToggle = (qm: any, key: string) => {
    let deliverables = {};
    try {
      if (typeof qm.deliverables === 'string') deliverables = JSON.parse(qm.deliverables);
      else deliverables = { ...qm.deliverables };
    } catch (e) {
      deliverables = {};
    }

    const current = deliverables[key] || { completed: false, link: '' };
    deliverables[key] = { ...current, completed: !current.completed };

    updateQuality({
      variables: {
        id: qm.id,
        deliverablesJSON: JSON.stringify(deliverables)
      }
    });
  };

  const handleQualityStatusChange = (qmId: string, newStatus: string) => {
    updateQuality({ variables: { id: qmId, status: newStatus } });
  };


  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        Back to Projects
      </Button>

      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {project.name}
              </Typography>
              <StatusChip status={project.status} />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
              {project.description}
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditClick} sx={{ mr: 1 }}>
              Edit
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Overall Progress</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600}>{project.progress}%</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">DVF</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {project.dvf ? project.dvf.title : 'None Linked'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">Project Owner</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : 'Unassigned'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                  <CalendarIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">Target Date</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {project.targetEndDate ? format(new Date(project.targetEndDate), 'MMM d, yyyy') : 'TBD'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
          <Tab label="Overview" />
          <Tab label="Workflow" icon={<WorkflowIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Quality Gates" icon={<VerifiedIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Requirements" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Test Cases" icon={<BugIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Deployments" icon={<RocketIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* ... (Overview widgets can be expanded, keeping simple for now) ... */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>Select "Workflow" or "Quality Gates" tabs to view detailed engineering progress.</Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" startIcon={<AssignmentIcon />} onClick={() => setTabValue(3)}>
                  View Requirements
                </Button>
                <Button variant="outlined" startIcon={<BugIcon />} onClick={() => setTabValue(4)}>
                  View Test Cases
                </Button>
                <Button variant="outlined" startIcon={<WorkflowIcon />} onClick={() => setTabValue(1)}>
                  Update Workflow
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Workflow Tab */}
      {/* Workflow Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Engineering Workflow</Typography>
              <Typography variant="body2" color="text.secondary">
                Track high-level phases and granular tasks.
              </Typography>
            </Box>
            {sortedPhases.length === 0 && (
              <Button
                variant="contained"
                onClick={() => initWorkflow({ variables: { projectId: project.id } })}
              >
                Initialize Workflow
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 4 }} />

          {sortedPhases.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No workflow phases initialized for this project.</Typography>
            </Box>
          ) : (
            <Box>
              <Stepper nonLinear activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {sortedPhases.map((phase: any, index: number) => (
                  <Step key={phase.id}>
                    <StepButton onClick={() => setActiveStep(index)}>
                      {getPhaseLabel(phase.phaseType)}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                {sortedPhases[activeStep] && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{getPhaseLabel(sortedPhases[activeStep].phaseType)}</Typography>
                        <Typography variant="caption" color="text.secondary">Phase Status: {sortedPhases[activeStep].status}</Typography>
                      </Box>
                      <Button
                        startIcon={<AssignmentIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddTaskClick(sortedPhases[activeStep].id)}
                      >
                        Add Task
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {sortedPhases[activeStep].tasks && sortedPhases[activeStep].tasks.map((task: any) => (
                        <Grid item xs={12} sm={6} key={task.id}>
                          <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Checkbox
                                checked={task.status === 'completed'}
                                color="success"
                                onChange={() => handleTaskToggle(task)}
                              />
                              <Box>
                                <Typography variant="subtitle2" sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'text.secondary' : 'text.primary' }}>
                                  {task.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip label={task.priority} size="small" color={task.priority === 'critical' ? 'error' : task.priority === 'high' ? 'warning' : 'default'} sx={{ height: 20, fontSize: '0.7rem' }} />
                                  <Chip label={task.status} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </Box>
                            </Box>
                            <Box>
                              <IconButton size="small" onClick={() => handleEditTaskClick(task)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleTaskDelete(task.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                      {(!sortedPhases[activeStep].tasks || sortedPhases[activeStep].tasks.length === 0) && (
                        <Typography variant="body2" sx={{ p: 2, fontStyle: 'italic', color: 'text.secondary' }}>No tasks in this phase.</Typography>
                      )}
                    </Grid>
                  </>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Quality Gates Tab */}
      {/* Quality Gates Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Quality Management & Gates</Typography>
              <Typography variant="body2" color="text.secondary">
                Review deliverables and quality checks.
              </Typography>
            </Box>
            {(!project.qualityManagement || project.qualityManagement.length === 0) && (
              <Button variant="contained" onClick={() => initQuality({ variables: { projectId: project.id } })}>
                Initialize Quality Gates
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />

          {(!project.qualityManagement || project.qualityManagement.length === 0) ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No quality gates initialized for this project.</Typography>
            </Box>
          ) : (
            <Box>
              {[...project.qualityManagement]
                .sort((a: any, b: any) => {
                  const order = ['building_phase', 'qa', 'uat', 'sqa_sqct', 'environment_record'];
                  return order.indexOf(a.phase) - order.indexOf(b.phase);
                })
                .map((qm: any) => {
                  let deliverablesObj = {};
                  try {
                    deliverablesObj = typeof qm.deliverables === 'string' ? JSON.parse(qm.deliverables) : (qm.deliverables || {});
                  } catch (e) {
                    // console.error("Failed to parse deliverables", e);
                  }

                  return (
                    <Accordion key={qm.id} defaultExpanded={qm.status === 'in_progress'}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                          <Typography sx={{ width: '40%', flexShrink: 0, fontWeight: 600 }}>
                            {qm.phase.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', mr: 2 }}>
                            Status:
                          </Typography>
                          <Chip
                            label={qm.status}
                            color={qm.status === 'completed' ? 'success' : qm.status === 'in_progress' ? 'primary' : 'default'}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle2">Update Status:</Typography>
                          <TextField
                            select
                            size="small"
                            value={qm.status}
                            onChange={(e) => handleQualityStatusChange(qm.id, e.target.value)}
                            sx={{ width: 150 }}
                          >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="blocked">Blocked</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </TextField>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>Deliverables:</Typography>
                        <List dense>
                          {Object.entries(deliverablesObj).map(([key, val]: [string, any]) => (
                            <ListItem
                              key={key}
                              button
                              onClick={() => handleDeliverableToggle(qm, key)}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={val.completed === true}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={key.replace(/_/g, ' ')}
                                secondary={val.link ? <a href={val.link} onClick={(e) => e.stopPropagation()}>View Document</a> : 'No document linked'}
                              />
                            </ListItem>
                          ))}
                          {Object.keys(deliverablesObj).length === 0 && (
                            <Typography variant="caption" color="text.secondary">No specific deliverables defined.</Typography>
                          )}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
            </Box>
          )}
        </Paper>
      )}

      {/* Other Tabs */}
      {tabValue === 3 && <Box sx={{ p: 2 }}>Requirements List would go here. <Button onClick={() => navigate('/requirements')}>Go to Requirements Page</Button></Box>}
      {tabValue === 4 && <Box sx={{ p: 2 }}>Test Cases would go here. <Button onClick={() => navigate('/test-cases')}>Go to Test Cases Page</Button></Box>}
      {tabValue === 5 && <Box sx={{ p: 2 }}>Deployment History would go here. <Button onClick={() => navigate('/deployments')}>Go to Deployments Page</Button></Box>}

      {/* Edit Project Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <TextField
              select
              label="Priority"
              fullWidth
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTaskOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitTask} disabled={!taskForm.title}>Create Task</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              fullWidth
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitTask}>Update Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
