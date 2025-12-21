import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Stack,
  InputAdornment,
  CircularProgress,
  Container,
  styled,
  useTheme,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  CreditCard as BillingIcon,
  IntegrationInstructions as IntegrationsIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Add as AddIcon,
  GitHub,
  Storage,
} from '@mui/icons-material';

// GraphQL Queries & Mutations
const GET_USERS = gql`
  query GetUsersForSettings {
    users {
      id
      firstName
      lastName
      email
      isAdmin
    }
  }
`;

const GET_SETTINGS = gql`
  query GetOrganizationSettings {
    getOrganizationSettings {
      id
      name
      domain
      supportEmail
      technicalContact
      logoUrl
      integrations {
        github
        jira
        slack
        aws
      }
      security {
        twoFactorAuth
        sso
        passwordPolicy
      }
      notifications {
        emailDeployment
        emailBug
        weeklyReport
      }
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateOrganizationSettings($input: OrganizationSettingsInput!) {
    updateOrganizationSettings(input: $input) {
      id
      name
      domain
      supportEmail
      technicalContact
      logoUrl
      integrations {
        github
        jira
        slack
        aws
      }
      security {
        twoFactorAuth
        sso
        passwordPolicy
      }
      notifications {
        emailDeployment
        emailBug
        weeklyReport
      }
    }
  }
`;

// Styled Components for Cleaner Navigation
const SidebarTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  minWidth: 260,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    left: 0,
    width: 3,
    right: 'auto',
  },
}));

