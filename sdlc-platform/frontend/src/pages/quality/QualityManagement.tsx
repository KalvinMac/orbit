import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  IconButton,
  Tooltip
} from '@mui/material';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';

// Define the quality management phases based on diagram
const qualityPhases = [
  {
    id: 1,
    name: 'Building Phase',
    description: 'Initial building phase of the project',
    status: 'completed',
    deliverables: [
      { id: 1, name: 'Design Inputs', status: 'completed', documentUrl: '/docs/design-inputs.pdf' },
      { id: 2, name: 'Trace', status: 'completed', documentUrl: '/docs/trace-document.pdf' },
    ]
  },
  {
    id: 2,
    name: 'QA',
    description: 'Quality Assurance phase',
    status: 'in_progress',
    deliverables: [
      { id: 3, name: 'Architecture and Patterns Spec', status: 'completed', documentUrl: '/docs/architecture-spec.pdf' },
      { id: 4, name: 'Integration Document', status: 'in_progress', documentUrl: '/docs/integration-doc.pdf' },
      { id: 5, name: 'TTP', status: 'not_started', documentUrl: '' },
    ]
  },
  {
    id: 3,
    name: 'UAT',
    description: 'User Acceptance Testing',
    status: 'not_started',
    deliverables: [
      { id: 6, name: 'Acceptance Test Plan and Scripts', status: 'not_started', documentUrl: '' },
    ]
  },
  {
    id: 4,
    name: 'SQA/SQCT',
    description: 'Software Quality Assurance & Control Testing',
    status: 'not_started',
    deliverables: [
      { id: 7, name: 'Test Case', status: 'not_started', documentUrl: '' },
      { id: 8, name: 'Test Reports', status: 'not_started', documentUrl: '' },
      { id: 9, name: 'GXP', status: 'not_started', documentUrl: '' },
    ]
  },
  {
    id: 5,
    name: 'Environment Record',
    description: 'Environment and Deployment Records',
    status: 'not_started',
    deliverables: [
      { id: 10, name: 'DVSRS', status: 'not_started', documentUrl: '' },
      { id: 11, name: 'URS Records', status: 'not_started', documentUrl: '' },
    ]
  },
];

// Status to color and icon mapping
const statusConfig = {
  completed: { color: 'success', icon: <CheckCircleIcon color="success" /> },
  in_progress: { color: 'info', icon: <PendingIcon color="info" /> },
  not_started: { color: 'default', icon: <ErrorIcon color="disabled" /> },
  blocked: { color: 'error', icon: <ErrorIcon color="error" /> }
} as const;

const QualityManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<string>('2'); // Default to QA phase
  const [expanded, setExpanded] = useState<string | false>(false);
  
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handlePhaseChange = (event: SelectChangeEvent) => {
    setActivePhase(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quality Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            sx={{ mr: 2 }}
          >
            Export QMS Report
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/quality/new-deliverable')}
          >
            Add Deliverable
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quality Management Workflow
            </Typography>
            
            <Stepper orientation="vertical" activeStep={1}>
              {qualityPhases.map((phase, index) => (
                <Step key={phase.id} completed={phase.status === 'completed'}>
                  <StepLabel
                    StepIconProps={{
                      icon: phase.status === 'completed' ? 
                        <CheckCircleIcon color="success" /> : 
                        phase.status === 'in_progress' ? 
                          index + 1 : 
                          <ErrorIcon color="disabled" />
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{phase.name}</Typography>
                      <Chip 
                        label={phase.status.replace('_', ' ')} 
                        color={statusConfig[phase.status as keyof typeof statusConfig].color as any}
                        size="small"
                      />
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {phase.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => setActivePhase(String(phase.id))}
                      >
                        View Details
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quality Metrics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText primary="Completed Deliverables" secondary="3 of 11 (27%)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText primary="In Progress Deliverables" secondary="1 of 11 (9%)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText primary="Not Started Deliverables" secondary="7 of 11 (64%)" />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Phase Details
              </Typography>
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel id="phase-select-label">Active Phase</InputLabel>
                <Select
                  labelId="phase-select-label"
                  id="phase-select"
                  value={activePhase}
                  label="Active Phase"
                  onChange={handlePhaseChange}
                >
                  {qualityPhases.map(phase => (
                    <MenuItem key={phase.id} value={String(phase.id)}>
                      {phase.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              {qualityPhases.map(phase => 
                phase.id === parseInt(activePhase) && (
                  <Box key={phase.id}>
                    <Typography variant="h6" gutterBottom>
                      {phase.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {phase.description}
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Required Deliverables
                      </Typography>
                      {phase.deliverables.map(deliverable => (
                        <Accordion 
                          key={deliverable.id} 
                          expanded={expanded === `panel${deliverable.id}`}
                          onChange={handleChange(`panel${deliverable.id}`)}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {statusConfig[deliverable.status as keyof typeof statusConfig].icon}
                                <Typography sx={{ ml: 1 }}>
                                  {deliverable.name}
                                </Typography>
                              </Box>
                              <Chip 
                                label={deliverable.status.replace('_', ' ')} 
                                color={statusConfig[deliverable.status as keyof typeof statusConfig].color as any}
                                size="small"
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              {deliverable.status === 'not_started' ? (
                                <Box>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    This deliverable has not been started yet.
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    startIcon={<AddIcon />}
                                    size="small"
                                    onClick={() => navigate(`/quality/deliverable/${deliverable.id}/create`)}
                                  >
                                    Create Deliverable
                                  </Button>
                                </Box>
                              ) : (
                                <Box>
                                  <Typography variant="body2" gutterBottom>
                                    Document: {deliverable.name}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', mt: 2 }}>
                                    <Button 
                                      variant="outlined" 
                                      startIcon={<VisibilityIcon />}
                                      size="small"
                                      sx={{ mr: 2 }}
                                      onClick={() => navigate(`/quality/deliverable/${deliverable.id}`)}
                                    >
                                      View
                                    </Button>
                                    <Button 
                                      variant="outlined" 
                                      startIcon={<DownloadIcon />}
                                      size="small"
                                      href={deliverable.documentUrl}
                                      disabled={!deliverable.documentUrl}
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                    
                    {phase.id === parseInt(activePhase) && phase.status === 'in_progress' && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Actions
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Review Comments"
                              multiline
                              rows={4}
                              fullWidth
                              placeholder="Enter your review comments..."
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel id="status-update-label">Update Status</InputLabel>
                              <Select
                                labelId="status-update-label"
                                defaultValue=""
                                label="Update Status"
                              >
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="blocked">Blocked</MenuItem>
                              </Select>
                            </FormControl>
                            <Button 
                              variant="contained" 
                              fullWidth
                              sx={{ mt: 2 }}
                            >
                              Update Phase Status
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quality Documentation
            </Typography>
            <List>
              <ListItem button onClick={() => navigate('/quality/docs/quality-plan')}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Quality Management Plan" secondary="Comprehensive plan for quality management" />
                <Tooltip title="View Document">
                  <IconButton edge="end" aria-label="view">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/quality/docs/standards')}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Quality Standards" secondary="Standards and guidelines for quality assurance" />
                <Tooltip title="View Document">
                  <IconButton edge="end" aria-label="view">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/quality/docs/metrics')}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Quality Metrics" secondary="Metrics for measuring quality" />
                <Tooltip title="View Document">
                  <IconButton edge="end" aria-label="view">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QualityManagement;
