import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    Chip,
    useTheme
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridActionsCellItem
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';

// GraphQL
const GET_DVFS = gql`
  query GetDVFs {
    getDVFs {
      id
      title
      description
      desirability
      viability
      feasibility
      status
      createdAt
      createdBy {
        firstName
        lastName
      }
    }
  }
`;

const DELETE_DVF = gql`
  mutation DeleteDVF($id: ID!) {
    deleteDVF(id: $id)
  }
`;

const DVFList: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { loading: dvfsLoading, error: dvfsError, data: dvfsData, refetch: refetchDVFs } = useQuery(GET_DVFS);

    const [deleteDVF] = useMutation(DELETE_DVF, {
        onCompleted: () => refetchDVFs()
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete DVF?')) {
            deleteDVF({ variables: { id } });
        }
    };

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', flex: 1.5, minWidth: 200 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                let color: any = 'default';
                if (params.value === 'approved') color = 'success';
                if (params.value === 'rejected') color = 'error';
                if (params.value === 'in_review') color = 'warning';
                return <Chip label={params.value.replace('_', ' ').toUpperCase()} color={color} size="small" />;
            }
        },
        { field: 'createdBy', headerName: 'Created By', flex: 1, valueGetter: (params) => params.row.createdBy ? `${params.row.createdBy.firstName} ${params.row.createdBy.lastName}` : '-' },
        {
            field: 'createdAt',
            headerName: 'Date',
            width: 150,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem icon={<ViewIcon color="primary" />} label="View" onClick={() => navigate(`/dvfs/${params.id}`)} />,
                <GridActionsCellItem icon={<EditIcon color="primary" />} label="Edit" onClick={() => navigate(`/dvfs/${params.id}/edit`)} />,
                <GridActionsCellItem icon={<DeleteIcon color="error" />} label="Delete" onClick={() => handleDelete(params.id as string)} />,
            ]
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%', p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                        DVFs
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage DVFs which drive projects.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dvfs/new')}>
                    New DVF
                </Button>
            </Box>

            <Paper elevation={0} sx={{ height: 600, width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                {dvfsLoading ? (
                    <Box p={3}>Loading DVFs...</Box>
                ) : dvfsError ? (
                    <Alert severity="error">Error loading DVFs: {dvfsError.message}</Alert>
                ) : (
                    <DataGrid
                        rows={dvfsData?.getDVFs || []}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        disableRowSelectionOnClick
                        sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: theme.palette.grey[50] } }}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default DVFList;
