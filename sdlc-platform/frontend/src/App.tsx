import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';
import RequirementList from './pages/requirements/RequirementList';
import TestCaseList from './pages/testcases/TestCaseList';
import DeploymentList from './pages/deployments/DeploymentList';
import WorkflowDashboard from './pages/workflow/WorkflowDashboard';
import QualityManagement from './pages/quality/QualityManagement';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Project Routes */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            {/* Requirement Routes */}
            <Route path="/requirements" element={<RequirementList />} />
            
            {/* Testing Routes */}
            <Route path="/test-cases" element={<TestCaseList />} />
            
            {/* Deployment Routes */}
            <Route path="/deployments" element={<DeploymentList />} />
            
            {/* Workflow Routes */}
            <Route path="/workflow" element={<WorkflowDashboard />} />
            
            {/* Quality Management Routes */}
            <Route path="/quality" element={<QualityManagement />} />
            
            {/* Settings Routes */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
