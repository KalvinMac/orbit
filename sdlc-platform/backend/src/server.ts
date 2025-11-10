import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { logger } from './utils/logger';
import { UserResolver } from './resolvers/UserResolver';
import { ProjectResolver } from './resolvers/ProjectResolver';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Initialize database connection
    await createConnection();
    logger.info('Database connection established');

    // Create Express app
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Create GraphQL server
    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver, ProjectResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });

    await server.start();
    server.applyMiddleware({ app, cors: false });

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
