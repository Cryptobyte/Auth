import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import passport from 'passport';

import User from './models/user';

import { limits } from './utils/sec';

// Load our .env file 
dotenv.config();

// Create an ExpressJS app instance
const app = express();

// Initialize Helmet with all defaults
app.use(helmet());

// Setup express to accept JSON body data
app.use(express.json());

// Setup cookie sessions
app.use(cookieSession({
  // Expire in 24 hours
  maxAge: 24 * 60 * 60 * 1000,

  // Standard name for session cookie
  name: 'session',

  // Make sure this is random
  secret: 'b48abe42-5045-4739-8382-78db26c5da3f'
}));

// Setup Passport 
app.use(passport.initialize());
app.use(passport.session());

passport.use((User as any).createStrategy());
passport.serializeUser((User as any).serializeUser());
passport.deserializeUser((User as any).deserializeUser());

// Mount our routes at /api
app.use('/api', limits.default, require('./routes'));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE);
mongoose.connection.on('connected', () => {
  // Wait to make the ExpressJS app live until MongoDB is connected
  app.listen(3000, () => {
    return console.log(`Server is Listening!`, {
      root: 'http://localhost:3000'
    });
  });
});

// Listen for MongoDB errors
mongoose.connection.on('error', (err) => {
  console.error('Database Connection Error', err);
});

// Listen for MongoDB disconnections
mongoose.connection.on('disconnected', () => {
  console.error('Database Disconnected');
});
