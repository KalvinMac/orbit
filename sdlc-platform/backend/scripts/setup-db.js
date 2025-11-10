const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_USERNAME = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_NAME = 'sdlc_platform',
} = process.env;

// Configuration for connecting to PostgreSQL server
const serverConfig = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USERNAME,
  password: DB_PASSWORD,
};

async function setupDatabase() {
  // Create a client to connect to PostgreSQL server
  const serverClient = new Client(serverConfig);

  try {
    // Connect to the PostgreSQL server
    await serverClient.connect();
    console.log('Connected to PostgreSQL server');

    // Check if the database already exists
    const checkDbResult = await serverClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );

    if (checkDbResult.rows.length === 0) {
      // Create the database if it doesn't exist
      console.log(`Creating database ${DB_NAME}...`);
      await serverClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Database ${DB_NAME} created successfully`);
    } else {
      console.log(`Database ${DB_NAME} already exists`);
    }

    // Disconnect from the PostgreSQL server
    await serverClient.end();
    console.log('Disconnected from PostgreSQL server');

    // Connect to the newly created database to create extensions if needed
    const dbConfig = {
      ...serverConfig,
      database: DB_NAME,
    };
    const dbClient = new Client(dbConfig);
    await dbClient.connect();
    console.log(`Connected to database ${DB_NAME}`);

    // Create any necessary extensions
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('Created extension uuid-ossp');

    // Disconnect from the database
    await dbClient.end();
    console.log(`Disconnected from database ${DB_NAME}`);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
