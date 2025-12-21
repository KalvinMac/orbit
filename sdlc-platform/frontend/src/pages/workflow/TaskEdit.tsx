import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Breadcrumbs,
    Link,
    LinearProgress,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Get specific task query
const GET_TASK = gql`
  query GetTask($id: ID!) {
    getTask(id: $id) {
      id
      title
      description
      status
      priority
      taskType
      dueDate
      assignedTo {
        id
      }
    }
  }
`;

// Update task mutation
const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!, 
    $title: String, 
    $description: String, 
    $status: TaskStatus, 
    $priority: TaskPriority, 
    $taskType: String,
    $dueDate: DateTime
  ) {
    updateTask(
      id: $id, 
      title: $title, 
      description: $description, 
      status: $status, 
      priority: $priority, 
      dueDate: $dueDate
    ) {
      id
      title
      status
      priority
      dueDate
    }
  }
`;

const GET_USERS = gql`
  query GetUsersForTask {
    users {
      id
      firstName
      lastName
    }
  }
`;

const TaskEdit: React.FC = () => {
    const { phaseId, taskId } = useParams<{ phaseId: string; taskId: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: '',
        priority: '',
        taskType: '',
        dueDate: '',
        assignedToId: ''
    });

    // Since we don't have a direct "getTask" query in the resolver shown earlier (custom query needed?), 
    // I'll check WorkflowResolver.ts again. 
    // It has getPhaseTasks, getRecentTasks, getCriticalPathTasks. 
    // It MISSES a getTask(id) query! 
    // I will need to ADD getTask to the resolver or use getPhaseTasks and filter.
    // Adding getTask is cleaner. For now I will assume I will add it or use a trick.
    // Let's assume I'll add `getTask` to backend in next step.

    const { loading: taskLoading, error: taskError, data: taskData } = useQuery(GET_TASK, {
        variables: { id: taskId },
        skip: !taskId,
        onCompleted: (data) => {
            if (data?.getTask) {
                const t = data.getTask;
                setFormData({
                    title: t.title || '',
                    description: t.description || '',
                    status: t.status || 'todo',
                    priority: t.priority || 'medium',
                    taskType: t.taskType || '',
                    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
                    assignedToId: t.assignedTo?.id || ''
                });
            }
        }
    });

    const { data: userData } = useQuery(GET_USERS);

    const [updateTask, { loading: saving }] = useMutation(UPDATE_TASK, {
        onCompleted: () => {
            navigate(-1); // Go back
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTask({
            variables: {
                id: taskId,
                ...formData,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : null
            }
        });
    };

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (taskLoading) return <LinearProgress />;
    if (taskError) return <Alert severity="error">Error loading task: {taskError.message}</Alert>;

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Edit Task
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Task Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Status"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="in_review">In Review</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="blocked">Blocked</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Due Date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Assigned To"
                                name="assignedToId"
                                value={formData.assignedToId}
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>Unassigned</em></MenuItem>
                                {userData?.users.map((user: any) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={saving}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default TaskEdit;
