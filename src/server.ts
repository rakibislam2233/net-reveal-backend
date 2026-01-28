import colors from 'colors';
import http from 'http';
import app from './app';
import config from './config';
import { closeDB, connectDB } from './config/database.config';
import { emailConfig } from './config/email.config';
import logger from './utils/logger';
import { seedDatabase } from './utils/seed.utils';
import './workers/email.worker';

// Track if shutdown is in progress
let isShuttingDown = false;

// Declare server variable globally
let server: http.Server | null = null;

// ==========================================
// UNCAUGHT EXCEPTION HANDLER
// ==========================================
process.on('uncaughtException', (error: Error) => {
  logger.error(colors.red('💥 UNCAUGHT EXCEPTION! Shutting down...'));
  logger.error(colors.red(`Error: ${error.message}`));
  logger.error(error.stack);

  // Exit immediately on uncaught exception
  process.exit(1);
});

// ==========================================
// START HTTP SERVER
// ==========================================
const startServer = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const port = config.port;

    // Create HTTP server
    server = app.listen(port, config.backend.ip, () => {
      logger.info(colors.green('═══════════════════════════════════════════════════════════'));
      logger.info(colors.green('                 🚀 SERVER STARTED SUCCESSFULLY!            '));
      logger.info(colors.green('═══════════════════════════════════════════════════════════'));
      logger.info(colors.cyan(`📌 Environment      : ${colors.bold(config.env.toUpperCase())}`));
      logger.info(colors.cyan(`🌐 Server URL       : ${colors.bold(config.backend.baseUrl)}`));
      logger.info(colors.cyan(`📍 IP Address       : ${colors.bold(config.backend.ip)}`));
      logger.info(colors.cyan(`🔌 Port             : ${colors.bold(port.toString())}`));
      logger.info(colors.cyan(`⚡ Process ID       : ${colors.bold(process.pid.toString())}`));
      logger.info(
        colors.cyan(
          `💾 Memory Usage     : ${colors.bold(Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB')}`
        )
      );
      logger.info(colors.cyan(`📅 Started At       : ${colors.bold(new Date().toLocaleString())}`));
      logger.info(colors.green('───────────────────────────────────────────────────────────'));

      resolve();
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(colors.red(`❌ Port ${port} is already in use`));
        logger.error(colors.yellow(`💡 Try: lsof -ti:${port} | xargs kill -9`));
      } else if (error.code === 'EACCES') {
        logger.error(colors.red(`❌ Port ${port} requires elevated privileges`));
        logger.error(colors.yellow(`💡 Try: sudo node server.js`));
      } else {
        logger.error(colors.red('❌ Server error:'), error);
      }
      reject(error);
    });

    // Handle client connections
    server.on('connection', socket => {
      socket.setKeepAlive(true);

      socket.on('error', err => {
        logger.error(colors.red('❌ Socket error:'), err);
      });
    });

    // Track active connections for graceful shutdown
    let connections = new Set<any>();

    server.on('connection', conn => {
      connections.add(conn);
      conn.on('close', () => {
        connections.delete(conn);
      });
    });

    (server as any).connections = connections;
  });
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(colors.yellow('⚠️  Shutdown already in progress...'));
    return;
  }

  isShuttingDown = true;

  // Quick shutdown for dev restarts
  const isDevelopmentRestart = signal === 'SIGUSR2' || signal === 'SIGTERM';
  const timeoutDuration = isDevelopmentRestart ? 2000 : 15000;

  if (!isDevelopmentRestart) {
    logger.info(colors.yellow(''));
    logger.info(colors.yellow('═══════════════════════════════════════════════════════════'));
    logger.info(colors.yellow(`         ⚠️  ${signal} RECEIVED - GRACEFUL SHUTDOWN          `));
    logger.info(colors.yellow('═══════════════════════════════════════════════════════════'));
  }

  const shutdownTimeout = setTimeout(() => {
    if (!isDevelopmentRestart) {
      logger.error(colors.red('❌ Forced shutdown due to timeout'));
    }
    process.exit(0);
  }, timeoutDuration);

  try {
    // Step 1: Stop health monitoring
    stopHealthMonitoring();

    // Step 2: Close HTTP Server
    if (server) {
      if (!isDevelopmentRestart) {
        logger.info(colors.cyan('🌐 [2/5] Closing HTTP server...'));
      }

      await new Promise<void>(resolve => {
        server!.close(() => {
          if (!isDevelopmentRestart) {
            logger.info(colors.green('   ✅ HTTP server closed'));
          }
          resolve();
        });
      });

      // Force destroy all connections
      const connections = (server as any).connections;
      if (connections && connections.size > 0) {
        connections.forEach((conn: any) => conn.destroy());
        connections.clear();
      }

      server = null;
    }

    // Step 3: Close Database
    if (!isDevelopmentRestart) {
      logger.info(colors.cyan('🗄️  [3/5] Closing Database..'));
    }
    await closeDB();
    if (!isDevelopmentRestart) {
      logger.info(colors.green('   ✅ Database closed'));
    }


    clearTimeout(shutdownTimeout);

    if (!isDevelopmentRestart) {
      logger.info(colors.green(''));
      logger.info(colors.green('═══════════════════════════════════════════════════════════'));
      logger.info(colors.green('         ✅ SHUTDOWN COMPLETED                              '));
      logger.info(colors.green('═══════════════════════════════════════════════════════════\n'));
    }

    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    if (!isDevelopmentRestart) {
      logger.error(colors.red('❌ Shutdown error:'), error);
    }
    process.exit(1);
  }
};

