import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Typography,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

// GraphQL Query
const GET_CRITICAL_PATH_TASKS = gql`
  query GetCriticalPathTasks {
    getCriticalPathTasks {
      id
      title
      priority
      dueDate
      project {
        id
        name
      }
      assignedTo {
        id
        firstName
        lastName
        avatar
        allocations {
          allocationPercentage
          isActive
        }
      }
    }
  }
`;

const CriticalPathTable: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CRITICAL_PATH_TASKS);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">Error loading critical path data</Alert>;

  const tasks = data?.getCriticalPathTasks || [];

  const calculateTotalAllocation = (allocations: any[]) => {
    if (!allocations) return 0;
    return allocations
      .filter((a: any) => a.isActive)
      .reduce((sum: number, a: any) => sum + a.allocationPercentage, 0);
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity > 100) return 'error';
    if (capacity > 80) return 'warning';
    return 'success';
  };

  const getAvatarColor = (name: string) => {
    // Simple hash for color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Critical Path Tasks
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          These tasks are flagged as CRITICAL or HIGH priority. Delays here directly impact project success.
        </Typography>
      </Box>

      {tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No critical path tasks identified currently.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Capacity Load</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task: any) => {
                const assigneeName = task.assignedTo
                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                  : 'Unassigned';

                const totalAllocation = task.assignedTo
                  ? calculateTotalAllocation(task.assignedTo.allocations)
                  : 0;

                // Determine risk level
                // Risk is High if Unassigned OR Capacity > 100% OR Due Date is passed
                const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
                let riskLevel = 'Low';
                if (!task.assignedTo || totalAllocation > 100 || isOverdue) riskLevel = 'High';
                else if (totalAllocation > 90) riskLevel = 'Medium';

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Chip
                        label={task.project?.name || 'Unknown'}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {task.priority === 'critical' && <WarningIcon color="error" fontSize="small" sx={{ mr: 1 }} />}
                        <Typography variant="body2">{task.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {task.assignedTo ? (
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: getAvatarColor(assigneeName),
                              fontSize: '0.75rem',
                              mr: 1
                            }}
                            src={task.assignedTo.avatar}
                          >
                            {assigneeName.charAt(0)}
                          </Avatar>
                        ) : (
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'grey.300' }}>?</Avatar>
                        )}
                        <Typography variant="body2">{assigneeName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {task.assignedTo ? (
                        <Chip
                          label={`${totalAllocation}%`}
                          color={getCapacityColor(totalAllocation) as any}
                          size="small"
                        />
                      ) : (
                        <Chip label="N/A" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={riskLevel}
                        color={
                          riskLevel === 'High' ? 'error' :
                            riskLevel === 'Medium' ? 'warning' :
                              'success'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default CriticalPathTable;
