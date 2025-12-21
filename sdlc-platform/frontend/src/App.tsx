import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';
import RequirementList from './pages/requirements/RequirementList';
import TestCaseList from './pages/testcases/TestCaseList';
import DeploymentList from './pages/deployments/DeploymentList';
import DVFList from './pages/dvf/DVFList';
import DVFDetails from './pages/dvf/DVFDetails';
import DVFForm from './pages/dvf/DVFForm';
import WorkflowDashboard from './pages/workflow/WorkflowDashboard';
import WorkflowEditor from './pages/workflow/WorkflowEditor';
import TaskEdit from './pages/workflow/TaskEdit';
import PlanningPhase from './pages/workflow/PlanningPhase';
import ArchitecturePhase from './pages/workflow/ArchitecturePhase';
import ImplementationPhase from './pages/workflow/ImplementationPhase';
import TestingPhase from './pages/workflow/TestingPhase';
import DeploymentPhase from './pages/workflow/DeploymentPhase';
import QualityManagement from './pages/quality/QualityManagement';
import BuildingPhase from './pages/quality/BuildingPhase';
import QA from './pages/quality/QA';
import UAT from './pages/quality/UAT';
import SQASQCT from './pages/quality/SQASQCT';
import EnvironmentRecord from './pages/quality/EnvironmentRecord';
import NewDeliverable from './pages/quality/NewDeliverable';
import ViewDeliverable from './pages/quality/deliverable/ViewDeliverable';
import CreateDeliverable from './pages/quality/deliverable/CreateDeliverable';
import QualityPlan from './pages/quality/docs/QualityPlan';
import Standards from './pages/quality/docs/Standards';
import Metrics from './pages/quality/docs/Metrics';
import TeamList from './pages/team/TeamList';
import TeamCapacityDashboard from './pages/team/TeamCapacityDashboard';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SSOCallback from './pages/auth/SSOCallback';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OKRDashboard from './pages/okr/OKRDashboard';
import ActivityList from './pages/activities/ActivityList';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sso-callback" element={<SSOCallback />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            {/* OKR Routes */}
            <Route path="/okr" element={<OKRDashboard />} />

            {/* Project Routes */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />

            {/* Requirement Routes */}
            <Route path="/requirements" element={<RequirementList />} />

            {/* Testing Routes */}
            <Route path="/test-cases" element={<TestCaseList />} />

            {/* Deployment Routes */}
            <Route path="/deployments" element={<DeploymentList />} />

            {/* DVF Routes */}
            <Route path="/dvfs" element={<DVFList />} />
            <Route path="/dvfs/new" element={<DVFForm />} />
            <Route path="/dvfs/:id/edit" element={<DVFForm />} />
            <Route path="/dvfs/:id" element={<DVFDetails />} />

            {/* Workflow Routes */}
            <Route path="/workflow" element={<WorkflowDashboard />} />
            <Route path="/workflow/:phaseId/task/:taskId/edit" element={<TaskEdit />} />
            <Route path="/projects/:projectId/workflow-editor" element={<WorkflowEditor />} />
            <Route path="/workflow/planning" element={<PlanningPhase />} />
            <Route path="/workflow/architecture" element={<ArchitecturePhase />} />
            <Route path="/workflow/implementation" element={<ImplementationPhase />} />
            <Route path="/workflow/testing" element={<TestingPhase />} />
            <Route path="/workflow/deployment" element={<DeploymentPhase />} />

            {/* Quality Management Routes */}
            <Route path="/quality" element={<QualityManagement />} />
            <Route path="/quality/building-phase" element={<BuildingPhase />} />
            <Route path="/quality/qa" element={<QA />} />
            <Route path="/quality/uat" element={<UAT />} />
            <Route path="/quality/sqa-sqct" element={<SQASQCT />} />
            <Route path="/quality/environment" element={<EnvironmentRecord />} />
            <Route path="/quality/new-deliverable" element={<NewDeliverable />} />
            <Route path="/quality/deliverable/:id" element={<ViewDeliverable />} />
            <Route path="/quality/deliverable/:id/create" element={<CreateDeliverable />} />
            <Route path="/quality/docs/quality-plan" element={<QualityPlan />} />
            <Route path="/quality/docs/standards" element={<Standards />} />
            <Route path="/quality/docs/metrics" element={<Metrics />} />

            {/* Team Routes */}
            <Route path="/team" element={<TeamList />} />
            <Route path="/team/capacity" element={<TeamCapacityDashboard />} />

            {/* Settings Routes */}
            <Route path="/settings" element={<Settings />} />

            {/* Activity Routes */}
            <Route path="/activities" element={<ActivityList />} />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
