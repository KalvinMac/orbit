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
  IconButton
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRenderCellParams
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  RocketLaunch as RocketIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// GraphQL
const GET_DATA = gql`
  query GetDeploymentsData {
    deployments {
      id
      name
      version
      environment
      status
      type
      plannedDate
      actualStartDate
      links
      project {
        id
        name
      }
      deployedBy {
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

const CREATE_DEPLOYMENT = gql`
  mutation CreateDeployment($name: String!, $version: String!, $projectId: String!, $deployedById: String!, $plannedDate: DateTime!, $type: String!, $environment: String!, $description: String, $links: [String!]) {
    createDeployment(name: $name, version: $version, projectId: $projectId, deployedById: $deployedById, plannedDate: $plannedDate, type: $type, environment: $environment, description: $description, links: $links) {
      id
      name
    }
  }
`;

const DELETE_DEPLOYMENT = gql`
  mutation DeleteDeployment($id: String!) {
    deleteDeployment(id: $id)
  }
`;

const ENVIRONMENTS = ['development', 'qa', 'staging', 'uat', 'production'];
const TYPES = ['technical', 'commercial'];

const DeploymentList: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    projectId: '',
    deployedById: '',
    type: 'TECHNICAL',
    environment: 'DEVELOPMENT',
    plannedDate: '',
    description: '',
    links: '' // Helper for text input
  });

  const { loading, error, data, refetch } = useQuery(GET_DATA);

  React.useEffect(() => {
    if (data?.users?.length > 0 && !formData.deployedById) {
      setFormData(prev => ({ ...prev, deployedById: data.users[0].id }));
    }
  }, [data]);

  const [createDeployment] = useMutation(CREATE_DEPLOYMENT, {
    onCompleted: () => {
      setOpenDialog(false);
      setFormData(prev => ({ ...prev, name: '', version: '', description: '', plannedDate: '', links: '' }));
      refetch();
    },
    onError: (err) => console.error(err)
  });

  const [deleteDeployment] = useMutation(DELETE_DEPLOYMENT, {
    onCompleted: () => refetch()
  });

  const handleSubmit = () => {
    if (formData.name && formData.projectId && formData.plannedDate && formData.version) {
      // Split links by comma or newline
      const linkArray = formData.links
        ? formData.links.split(/[\n,]+/).map(l => l.trim()).filter(l => l.length > 0)
        : [];

      // Ensure plannedDate is converted to ISO string or Date object as expected by backend
      createDeployment({
        variables: {
          ...formData,
          plannedDate: new Date(formData.plannedDate),
          links: linkArray
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete deployment record?')) {
      deleteDeployment({ variables: { id } });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Deployment Name', flex: 1.5, minWidth: 200 },
    { field: 'version', headerName: 'Version', width: 90 },
    {
      field: 'environment',
      headerName: 'Environment',
      width: 120,
      renderCell: (params) => <Chip label={params.value?.toUpperCase()} size="small" color="primary" variant="outlined" />
    },
    {
      field: 'links',
      headerName: 'Links',
      width: 100,
      renderCell: (params) => {
        const links = params.value as string[] || [];
        return links.length > 0 ? (
          <Stack direction="row" spacing={0.5}>
            {links.map((link, i) => (
              <IconButton key={i} size="small" href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">
                <RocketIcon fontSize="inherit" color="action" />
              </IconButton>
            ))}
          </Stack>
        ) : '-';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => {
        let color: any = 'default';
        if (params.value === 'completed') color = 'success';
        if (params.value === 'failed') color = 'error';
        if (params.value === 'in_progress') color = 'warning';
        return <Chip label={params.value?.replace('_', ' ').toUpperCase()} color={color} size="small" variant="filled" />;
      }
    },
    {
      field: 'plannedDate',
      headerName: 'Planned Date',
      width: 180,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'PP p') : '-'
    },
    { field: 'project', headerName: 'Project', flex: 1, valueGetter: (params) => params.row.project?.name || '-' },
    { field: 'deployedBy', headerName: 'Deployer', flex: 1, valueGetter: (params) => params.row.deployedBy ? `${params.row.deployedBy.firstName} ${params.row.deployedBy.lastName}` : 'System' },
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
            Deployments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage software deployments across environments.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Deployment
        </Button>
      </Box>

      <Paper elevation={0} sx={{ height: 600, width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <DataGrid
          rows={data?.deployments || []}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: theme.palette.grey[50] } }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Deployment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., v1.0.0 Release" />
            <TextField label="Version" fullWidth required value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} placeholder="1.0.0" />
            <TextField label="Description" fullWidth multiline rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <TextField label="Links" fullWidth multiline rows={2} value={formData.links} onChange={e => setFormData({ ...formData, links: e.target.value })} placeholder="Add links separated by newline or comma" />

            <Stack direction="row" spacing={2}>
              <TextField select label="Environment" fullWidth required value={formData.environment} onChange={e => setFormData({ ...formData, environment: e.target.value })}>
                {ENVIRONMENTS.map(e => <MenuItem key={e} value={e.toUpperCase()}>{e.toUpperCase()}</MenuItem>)}
              </TextField>
              <TextField select label="Type" fullWidth required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                {TYPES.map(t => <MenuItem key={t} value={t.toUpperCase()}>{t.toUpperCase()}</MenuItem>)}
              </TextField>
            </Stack>

            <TextField label="Planned Date" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }} value={formData.plannedDate} onChange={e => setFormData({ ...formData, plannedDate: e.target.value })} />

            <TextField select label="Project" fullWidth required value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
              {data.projects.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>

            <TextField select label="Deployed By" fullWidth required value={formData.deployedById} onChange={e => setFormData({ ...formData, deployedById: e.target.value })}>
              {data.users.map((u: any) => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name || !formData.projectId || !formData.version || !formData.plannedDate || !formData.deployedById}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeploymentList;
