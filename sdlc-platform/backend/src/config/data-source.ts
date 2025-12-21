import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Requirement } from '../entities/Requirement';
import { TestCase } from '../entities/TestCase';
import { TestRun } from '../entities/TestRun';
import { Deployment } from '../entities/Deployment';
import { WorkflowPhase } from '../entities/WorkflowPhase';
import { WorkflowTask } from '../entities/WorkflowTask';
import { QualityManagement } from '../entities/QualityManagement';
import { StrategicGoal } from '../entities/StrategicGoal';
import { Objective } from '../entities/Objective';
import { KeyResult } from '../entities/KeyResult';
import { ProjectAllocation } from '../entities/ProjectAllocation';
import { DVF } from '../entities/DVF';
import { Notification } from '../entities/Notification';
import { OrganizationSettings } from '../entities/OrganizationSettings';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sdlc_platform',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project, Requirement, TestCase, TestRun, Deployment, WorkflowPhase, WorkflowTask, QualityManagement, StrategicGoal, Objective, KeyResult, ProjectAllocation, DVF, Notification, OrganizationSettings],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

export default AppDataSource;
