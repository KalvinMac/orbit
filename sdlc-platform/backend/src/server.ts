import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { logger } from './utils/logger';
import { UserResolver } from './resolvers/UserResolver';
import { ProjectResolver } from './resolvers/ProjectResolver';
import { WorkflowResolver } from './resolvers/WorkflowResolver';
import { RequirementResolver } from './resolvers/RequirementResolver';
import { TestCaseResolver } from './resolvers/TestCaseResolver';
import { DeploymentResolver } from './resolvers/DeploymentResolver';
import { OKRResolver } from './resolvers/OKRResolver';
import { AllocationResolver } from './resolvers/AllocationResolver';
import { DVFResolver } from './resolvers/DVFResolver';
import { NotificationResolver } from './resolvers/NotificationResolver';
import { SettingsResolver } from './resolvers/SettingsResolver';
import { SearchResolver } from './resolvers/SearchResolver';
import { QualityResolver } from './resolvers/QualityResolver';
import { ActivityLogResolver } from './resolvers/ActivityLogResolver';
import { AppDataSource } from './config/data-source';
import { AuthService } from './services/AuthService';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Create Express app
    const app = express();

    // Initialize Auth Service
    const authService = new AuthService();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // SSO Routes
    app.get('/auth/login/:provider', (req, res) => {
      try {
        const { provider } = req.params;
        const p = authService.getProvider(provider);
        const url = p.getAuthUrl();
        res.redirect(url);
      } catch (e: any) {
        res.status(400).send(e.message);
      }
    });

    app.get('/auth/callback/:provider', async (req, res) => {
      try {
        const { provider } = req.params;
        const { code } = req.query;
        if (!code) throw new Error('No code provided');

        const { token } = await authService.handleSSOCallback(provider, code as string);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/sso-callback?token=${token}`);
      } catch (e: any) {
        logger.error('SSO Error:', e);
        res.status(401).send('Login failed: ' + e.message);
      }
    });

    // Create GraphQL server
    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver, ProjectResolver, WorkflowResolver, RequirementResolver, TestCaseResolver, DeploymentResolver, OKRResolver, AllocationResolver, DVFResolver, NotificationResolver, SettingsResolver, SearchResolver, QualityResolver, ActivityLogResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });

    await server.start();
    server.applyMiddleware({ app: app as any, cors: false });

    // Health check endpoint
    app.get('/health', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
