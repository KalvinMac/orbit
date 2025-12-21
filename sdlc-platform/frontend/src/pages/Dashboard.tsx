import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Icons
import AssignmentIcon from '@mui/icons-material/AssignmentRounded';
import BugReportIcon from '@mui/icons-material/BugReportRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchRounded';
import ArchitectureIcon from '@mui/icons-material/ArchitectureRounded';
import CodeIcon from '@mui/icons-material/CodeRounded';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import HistoryIcon from '@mui/icons-material/HistoryRounded';

// GraphQL Query
const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    projects {
      id
      name
      description
      status
      progress
      currentPhase
      startDate
      targetEndDate
      updatedAt
      owner {
        firstName
        lastName
      }
    }
    strategicGoals {
        id
        title
        status
    }
    getDVFs {
        id
        title
        status
    }
    getAllAllocations {
        id
        user {
            id
            firstName
            lastName
        }
        allocationPercentage
    }
  }
`;

// Status to color mapping
const statusColors: Record<string, any> = {
  'planning': 'info',
  'in_progress': 'primary',
  'testing': 'warning',
  'completed': 'success',
  'on_hold': 'default',
  'approved': 'success',
  'failed': 'error',
  'in_review': 'secondary',
  'todo': 'default',
  'blocked': 'error'
};

type StatusType = 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' | 'approved' | 'failed' | 'in_review' | 'todo' | 'blocked';

// Phase to icon mapping
const phaseIcons: Record<string, any> = {
  'planning': <AssignmentIcon fontSize="small" />,
  'architecture': <ArchitectureIcon fontSize="small" />,
  'implementation': <CodeIcon fontSize="small" />,
  'testing': <BugReportIcon fontSize="small" />,
  'deployment': <RocketLaunchIcon fontSize="small" />
};

// Status to color mapping

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { loading, error, data } = useQuery(GET_DASHBOARD_DATA);

  // Activity Icon based on type
  const getActivityIcon = (type: string) => {
    // Map task types to icons
    if (type.includes('architecture') || type.includes('design')) return <ArchitectureIcon />;
    if (type.includes('test') || type.includes('validation')) return <BugReportIcon />;
    if (type.includes('deployment') || type.includes('release')) return <RocketLaunchIcon />;
    if (type.includes('code') || type.includes('implementation')) return <CodeIcon />;
    return <AssignmentIcon />;
  };

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha((theme.palette[color as keyof typeof theme.palette] as any)?.main || theme.palette.primary.main, 0.1),
            color: (theme.palette[color as keyof typeof theme.palette] as any)?.main || theme.palette.primary.main,
            display: 'flex'
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Chip
            label={trend}
            size="small"
            color={trend.includes('+') ? 'success' : 'error'}
            variant="outlined"
            icon={<TrendingUpIcon />}
            sx={{ fontWeight: 600, border: 'none', bgcolor: alpha(theme.palette.success.main, 0.1) }}
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight="800" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="500">
        {title}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading dashboard data: {error.message}</Alert>
      </Box>
    );
  }

  const allProjects = data?.projects || [];
  // Sort by updatedAt descending and take top 5
  const projects = [...allProjects].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const strategicGoals = data?.strategicGoals || [];
  const dvfs = data?.getDVFs || [];
  const allocations = data?.getAllAllocations || [];

  // Aggregate capacity by user
  const capacityMap = new Map<string, { user: any, total: number }>();

  allocations.forEach((alloc: any) => {
    const userId = alloc.user.id;
    if (!capacityMap.has(userId)) {
      capacityMap.set(userId, { user: alloc.user, total: 0 });
    }
    const current = capacityMap.get(userId)!;
    current.total += alloc.allocationPercentage;
  });

  const topCapacityUsers = Array.from(capacityMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="800" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, here's what's happening with your projects.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/activities')}
            sx={{ px: 3, py: 1.5 }}
          >
            Activities
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/projects', { state: { openCreateDialog: true } })}
            sx={{ px: 3, py: 1.5 }}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={allProjects.length}
            icon={<AssignmentIcon />}
            color="primary"
            trend="+2 this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Strategic Goals"
            value={strategicGoals.length}
            icon={<TrendingUpIcon />}
            color="warning"
            trend={`${strategicGoals.filter((g: any) => g.status === 'on_track').length} On Track`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="DVFs"
            value={dvfs.length}
            icon={<RocketLaunchIcon />}
            color="info"
            trend={`${dvfs.filter((d: any) => d.status === 'approved').length} Approved`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resource Utilization"
            value={`${allocations.length > 0 ? Math.round(allocations.reduce((acc: number, a: any) => acc + a.allocationPercentage, 0) / allocations.length) : 0}%`}
            icon={<AccessTimeIcon />}
            color="success"
            trend="Avg. Allocation"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column: Projects List & Activity */}
        <Grid item xs={12} lg={8}>
          {/* Projects List */}
          <Paper sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="700">
                Recent Projects
              </Typography>
              <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/projects')}>
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Phase</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project: any) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="600">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : 'No Owner'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          color={statusColors[project.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize', height: 24 }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress variant="determinate" value={project.progress} sx={{ width: '100%', mr: 1, height: 6, borderRadius: 3 }} />
                          <Typography variant="caption">{project.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={phaseIcons[project.currentPhase?.toLowerCase()] || <AssignmentIcon style={{ fontSize: 14 }} />}
                          label={project.currentPhase || 'Planning'}
                          variant="outlined"
                          size="small"
                          sx={{ height: 24, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: OKRs, DVFs, Capacity */}
        <Grid item xs={12} lg={4}>
          {/* Strategic Goals */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700">Strategic Goals</Typography>
              <Button size="small" onClick={() => navigate('/okr')}>View</Button>
            </Box>
            <List dense>
              {strategicGoals.slice(0, 3).map((goal: any) => (
                <ListItem key={goal.id} sx={{ px: 0, borderBottom: '1px dashed #eee' }} secondaryAction={
                  <Chip
                    label={goal.status.replace('_', ' ')}
                    size="small"
                    color={goal.status === 'on_track' ? 'success' : goal.status === 'at_risk' ? 'warning' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }}
                  />
                }>
                  <ListItemText
                    primary={goal.title.length > 30 ? `${goal.title.substring(0, 30)}...` : goal.title}
                    primaryTypographyProps={{ variant: 'subtitle2', title: goal.title }}
                  />
                </ListItem>
              ))}
              {strategicGoals.length === 0 && <Typography variant="body2" color="text.secondary">No strategic goals found.</Typography>}
            </List>
          </Paper>

          {/* DVFs */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700">DVF</Typography>
              <Button size="small" onClick={() => navigate('/dvfs')}>View</Button>
            </Box>
            <List dense>
              {dvfs.slice(0, 3).map((dvf: any) => (
                <ListItem key={dvf.id} sx={{ px: 0, borderBottom: '1px dashed #eee' }} secondaryAction={
                  <Chip label={dvf.status} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                }>
                  <ListItemText
                    primary={dvf.title.length > 30 ? `${dvf.title.substring(0, 30)}...` : dvf.title}
                    primaryTypographyProps={{ variant: 'subtitle2', title: dvf.title }}
                  />
                </ListItem>
              ))}
              {dvfs.length === 0 && <Typography variant="body2" color="text.secondary">No DVF strategies found.</Typography>}
            </List>
          </Paper>

          {/* Capacity */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700">Team Capacity</Typography>
              <Button size="small" onClick={() => navigate('/capacity')}>View</Button>
            </Box>
            <Stack spacing={2}>
              {topCapacityUsers.map((item: any) => (
                <Box key={item.user.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{item.user.firstName[0]}</Avatar>
                    <Typography variant="body2">{item.user.firstName} {item.user.lastName}</Typography>
                  </Box>
                  <Chip
                    label={`${item.total}%`}
                    size="small"
                    color={item.total > 100 ? 'error' : item.total > 80 ? 'warning' : 'success'}
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                  />
                </Box>
              ))}
              {topCapacityUsers.length === 0 && <Typography variant="body2" color="text.secondary">No allocations found.</Typography>}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
