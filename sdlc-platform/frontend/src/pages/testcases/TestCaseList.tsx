import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  useTheme,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// GraphQL
const GET_DATA = gql`
  query GetTestCasesData {
    testCases {
      id
      title
      status
      type
      priority
      isAutomated
      jiraLink
      category
      project {
        id
        name
      }
      assignedTo {
        id
        firstName
        lastName
      }
    }
    projects {
      id
      name
    }
    users {
      id
      firstName
      lastName
      email
    }
  }
`;

const CREATE_TEST_CASE = gql`
  mutation CreateTestCase($title: String!, $description: String!, $steps: String, $expectedResults: String, $projectId: String!, $createdById: String!, $type: String, $priority: String, $assignedToId: String, $jiraLink: String, $category: String) {
    createTestCase(title: $title, description: $description, steps: $steps, expectedResults: $expectedResults, projectId: $projectId, createdById: $createdById, type: $type, priority: $priority, assignedToId: $assignedToId, jiraLink: $jiraLink, category: $category) {
      id
      title
    }
  }
`;

const DELETE_TEST_CASE = gql`
  mutation DeleteTestCase($id: String!) {
    deleteTestCase(id: $id)
  }
`;

const TEST_TYPES = ['unit', 'integration', 'system', 'performance', 'security', 'usability', 'regression', 'acceptance', 'regulatory'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const TestCaseList: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: '',
    expectedResults: '',
    projectId: '',
    createdById: '',
    type: 'UNIT',
    priority: 'medium',
    assignedToId: '',
    jiraLink: '',
    category: ''
  });

  const { loading, error, data, refetch } = useQuery(GET_DATA);

  React.useEffect(() => {
    if (data?.users?.length > 0 && !formData.createdById) {
      setFormData(prev => ({ ...prev, createdById: data.users[0].id }));
    }
  }, [data]);

  const [createTestCase] = useMutation(CREATE_TEST_CASE, {
    onCompleted: () => {
      setOpenDialog(false);
      setFormData(prev => ({ ...prev, title: '', description: '', steps: '', expectedResults: '' }));
      refetch();
    }
  });

  const [deleteTestCase] = useMutation(DELETE_TEST_CASE, {
    onCompleted: () => refetch()
  });

  const handleSubmit = () => {
    if (formData.title && formData.projectId) {
      const variables: any = { ...formData };
      if (!variables.assignedToId) delete variables.assignedToId;
      createTestCase({ variables });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete test case?')) {
      deleteTestCase({ variables: { id } });
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1.5, minWidth: 200 },
    {
      field: 'jiraLink',
      headerName: 'Jira Link',
      width: 150,
      renderCell: (params) => params.value ? <a href={params.value.startsWith('http') ? params.value : `https://${params.value}`} target="_blank" rel="noopener noreferrer">View in Jira</a> : '-'
    },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'type', headerName: 'Type', width: 130, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" /> },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => {
        let color: any = 'default';
        if (params.value === 'high') color = 'warning';
        if (params.value === 'critical') color = 'error';
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => <Chip label={params.value} size="small" variant="filled" color={params.value === 'passed' ? 'success' : params.value === 'failed' ? 'error' : 'default'} />
    },
    {
      field: 'isAutomated',
      headerName: 'Automated',
      width: 100,
      type: 'boolean'
    },
    { field: 'assignedTo', headerName: 'Owner', flex: 1, valueGetter: (params) => params.row.assignedTo ? `${params.row.assignedTo.firstName} ${params.row.assignedTo.lastName}` : 'Unassigned' },
    { field: 'project', headerName: 'Project', flex: 1, valueGetter: (params) => params.row.project?.name || '-' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem icon={<DeleteIcon color="error" />} label="Delete" onClick={() => handleDelete(params.id as string)} />,
      ]
    }
  ];

  if (loading) return <Box p={3}>Loading...</Box>;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Test Cases
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test cases, automation status, and runs.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Test Case
        </Button>
      </Box>

      <Paper elevation={0} sx={{ height: 600, width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <DataGrid
          rows={data?.testCases || []}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: theme.palette.grey[50] } }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Test Case</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <TextField label="Jira Link" fullWidth value={formData.jiraLink} onChange={e => setFormData({ ...formData, jiraLink: e.target.value })} placeholder="e.g. https://jira.example.com/browse/TEST-123" />
            <TextField label="Category" fullWidth value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <TextField label="Steps" fullWidth multiline rows={3} placeholder="Step 1... Step 2..." value={formData.steps} onChange={e => setFormData({ ...formData, steps: e.target.value })} />
            <TextField label="Expected Results" fullWidth multiline rows={2} value={formData.expectedResults} onChange={e => setFormData({ ...formData, expectedResults: e.target.value })} />

            <Stack direction="row" spacing={2}>
              <TextField select label="Type" fullWidth required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                {TEST_TYPES.map(t => <MenuItem key={t} value={t.toUpperCase()}>{t.replace('_', ' ').toUpperCase()}</MenuItem>)}
              </TextField>
              <TextField select label="Priority" fullWidth required value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p.toUpperCase()}</MenuItem>)}
              </TextField>
            </Stack>

            <TextField select label="Project" fullWidth required value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
              {data.projects.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>

            <Stack direction="row" spacing={2}>
              <TextField select label="Assign To" fullWidth value={formData.assignedToId} onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}>
                <MenuItem value=""><em>Unassigned</em></MenuItem>
                {data.users.map((u: any) => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
              </TextField>
              <TextField select label="Reporter" fullWidth required value={formData.createdById} onChange={e => setFormData({ ...formData, createdById: e.target.value })}>
                {data.users.map((u: any) => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title || !formData.projectId || !formData.createdById}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestCaseList;
