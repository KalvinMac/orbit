# SDLC Management Platform

A comprehensive web/mobile-friendly application for managing the complete Software Development Lifecycle (SDLC) with integrated Quality Management System (QMS) capabilities, designed for digital organizations that build software solutions using a disciplined, auditable, and measurable SDLC process.

## Overview

This platform implements the five-phase Product Engineering Workflow and Quality Management Workflow to ensure traceability, auditability, and reliability throughout all SDLC phases. It supports integration with popular SDLC tools and provides comprehensive observability and monitoring features.

![SDLC Platform](./docs/screenshots/sdlc-dashboard.png)

## Product Engineering Workflow

The platform implements a disciplined five-phase workflow:

### Phase 1: Strategic Planning and Inception
- Project Definition
- Threat Modeling
- DFT Creation
- Project Risk/Issues Assessment
- Regulatory Assessment
- Requirements Engineering
- Resource and Budget Planning
- Traceability Matrix Creation

### Phase 2: Architecture and System Design
- Formal Architecture Development
- Module Design with Feature Signoffs
- Interface Design
- UI Design
- Data & UX Data Privacy Design
- Security Design and Threat Modeling
- Observability Design
- FMEA Analysis and Design

### Phase 3: Implementation and Construction
- Environment Set-up
- Code Implementation
- CI/CD Pipelines
- Automated Unit and Integration Testing
- Build Merge Analysis on Code Integration
- Observability and Operational Environment Implementation

### Phase 4: Comprehensive Testing and Validation
- Unit Directive Testing
- System E2E Testing
- Critical Workflow Testing
- Regulatory Validation
- Security Testing
- Data Validation

### Phase 5: Deployment and Operational Readiness
- Training and Service Readiness
- Release Plan for Internal Field
- Production Monitoring
- Metric Recording and Improvement Ops
- Deployment State Mapping

## Quality Management Workflow

The platform implements a five-phase quality management workflow:

1. **Building Phase**
   - Design Inputs
   - Trace

2. **QA Phase**
   - Architecture and Patterns Spec
   - Integration Document
   - TTP

3. **UAT Phase**
   - Acceptance Test Plan and Scripts

4. **SQA/SQCT Phase**
   - Test Case
   - Test Reports
   - GXP

5. **Environment Record Phase**
   - DVSRS
   - URS Records

## Technical Architecture

### Frontend

- **React.js with TypeScript**: For building a robust and type-safe UI
- **Material-UI**: For consistent and responsive design components
- **React Router**: For client-side routing
- **React Query**: For data fetching and state management
- **Context API**: For global state management

### Backend

- **Node.js with Express**: For a robust API server
- **TypeScript**: For type safety and improved developer experience
- **GraphQL & RESTful APIs**: For flexible data querying
- **TypeORM**: For database interactions
- **JWT Authentication**: For secure user authentication

### Database

- **PostgreSQL**: For reliable relational data storage
- **Database Migrations**: For versioned schema changes

### DevOps & Infrastructure

- **Docker**: For containerization
- **Kubernetes**: For container orchestration
- **GitLab CI/CD Pipeline**: For automated testing and deployment
- **Monitoring & Logging**: For system observability

## Key Features

1. **Comprehensive SDLC Management**
   - Full traceability from requirements to deployment
   - Integrated quality management
   - Regulatory compliance support

2. **User Role-Based Access Control**
   - Project managers, architects, developers, testers, operations
   - Custom role definitions
   - Fine-grained permissions

3. **Integration Capabilities**
   - Jira, Confluence integration
   - CI/CD pipeline integration
   - Code analysis tool integration
   - Test automation suite integration

4. **Documentation Management**
   - Version-controlled documentation
   - Automated artifact generation
   - Audit trail for all documentation changes

5. **Observability & Metrics**
   - Project health dashboards
   - Quality metrics tracking
   - Performance monitoring
   - Compliance reporting

6. **Mobile-Friendly Interface**
   - Responsive design for all device sizes
   - Touch-optimized interfaces
   - Offline capabilities for field operations

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env files from examples
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit the .env files with your configuration
   ```

4. Run database migrations:
   ```bash
   cd backend
   npm run migration:run
   ```

5. Run the application:
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # Start frontend (in a new terminal)
   cd ../frontend
   npm start
   ```

### Deployment

#### Local Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

#### GitLab CI/CD Deployment

This project uses GitLab CI/CD for automated testing, building, and deployment. The pipeline configuration is defined in `.gitlab-ci.yml` and includes:

1. **Test Stage**
   - Runs unit and integration tests for both frontend and backend
   - Performs code linting

2. **Build Stage**
   - Builds Docker images for frontend and backend
   - Pushes images to GitLab Container Registry

3. **Deploy Stage**
   - Deploys to staging environment automatically on `main` branch
   - Manual deployment to production when tags are created
   
To use this pipeline, ensure the following GitLab CI/CD variables are set:

- `KUBE_CONFIG`: Kubernetes configuration for deployment
- `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`: GitLab container registry credentials

## Usage Guide

1. **Login with your credentials**
   - Default admin: admin@example.com / password

2. **Dashboard**
   - View project status and key metrics
   - Access workflow phases and quality management

3. **Project Management**
   - Create and manage projects
   - Track project progress
   - Assign team members

4. **Workflow Management**
   - Navigate through SDLC phases
   - Complete phase tasks
   - Track workflow progress

5. **Quality Management**
   - Track QMS deliverables
   - Generate compliance reports
   - Monitor quality metrics

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact the project team at sdlc-platform@example.com.

