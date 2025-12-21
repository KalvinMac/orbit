import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    MenuItem,
    Alert,
    Grid,
    Container,
    Divider,
    Stack,
    Card,
    CardContent,
    CardHeader
} from '@mui/material';
import {
    Save as SaveIcon,
    Cancel as CancelIcon,
    Psychology as DesirabilityIcon,
    TrendingUp as ViabilityIcon,
    Build as FeasibilityIcon
} from '@mui/icons-material';

const GET_DVF = gql`
  query GetDVF($id: ID!) {
    getDVF(id: $id) {
      id
      title
      description
      desirability
      viability
      feasibility
      createdBy {
        id
      }
    }
  }
`;

const CREATE_DVF = gql`
  mutation CreateDVF($data: CreateDVFInput!) {
    createDVF(data: $data) {
      id
    }
  }
`;

const UPDATE_DVF = gql`
  mutation UpdateDVF($id: ID!, $data: UpdateDVFInput!) {
    updateDVF(id: $id, data: $data) {
      id
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
    }
  }
`;

const DVFForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        desirability: '',
        viability: '',
        feasibility: '',
        createdById: ''
    });

    const { data: usersData } = useQuery(GET_USERS);
    const { loading: dvfLoading, error: dvfError, data: dvfData } = useQuery(GET_DVF, {
        variables: { id },
        skip: !isEditMode
    });

    useEffect(() => {
        if (dvfData?.getDVF) {
            const dvf = dvfData.getDVF;
            setFormData({
                title: dvf.title || '',
                description: dvf.description || '',
                desirability: dvf.desirability || '',
                viability: dvf.viability || '',
                feasibility: dvf.feasibility || '',
                createdById: dvf.createdBy?.id || ''
            });
        }
    }, [dvfData]);

    // Set default user if creating new
    useEffect(() => {
        if (!isEditMode && usersData?.users?.length > 0 && !formData.createdById) {
            setFormData(prev => ({ ...prev, createdById: usersData.users[0].id }));
        }
    }, [usersData, isEditMode]);

    const [createDVF] = useMutation(CREATE_DVF, {
        onCompleted: (data) => {
            // If we get an ID back, we could navigate to details, but list is safe for now.
            // data.createDVF.id might correspond to the new ID.
            if (data?.createDVF?.id) {
                navigate(`/dvfs/${data.createDVF.id}`);
            } else {
                navigate('/dvfs');
            }
        }
    });

    const [updateDVF] = useMutation(UPDATE_DVF, {
        onCompleted: () => navigate(`/dvfs/${id}`)
    });

    const handleSubmit = () => {
        if (isEditMode && id) {
            updateDVF({
                variables: {
                    id,
                    data: {
                        title: formData.title,
                        description: formData.description,
                        desirability: formData.desirability,
                        viability: formData.viability,
                        feasibility: formData.feasibility,
                        createdById: formData.createdById
                    }
                }
            });
        } else {
            createDVF({
                variables: {
                    data: {
                        title: formData.title,
                        description: formData.description,
                        desirability: formData.desirability,
                        viability: formData.viability,
                        feasibility: formData.feasibility,
                        createdById: formData.createdById
                    }
                }
            });
        }
    };

    if (dvfLoading) return <Box p={4}>Loading...</Box>;
    if (dvfError) return <Alert severity="error" sx={{ m: 4 }}>Error: {dvfError.message}</Alert>;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mb: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                        {isEditMode ? 'Edit DVF' : 'Define DVF'}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
                        Analyze your initiative through the lens of Desirability, Viability, and Feasibility.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0', mb: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                label="Initiative Title"
                                fullWidth
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="E.g., Mobile App Modernization"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                label="Owner"
                                fullWidth
                                required
                                value={formData.createdById}
                                onChange={e => setFormData({ ...formData, createdById: e.target.value })}
                            >
                                {usersData?.users?.map((u: any) => (
                                    <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Executive Summary"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Briefly describe the initiative..."
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<DesirabilityIcon color="secondary" fontSize="large" />}
                                title={<Typography variant="h6" fontWeight={700}>Desirability</Typography>}
                                subheader="Customer-Centric Question"
                            />
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60, fontStyle: 'italic' }}>
                                    "Are we solving for the right pain point? Is this solution a 'must-have' for the customer? Does it solve their key pain points?"
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    variant="outlined"
                                    placeholder="Analyze customer needs and pain points here..."
                                    value={formData.desirability}
                                    onChange={e => setFormData({ ...formData, desirability: e.target.value })}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<FeasibilityIcon color="info" fontSize="large" />}
                                title={<Typography variant="h6" fontWeight={700}>Feasibility</Typography>}
                                subheader="Operational Question"
                            />
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60, fontStyle: 'italic' }}>
                                    "Are we building on our core operational strengths? Can we leverage existing technology, branding, and partnerships?"
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    variant="outlined"
                                    placeholder="Assess technical and operational capabilities here..."
                                    value={formData.feasibility}
                                    onChange={e => setFormData({ ...formData, feasibility: e.target.value })}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<ViabilityIcon color="success" fontSize="large" />}
                                title={<Typography variant="h6" fontWeight={700}>Viability</Typography>}
                                subheader="Business Question"
                            />
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60, fontStyle: 'italic' }}>
                                    "Does our solution contribute to long-term growth? Is the business model sustainable and profitable?"
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    variant="outlined"
                                    placeholder="Evaluate business impact and sustainability here..."
                                    value={formData.viability}
                                    onChange={e => setFormData({ ...formData, viability: e.target.value })}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        startIcon={<CancelIcon />}
                        onClick={() => navigate('/dvfs')}
                        variant="outlined"
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                        disabled={!formData.title || !formData.createdById}
                    >
                        Save DVF
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default DVFForm;
