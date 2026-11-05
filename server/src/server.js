// server.js
// The entry point. Run with "npm run dev" (auto-restart) or "npm start".
// Order matters: connect to the database first, then accept web requests.

const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const app = require('./app');

async function startServer() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}/api`);
  });

  // Stop cleanly when you press Ctrl+C in the terminal
  const shutdown = async () => {
    console.log('Shutting down...');
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('The server could not start:', error.message);
  console.error('Check that MongoDB is running and that MONGODB_URI in server/.env is correct.');
  process.exit(1);
});
