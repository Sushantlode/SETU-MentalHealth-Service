const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ✅ use Sequelize instance from config/db.js
const sequelize = require('./config/db');

const bookingRoutes = require('./routes/bookingRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const { assessmentRoutes, submissionRoutes } = require('./routes/assessment.routes');
const protectedRoutes = require('./routes/protected.routes');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middleware/errorHandler');
const bookingRoutesWithAuth = require('./routes/bookingRoutes-with-auth');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());

// 🌐 CORS: allow all
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Stress Quantification Device Booking Service is running',
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/bookings', bookingRoutesWithAuth);

app.use('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const syncAlter =
      process.env.DB_SYNC_ALTER === 'true' ||
      (NODE_ENV !== 'production' && process.env.DB_SYNC_ALTER !== 'false');

    if (syncAlter) {
      console.log('⚠️  Running sequelize.sync({ alter: true })');
      await sequelize.sync({ alter: true });
    } else {
      console.log('ℹ️  Running sequelize.sync() (no alter)');
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📍 Health:               http://localhost:${PORT}/health`);
      console.log(`📍 Bookings:             http://localhost:${PORT}/api/bookings`);
      console.log(`📍 Time Slots:           http://localhost:${PORT}/api/time-slots`);
      console.log(`📍 Assessments:          http://localhost:${PORT}/api/v1/assessments`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down server...`);
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

module.exports = app;
