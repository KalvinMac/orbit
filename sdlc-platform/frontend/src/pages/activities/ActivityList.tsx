import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    IconButton,
    Card,
    CardHeader
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import AssignmentIcon from '@mui/icons-material/AssignmentRounded';
import BugReportIcon from '@mui/icons-material/BugReportRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import CodeIcon from '@mui/icons-material/CodeRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';

const GET_RECENT_ACTIVITIES = gql`
  query GetRecentActivities {
    getRecentActivities(limit: 50) {
      id
      entityType
      entityId
      title
      action
      timestamp
      user
      status
    }
  }
`;

const getEntityIcon = (type: string) => {
    switch (type) {
        case 'Project': return <AssignmentIcon />;
        case 'Task': return <CodeIcon />;
        case 'Strategic Goal': return <TrendingUpIcon />;
        case 'DVF': return <RocketLaunchIcon />;
        default: return <AccessTimeIcon />;
    }
};

const getEntityColor = (type: string) => {
    switch (type) {
        case 'Project': return 'primary';
        case 'Task': return 'info';
        case 'Strategic Goal': return 'warning';
        case 'DVF': return 'secondary';
        default: return 'default';
    }
};

const ActivityList: React.FC = () => {
    const { loading, error, data, refetch } = useQuery(GET_RECENT_ACTIVITIES, {
        pollInterval: 30000 // Poll every 30 seconds
    });

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading activities: {error.message}</Alert>;

    const activities = data?.getRecentActivities || [];

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Activity Log
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Audit of recent database changes and updates.
                    </Typography>
                </Box>
                <IconButton onClick={() => refetch()}><RefreshIcon /></IconButton>
            </Box>

            <Paper sx={{ overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell>Entity</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activities.map((activity: any) => (
                                <TableRow key={activity.id} hover>
                                    <TableCell>
                                        <Chip
                                            icon={getEntityIcon(activity.entityType)}
                                            label={activity.entityType}
                                            size="small"
                                            color={getEntityColor(activity.entityType) as any}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="600">{activity.title}</Typography>
                                        {activity.status && (
                                            <Typography variant="caption" color="text.secondary">Status: {activity.status}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={activity.action}
                                            size="small"
                                            color={activity.action === 'Created' ? 'success' : 'default'}
                                            sx={{ height: 24, fontSize: '0.75rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                {activity.user ? activity.user[0] : 'S'}
                                            </Avatar>
                                            <Typography variant="body2">{activity.user || 'System'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activities.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">No recent activities found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ActivityList;
