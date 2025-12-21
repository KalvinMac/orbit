import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Chip,
    Stack,
    Alert,
    Divider,
    Avatar,
    Card,
    CardContent,
    Container,
    LinearProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Psychology as DesirabilityIcon,
    TrendingUp as ViabilityIcon,
    Build as FeasibilityIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const GET_DVF = gql`
  query GetDVF($id: ID!) {
    getDVF(id: $id) {
      id
      title
      description
      desirability
      viability
      feasibility
      status
      status
      createdAt
      updatedAt
      createdBy {
        firstName
        lastName
      }
      projects {
        id
        name
        status
        progress
        owner {
          firstName
          lastName
        }
      }
    }
  }
`;

const DVFDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { loading, error, data } = useQuery(GET_DVF, {
        variables: { id },
        skip: !id
    });

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><LinearProgress sx={{ width: '50%' }} /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>Error loading DVF: {error.message}</Alert>;
    if (!data?.getDVF) return <Alert severity="warning" sx={{ m: 4 }}>DVF not found</Alert>;

    const dvf = data.getDVF;

    const StatusChip = ({ status }: { status: string }) => {
        let color: any = 'default';
        const s = status.toLowerCase();
        if (s === 'approved') color = 'success';
        if (s === 'rejected') color = 'error';
        if (s === 'in_review') color = 'warning';
        return (
            <Chip
                label={status.replace('_', ' ').toUpperCase()}
                color={color}
                sx={{ fontWeight: 'bold', borderRadius: 1 }}
            />
        );
    };

    const projectColumns: GridColDef[] = [
        { field: 'name', headerName: 'Project Name', flex: 1.5 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value.replace('_', ' ').toUpperCase()} size="small" variant="outlined" />
            )
        },
        { field: 'progress', headerName: 'Progress', width: 100, renderCell: (params) => <Box sx={{ width: '100%' }}><LinearProgress variant="determinate" value={params.value} sx={{ height: 6, borderRadius: 3 }} /></Box> },
        {
            field: 'owner',
            headerName: 'Owner',
            flex: 1,
            valueGetter: (params) => params.row.owner ? `${params.row.owner.firstName} ${params.row.owner.lastName}` : 'Unassigned'
        }
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                color: 'white',
                pt: 4,
                pb: 8,
                px: 3,
                mb: -4
            }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/dvfs')}
                        sx={{ color: 'white', mb: 3, opacity: 0.8, '&:hover': { opacity: 1 } }}
                    >
                        Back to List
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: 'white' }}>
                                    {dvf.title}
                                </Typography>
                                <StatusChip status={dvf.status} />
                            </Box>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ opacity: 0.9 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'white' }} />
                                    <Typography variant="body1" sx={{ color: 'white' }}>
                                        {dvf.createdBy ? `${dvf.createdBy.firstName} ${dvf.createdBy.lastName}` : 'Unknown Creator'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                                    <Typography variant="body1" sx={{ color: 'white' }}>
                                        Last updated on {new Date(dvf.updatedAt || dvf.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/dvfs/${id}/edit`)}
                            sx={{ mt: 1, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                        >
                            Edit DVF
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1.5, fontWeight: 700 }}>
                        Executive Summary
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'text.primary' }}>
                        {dvf.description || 'No description provided for this initiative.'}
                    </Typography>
                </Paper>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                                        <DesirabilityIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={700}>Desirability</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {dvf.desirability || 'Analysis pending...'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
                                        <ViabilityIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={700}>Viability</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {dvf.viability || 'Analysis pending...'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}>
                                        <FeasibilityIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={700}>Feasibility</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {dvf.feasibility || 'Analysis pending...'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Linked Projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Projects executing this DVF strategy.
                    </Typography>
                    <Paper elevation={0} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                        <DataGrid
                            rows={dvf.projects || []}
                            columns={projectColumns}
                            autoHeight
                            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                            pageSizeOptions={[5]}
                            disableRowSelectionOnClick
                            onRowClick={(params) => navigate(`/projects/${params.id}`)}
                            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, cursor: 'pointer' }}
                        />
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default DVFDetails;
