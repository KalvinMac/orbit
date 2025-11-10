import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  FormControlLabel,
  Checkbox,
  Grid,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setLoginError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          SDLC Platform - Sign In
        </Typography>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 3,
            width: '100%',
          }}
        >
          {loginError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loginError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © SDLC Platform '}
            {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
