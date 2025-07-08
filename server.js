import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import passport from 'passport';
import session from 'express-session';
import connectDB from './config/db.js';
import './config/passport.js'; // Import passport config

// Connect to database
connectDB();

// Route files
import items from './routes/items.js';
import users from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js'
import shareRoutes from './routes/shareRoutes.js';
import lockCheckRoutes from './routes/lockCheckRoutes.js';

const app = express();

// Body parser
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Mount routers
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

import errorHandler from './utils/errorHandler.js';


app.use('/api/v1/users', users);
app.use('/api/v1/folders', folderRoutes);
app.use('/api/v1/file',fileRoutes);
app.use('/api/v1/share', shareRoutes);
app.use('/api/v1/protect', lockCheckRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});