const NavigationTab = styled(Tab)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'left',
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 2), // Add margin for spacing
  minHeight: 48,
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected, // Light background for active
    fontWeight: 600,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiTab-iconWrapper': {
    marginRight: theme.spacing(2),
  },
}));


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4, animation: 'fadeIn 0.3s ease' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Queries
  const { data: userData, loading: userLoading } = useQuery(GET_USERS);
  const { data: settingsData, loading: settingsLoading } = useQuery(GET_SETTINGS);

  // Mutation
  const [updateSettings, { loading: updating }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: () => {
      setShowSuccess(true);
    }
  });

  // State
  const [orgSettings, setOrgSettings] = useState({
    name: '',
    domain: '',
    supportEmail: '',
    technicalContact: '',
    logoUrl: ''
  });

  const [integrations, setIntegrations] = useState({
    github: false,
    jira: false,
    slack: false,
    aws: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sso: false,
    passwordPolicy: true
  });

  const [notifications, setNotifications] = useState({
    emailDeployment: true,
    emailBug: true,
    weeklyReport: false
  });

  // Populate state when data loads
  useEffect(() => {
    if (settingsData?.getOrganizationSettings) {
      const s = settingsData.getOrganizationSettings;
      setOrgSettings({
        name: s.name,
        domain: s.domain,
        supportEmail: s.supportEmail,
        technicalContact: s.technicalContact,
        logoUrl: s.logoUrl || ''
      });
      // Handle potential nulls from backend if not initialized (though resolver handles defaults)
      if (s.integrations) setIntegrations(s.integrations);
      if (s.security) setSecurity(s.security);
      if (s.notifications) setNotifications(s.notifications);
    }
  }, [settingsData]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOrgChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrgSettings({ ...orgSettings, [prop]: event.target.value });
  };

  const handleIntegrationToggle = (key: string) => {
    setIntegrations((prev) => {
      const newState = { ...prev, [key]: !prev[key as keyof typeof prev] };
      saveChanges({ integrations: newState });
      return newState;
    });
  };

  const handleSecurityToggle = (key: string) => {
    setSecurity((prev) => {
      const newState = { ...prev, [key]: !prev[key as keyof typeof prev] };
      saveChanges({ security: newState });
      return newState;
    });
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications((prev) => {
      const newState = { ...prev, [key]: !prev[key as keyof typeof prev] };
      saveChanges({ notifications: newState });
      return newState;
    });
  };

  const saveChanges = (partialInput: any = {}) => {
    // Construct full input from current state + partial updates
    const input = {
      name: orgSettings.name,
      domain: orgSettings.domain,
      supportEmail: orgSettings.supportEmail,
      technicalContact: orgSettings.technicalContact,
      logoUrl: orgSettings.logoUrl,
      integrations: integrations,
      security: security,
      notifications: notifications,
      ...partialInput
    };

    // Remove __typename if present (from Apollo)
    const cleanInput = JSON.parse(JSON.stringify(input));
    delete cleanInput.__typename;
    if (cleanInput.integrations) delete cleanInput.integrations.__typename;
    if (cleanInput.security) delete cleanInput.security.__typename;
    if (cleanInput.notifications) delete cleanInput.notifications.__typename;

    updateSettings({ variables: { input: cleanInput } });
  };

  if (userLoading || settingsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization, team, and preferences.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          minHeight: 650,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ bgcolor: theme.palette.grey[50], borderRight: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold">
              MENU
            </Typography>
          </Box>
          <SidebarTabs
            orientation="vertical"
            variant="scrollable"
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Settings tabs"
          >
            <NavigationTab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="General" />
            <NavigationTab icon={<GroupIcon fontSize="small" />} iconPosition="start" label="Team Members" />
            <NavigationTab icon={<IntegrationsIcon fontSize="small" />} iconPosition="start" label="Integrations" />
            <NavigationTab icon={<BillingIcon fontSize="small" />} iconPosition="start" label="Billing & Usage" />
            <NavigationTab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security" />
            <NavigationTab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="Notifications" />
          </SidebarTabs>
        </Box>

        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', overflowY: 'auto' }}>

          {/* General Settings */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Organization Profile</Typography>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <TextField
                    label="Organization Name"
                    fullWidth
                    value={orgSettings.name}
                    onChange={handleOrgChange('name')}
                    variant="outlined"
                  />
                  <TextField
                    label="Custom Domain"
                    fullWidth
                    value={orgSettings.domain}
                    onChange={handleOrgChange('domain')}
                    InputProps={{ startAdornment: <InputAdornment position="start">https://</InputAdornment> }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Support Email"
                        fullWidth
                        value={orgSettings.supportEmail}
                        onChange={handleOrgChange('supportEmail')}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Technical Contact"
                        fullWidth
                        value={orgSettings.technicalContact}
                        onChange={handleOrgChange('technicalContact')}
                      />
                    </Grid>
                  </Grid>
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      onClick={() => saveChanges()}
                      disabled={updating}
                      sx={{ px: 4, py: 1 }}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar
                      variant="rounded"
                      src={orgSettings.logoUrl}
                      sx={{
                        width: 'auto',
                        maxWidth: '100%',
                        height: 80,
                        margin: '0 auto',
                        bgcolor: 'transparent',
                        fontSize: 32,
                        mb: 2,
                        color: 'primary.main',
                        '& .MuiAvatar-img': {
                          objectFit: 'contain'
                        }
                      }}
                    >
                      {orgSettings.name?.charAt(0) || 'O'}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Organization Logo</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Enter a URL for your logo.
                    </Typography>
                    <TextField
                      label="Logo URL"
                      fullWidth
                      size="small"
                      value={orgSettings.logoUrl}
                      onChange={handleOrgChange('logoUrl')}
                      placeholder="https://example.com/logo.png"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          {/* ... (Rest of TabPanels) */}

          {/* Team Members */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Team Members</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>Invite Member</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
              {userData?.users.map((user: any) => (
                <ListItem key={user.id} divider sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName} {user.id === '1' && <Chip label="YOU" size="small" sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} />}
                      </Typography>
                    }
                    secondary={user.email}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={user.isAdmin ? 'ADMIN' : 'MEMBER'}
                      size="small"
                      color={user.isAdmin ? 'primary' : 'default'}
                      variant={user.isAdmin ? 'filled' : 'outlined'}
                    />
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Integrations */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Connected Apps</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connect your workspace with third-party tools to automate your workflow.
            </Typography>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ transition: '0.3s', '&:hover': { boxShadow: 2 } }}>
                  <CardHeader
                    avatar={<GitHub fontSize="large" />}
                    action={<Switch checked={integrations.github} onChange={() => handleIntegrationToggle('github')} />}
                    title={<Typography variant="subtitle1" fontWeight="bold">GitHub</Typography>}
                    subheader="Sync repositories, commits, and pull requests."
                  />
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ transition: '0.3s', '&:hover': { boxShadow: 2 } }}>
                  <CardHeader
                    avatar={<Storage fontSize="large" sx={{ color: '#0052CC' }} />}
                    action={<Switch checked={integrations.jira} onChange={() => handleIntegrationToggle('jira')} />}
                    title={<Typography variant="subtitle1" fontWeight="bold">Jira Software</Typography>}
                    subheader="Import issues and sync status updates bi-directionally."
                  />
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ transition: '0.3s', '&:hover': { boxShadow: 2 } }}>
                  <CardHeader
                    avatar={<Box component="span" sx={{ fontSize: 30, fontWeight: 'bold' }}>#</Box>}
                    action={<Switch checked={integrations.slack} onChange={() => handleIntegrationToggle('slack')} />}
                    title={<Typography variant="subtitle1" fontWeight="bold">Slack</Typography>}
                    subheader="Receive notifications and alerts in your team channels."
                  />
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Billing */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Subscription & Usage</Typography>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50', borderColor: 'primary.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">CURRENT PLAN</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">Enterprise</Typography>
                      <Typography variant="h5">$99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography></Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                      Next billing date: January 1, 2026
                    </Typography>
                    <Button variant="contained" color="primary">Manage Subscription</Button>
                  </CardContent>
                </Card>
                {/* Usage limits */}
                <Typography variant="subtitle2" gutterBottom>Usage Limits</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Projects</Typography>
                    <Typography variant="body2" fontWeight="bold">8 / 20</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={40} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Storage</Typography>
                    <Typography variant="body2" fontWeight="bold">45GB / 1TB</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={4.5} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Security Settings</Typography>
            <Divider sx={{ mb: 4 }} />

            <List>
              <ListItem divider>
                <ListItemText primary="Two-Factor Authentication (2FA)" secondary="Require all users to use 2FA." />
                <ListItemSecondaryAction>
                  <Switch checked={security.twoFactorAuth} onChange={() => handleSecurityToggle('twoFactorAuth')} />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Single Sign-On (SSO)" secondary="Enable SAML/OIDC authentication." />
                <ListItemSecondaryAction>
                  <Switch checked={security.sso} onChange={() => handleSecurityToggle('sso')} />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Password Policy" secondary="Enforce strong passwords for local accounts." />
                <ListItemSecondaryAction>
                  <Switch checked={security.passwordPolicy} onChange={() => handleSecurityToggle('passwordPolicy')} />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          {/* Notifications */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Notification Preferences</Typography>
            <Divider sx={{ mb: 4 }} />

            <FormControlLabel
              control={<Switch checked={notifications.emailDeployment} onChange={() => handleNotificationToggle('emailDeployment')} />}
              label="Email me for failed deployments"
              sx={{ display: 'block', mb: 2 }}
            />
            <FormControlLabel
              control={<Switch checked={notifications.emailBug} onChange={() => handleNotificationToggle('emailBug')} />}
              label="Email me for critical bug reports"
              sx={{ display: 'block', mb: 2 }}
            />
            <FormControlLabel
              control={<Switch checked={notifications.weeklyReport} onChange={() => handleNotificationToggle('weeklyReport')} />}
              label="Weekly Summary Reports"
              sx={{ display: 'block', mb: 2 }}
            />
          </TabPanel>

        </Box>
      </Paper>
      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
