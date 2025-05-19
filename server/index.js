import { env } from './config/index.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sequelize } from '../server/config/index.js';
import { routes } from './routes/router.js';
import { response } from './utils/index.js';
import { messages } from './messages/index.js';

const PORT = env.server.port || process.env.PORT;

// Validate critical environment variables
if (!PORT) {
  console.error('Error: PORT is not defined.');
  process.exit(1);
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use compression middleware
app.use(compression());

// Restrict CORS to trusted domains
const allowedOrigins = [env.frontEndUrl];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(morgan('dev'));

// reduce payload size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// serve static files from environment variables
app.use(
  env.filePaths.relativePath,
  express.static(path.join(__dirname, env.filePaths.staticFilePath))
);

// Routes
app.use('/api', routes);

// Handle 404 errors
app.use((req, res, next) => {
  return response(res, {
    statusCode: 404,
    success: false,
    message: messages.general.NOT_FOUND,
  });
});

// Combined structured error logging and handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Internal Server Error:`, {
    message: err.message,
    stack: err.stack,
  });

  return response(res, {
    statusCode: 500,
    message: messages.general.INTERNAL_SERVER_ERROR,
  });
});

// Sync database and start the server after successful connection
(async () => {
  try {
    // await sequelize.sync({ alter: env.db.alter });
    // await sequelize.sync({ force: env.db.force });

    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ❌ Unable to sync database:`,
      error
    );
    process.exit(1);
  }
})();
