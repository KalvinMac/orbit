import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    MenuItem,
    Chip,
    LinearProgress,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Standard Presets
const STANDARD_PHASES = [
    { value: 'planning', label: 'Strategic Planning' },
    { value: 'architecture', label: 'Architecture & Design' },
    { value: 'implementation', label: 'Implementation' },
    { value: 'testing', label: 'Testing & Validation' },
    { value: 'deployment', label: 'Deployment' }
];

const GET_PROJECT_WORKFLOW = gql`
  query GetProjectWorkflow($projectId: ID!) {
    getProjectWorkflow(projectId: $projectId) {
      id
      phaseType
      phaseName
      status
      tasks {
        id
        title
        taskType
        status
        priority
      }
    }
  }
`;

const CREATE_PHASE = gql`
  mutation CreatePhase($projectId: ID!, $phaseType: String!, $status: String) {
    createPhase(projectId: $projectId, phaseType: $phaseType, status: $status) {
      id
      phaseType
      phaseName
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $phaseId: ID!, $title: String!, $taskType: String!) {
    createTask(projectId: $projectId, phaseId: $phaseId, title: $title, taskType: $taskType) {
      id
      title
      taskType
    }
  }
`;

const DELETE_PHASE = gql`
  mutation DeletePhase($id: ID!) {
    deletePhase(id: $id)
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const WorkflowEditor: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    // Dialog States
    const [openPhaseDialog, setOpenPhaseDialog] = useState(false);
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

    // Form States
    const [newPhaseName, setNewPhaseName] = useState('');
    const [useCustomPhase, setUseCustomPhase] = useState(false);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState('custom');

    const { loading, error, data, refetch } = useQuery(GET_PROJECT_WORKFLOW, {
        variables: { projectId },
        skip: !projectId
    });

    const [createPhase] = useMutation(CREATE_PHASE, {
        onCompleted: () => {
            setOpenPhaseDialog(false);
            setNewPhaseName('');
            refetch();
        }
    });

    const [createTask] = useMutation(CREATE_TASK, {
        onCompleted: () => {
            setOpenTaskDialog(false);
            setNewTaskTitle('');
            refetch();
        }
    });

    const [deletePhase] = useMutation(DELETE_PHASE, { onCompleted: refetch });
    const [deleteTask] = useMutation(DELETE_TASK, { onCompleted: refetch });

    const handleAddPhase = () => {
        if (newPhaseName) {
            createPhase({
                variables: {
                    projectId,
                    phaseType: newPhaseName, // This can now be a custom string
                    status: 'not_started'
                }
            });
        }
    };

    const handleAddTask = () => {
        if (newTaskTitle && selectedPhaseId) {
            createTask({
                variables: {
                    projectId,
                    phaseId: selectedPhaseId,
                    title: newTaskTitle,
                    taskType: newTaskType || 'custom'
                }
            });
        }
    };

    const handleDeletePhase = (id: string) => {
        if (window.confirm('Delete this phase and all its tasks?')) {
            deletePhase({ variables: { id } });
        }
    };

    const handleDeleteTask = (id: string) => {
        if (window.confirm('Delete this task?')) {
            deleteTask({ variables: { id } });
        }
    };

    if (loading) return <LinearProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    const phases = data?.getProjectWorkflow || [];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    Workflow Editor
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenPhaseDialog(true)}
                >
                    Add Phase
                </Button>
            </Box>

            <Box>
                {phases.map((phase: any) => (
                    <Accordion key={phase.id} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    {phase.phaseName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                    {phase.phaseType}
                                </Typography>
                                <Chip
                                    label={phase.tasks.length + ' Tasks'}
                                    size="small"
                                    sx={{ mr: 2 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); handleDeletePhase(phase.id); }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {phase.tasks.map((task: any) => (
                                    <ListItem key={task.id} divider>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={`Type: ${task.taskType} | Status: ${task.status}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {phase.tasks.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                        No tasks in this phase.
                                    </Typography>
                                )}
                            </List>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    startIcon={<AddIcon />}
                                    variant="outlined"
                                    onClick={() => {
                                        setSelectedPhaseId(phase.id);
                                        setOpenTaskDialog(true);
                                    }}
                                >
                                    Add Task
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
                {phases.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No workflow phases defined. Click "Add Phase" to start.
                        </Typography>
                    </Paper>
                )}
            </Box>

            {/* Add Phase Dialog */}
            <Dialog open={openPhaseDialog} onClose={() => setOpenPhaseDialog(false)}>
                <DialogTitle>Add New Phase</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, minWidth: 400 }}>
                        {!useCustomPhase ? (
                            <TextField
                                select
                                label="Select Phase Type"
                                fullWidth
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                {STANDARD_PHASES.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        ) : (
                            <TextField
                                label="Custom Phase Name"
                                fullWidth
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                sx={{ mb: 2 }}
                                helperText="Use lowercase with underscores (e.g., 'security_review')"
                            />
                        )}
                        <Button onClick={() => {
                            setUseCustomPhase(!useCustomPhase);
                            setNewPhaseName('');
                        }}>
                            {useCustomPhase ? "Choose from Presets" : "Create Custom Phase"}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPhaseDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddPhase} variant="contained" disabled={!newPhaseName}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Task Dialog */}
            <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, minWidth: 400 }}>
                        <TextField
                            label="Task Title"
                            fullWidth
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Task Type (Optional classification)"
                            fullWidth
                            value={newTaskType}
                            onChange={(e) => setNewTaskType(e.target.value)}
                            placeholder="e.g., development, review, etc."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddTask} variant="contained" disabled={!newTaskTitle}>
                        Add Task
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WorkflowEditor;
