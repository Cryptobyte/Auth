import express, { NextFunction, Request, Response } from 'express';

// Define an Express Router
const router = express.Router();

/**
 * GET /ping
 * 
 * Returns some useful information about the server 
 * such as the server version and if there is an 
 * authenticated user on the current session.
 */
router.get('/ping', (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send({
    authenticated: req.isAuthenticated()
  });
});

// Import our user routes
router.use('/user', require('./user'));

module.exports = router;
