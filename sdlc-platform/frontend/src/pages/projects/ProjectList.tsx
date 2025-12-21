import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  useTheme
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

// GraphQL Operations
const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      progress
      startDate
      targetEndDate
      owner {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
    }
  }
`;

const GET_DVFS = gql`
  query GetDVFsForProjectSelect {
    getDVFs {
      id
      title
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

const CREATE_PROJECT = gql`
  mutation CreateProject($data: CreateProjectInput!) {
    createProject(data: $data) {
      id
      name
      status
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id)
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: String!, $name: String, $description: String, $status: ProjectStatus, $progress: Float) {
    updateProject(id: $id, name: $name, description: $description, status: $status, progress: $progress) {
      id
      name
      status
      progress
    }
  }
`;

interface ProjectFormData {
  name: string;
  description: string;
  ownerId: string;
  objectiveId: string;
  dvfId: string;
}

const ProjectList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDialog, setOpenDialog] = useState(location.state?.openCreateDialog || false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    ownerId: '',
    objectiveId: '',
    dvfId: '',
  });

  // Queries
  const { loading, error, data, refetch } = useQuery(GET_PROJECTS);
  const { data: usersData } = useQuery(GET_USERS);
  const { data: objectivesData } = useQuery(GET_OBJECTIVES);
  const { data: dvfsData } = useQuery(GET_DVFS);

  // Mutations
  const [createProject] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      setOpenDialog(false);
      setFormData({ name: '', description: '', ownerId: '', objectiveId: '', dvfId: '' });
      refetch();
    },
    onError: (err) => console.error(err),
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => refetch(),
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.name && formData.description && formData.ownerId) {
      createProject({
        variables: {
          data: {
            ...formData,
            objectiveId: formData.objectiveId || null,
            dvfId: formData.dvfId || null
          }
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject({ variables: { id } });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'planning': return 'info';
      case 'on_hold': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Project Name', flex: 1.5, minWidth: 200 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? (params.value as string).replace('_', ' ').toUpperCase() : 'UNKNOWN'}
          color={getStatusColor(params.value as string) as any}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, borderRadius: 1 }}
        />
      )
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 100,
      type: 'number',
      valueFormatter: (params) => `${params.value}%`
    },
    {
      field: 'owner',
      headerName: 'Owner',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const owner = params.row.owner;
        return owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned';
      }
    },
    {
      field: 'dates',
      headerName: 'Timeline',
      width: 200,
      valueGetter: (params) => {
        if (!params.row.startDate) return '-';
        return `${format(new Date(params.row.startDate), 'MMM d, yyyy')}`;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {params.row.startDate ? format(new Date(params.row.startDate), 'MMM d, yyyy') : 'TBD'}
          {' → '}
          {params.row.targetEndDate ? format(new Date(params.row.targetEndDate), 'MMM d, yyyy') : 'TBD'}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon color="primary" />}
          label="View"
          onClick={() => navigate(`/projects/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  if (loading) return <Typography sx={{ p: 4 }}>Loading projects...</Typography>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>Error loading projects: {error.message}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your software development projects and tracking.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ px: 3, py: 1 }}
        >
          New Project
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          height: 600,
          width: '100%',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <DataGrid
          rows={data?.projects || []}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.grey[50],
            },
          }}
        />
      </Paper>

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Project Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
            <TextField
              select
              label="Project Owner"
              name="ownerId"
              fullWidth
              value={formData.ownerId}
              onChange={handleInputChange}
            >
              {usersData?.users.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Strategic Objective (Optional)"
              name="objectiveId"
              fullWidth
              value={formData.objectiveId}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {objectivesData?.objectives.map((obj: any) => (
                <MenuItem key={obj.id} value={obj.id}>
                  {obj.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="DVF (Recommended)"
              name="dvfId"
              fullWidth
              value={formData.dvfId}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {dvfsData?.getDVFs.map((dvf: any) => (
                <MenuItem key={dvf.id} value={dvf.id}>
                  {dvf.title}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.description || !formData.ownerId}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