// ==========================================
// HEALTH CHECK
// ==========================================
const logHealthStats = (): void => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const uptimeMinutes = Math.floor(uptime / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const remainingMinutes = uptimeMinutes % 60;

  logger.info(colors.cyan(''));
  logger.info(colors.cyan('╔═══════════════════════════════════════════════════════════╗'));
  logger.info(colors.cyan('║                    📊 HEALTH CHECK                        ║'));
  logger.info(colors.cyan('╠═══════════════════════════════════════════════════════════╣'));
  logger.info(
    colors.cyan(
      `║ ⏱️  Uptime         : ${colors.bold(`${uptimeHours}h ${remainingMinutes}m`).padEnd(38)}║`
    )
  );
  logger.info(
    colors.cyan(
      `║ 💾 Heap Used      : ${colors.bold(`${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`).padEnd(38)}║`
    )
  );
  logger.info(
    colors.cyan(
      `║ 📦 Heap Total     : ${colors.bold(`${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`).padEnd(38)}║`
    )
  );
  logger.info(
    colors.cyan(
      `║ 🔧 External       : ${colors.bold(`${Math.round(memoryUsage.external / 1024 / 1024)}MB`).padEnd(38)}║`
    )
  );
  logger.info(
    colors.cyan(
      `║ 📊 RSS            : ${colors.bold(`${Math.round(memoryUsage.rss / 1024 / 1024)}MB`).padEnd(38)}║`
    )
  );
  logger.info(
    colors.cyan(`║ ⚡ Process ID     : ${colors.bold(process.pid.toString()).padEnd(38)}║`)
  );
  logger.info(colors.cyan('╚═══════════════════════════════════════════════════════════╝'));
  logger.info(colors.cyan(''));
};

let healthCheckInterval: NodeJS.Timeout | null = null;

const startHealthMonitoring = (intervalMs: number = 60000): void => {
  if (config.env === 'development') {
    healthCheckInterval = setInterval(logHealthStats, intervalMs);
    logger.info(
      colors.magenta(`📊 Health monitoring started (checking every ${intervalMs / 1000} seconds)`)
    );
  }
};

const stopHealthMonitoring = (): void => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    logger.info(colors.yellow('📊 Health monitoring stopped'));
  }
};

// ==========================================
// MAIN APPLICATION INITIALIZATION
// ==========================================
async function main() {
  try {
    logger.info(colors.cyan(''));
    logger.info(colors.cyan('═══════════════════════════════════════════════════════════'));
    logger.info(colors.cyan('                🚀 APPLICATION INITIALIZATION               '));
    logger.info(colors.cyan('═══════════════════════════════════════════════════════════'));

    // Step 1: Connect to Database
    logger.info(colors.cyan('\n📦 [1/5] Connecting to Database...'));
    await connectDB();

    // Seed default data (Admin & Super Admin)
    await seedDatabase();


    // Step 3: Verify Email Service (optional)
    if (config.email.username && config.email.password) {
      logger.info(colors.cyan('📧 [3/5] Verifying email service...'));
      await emailConfig.verifyEmailConnection();
    } else {
      logger.info(colors.yellow('⚠️  [3/5] Email service not configured (skipping)'));
    }

    // Step 4: Start HTTP server (NOW ASYNC)
    logger.info(colors.cyan('🌐 [4/5] Starting HTTP server...\n'));
    await startServer();

    // Step 5: Start health monitoring (development only)
    if (config.env === 'development') {
      logger.info(colors.cyan('\n📊 [5/5] Starting health monitoring...'));
      startHealthMonitoring(60000);
    } else {
      logger.info(colors.cyan('\n⏭️  [5/5] Health monitoring disabled (production mode)'));
    }

    // Log final success message
    logger.info(colors.green(''));
    logger.info(colors.green('═══════════════════════════════════════════════════════════'));
    logger.info(colors.green('            ✅ ALL SYSTEMS OPERATIONAL!                     '));
    logger.info(colors.green('═══════════════════════════════════════════════════════════'));
    logger.info(colors.cyan(`📝 Logs Directory   : ${colors.bold('./logs/')}`));
    logger.info(colors.cyan(`🔧 Environment      : ${colors.bold(config.env.toUpperCase())}`));
    logger.info(colors.cyan(`🎯 Status           : ${colors.bold.green('READY')}`));
    logger.info(colors.cyan(`🌟 Ready to accept requests!`));
    logger.info(colors.green('───────────────────────────────────────────────────────────\n'));
  } catch (error) {
    logger.error(colors.red(''));
    logger.error(colors.red('═══════════════════════════════════════════════════════════'));
    logger.error(colors.red('              ❌ APPLICATION FAILED TO START               '));
    logger.error(colors.red('═══════════════════════════════════════════════════════════'));
    logger.error(colors.red('Error Details:'), error);
    logger.error(colors.red('───────────────────────────────────────────────────────────\n'));

    // Attempt cleanup
    try {
      logger.info(colors.yellow('🧹 Attempting cleanup...'));
      await closeDB();
      logger.info(colors.green('✅ Cleanup completed'));
    } catch (cleanupError) {
      logger.error(colors.red('❌ Cleanup error:'), cleanupError);
    }

    process.exit(1);
  }
}

// Start the application
main();

// ==========================================
// PROCESS EVENT HANDLERS
// ==========================================

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason: any) => {
  logger.error(colors.red('💥 UNHANDLED REJECTION:'), reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// SIGTERM (Production/ts-node-dev restart)
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

// SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

// SIGUSR2 (Nodemon/ts-node-dev restart)
process.on('SIGUSR2', () => {
  gracefulShutdown('SIGUSR2');
});

// SIGHUP (Terminal closed)
process.on('SIGHUP', () => {
  gracefulShutdown('SIGHUP');
});
