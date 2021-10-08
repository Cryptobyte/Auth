import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import User from '../models/user';
import { limits, sanitize } from '../utils/sec';

// Define an Express Router
const router = express.Router();

router.post('/signup', limits.secure, async(req: Request, res: Response, next: NextFunction) => {
  // Check if username exists, return if not
  if ((!req.body) || (!req.body.username)) {
    return res.status(400).json({
      message: 'username is required'
    });
  }

  // Check if password exists, return if not
  if ((!req.body) || (!req.body.password)) {
    return res.status(400).json({
      message: 'password is required'
    });
  }

  // Sanitize user inputted data
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);

  // Create a user object defined within our model in `src/models/user.ts`
  const user = new User({
    username
  });

  // Call the function register() from `passport-local-mongoose` to register the user
  (User as any).register(user, password, (err: Error, _: any) => {
    if ((err) || !(user)) {
      console.log((err) ? err : 'No User');
      return res.status(500).send({
        error: ((err) && (err.message)) ? err.message : 
          'Internal Server error.'
      });
    }

    // Save the database object, remember this will invoke the middleware
    user.save((uerr) => {
      if (uerr) {
        console.log(uerr);
        return res.status(500).send({
          error: ((uerr) && (uerr.message)) ? uerr.message : 
            'Internal Server error.'
        });
      }

      /*
       * Call passport.authenticate to authenticate the session
       * if you don't include this your user will have to be 
       * authenticated with /signin again before their session is 
       * valid
       */
      passport.authenticate('local', (perr: Error, auth: any) => {
        if (perr || !auth) {
          console.log(perr);
          return res.status(500).send({
            error: ((perr) && (perr.message)) ? perr.message : 
              'Internal Server error.'
          });
        }

        // Login the session with `passport`
        req.logIn(auth, async(lerr: Error) => {
          if (lerr) {
            console.log(lerr);
            return res.status(500).send({
              error: ((lerr) && (lerr.message)) ? lerr.message : 
                'Internal Server error.'
            });
          }

          // We don't need to send these to the client!
          user.hash = undefined;
          user.salt = undefined;

          // Finally, return the user object
          return res.status(200).send({ user });
        });

      })(req, res, next); // WARNING: DO NOT FORGET THIS PART or your auth will not work!
    });
  });
});

router.post('/signin', limits.secure, async(req: Request, res: Response, next: NextFunction) => {
  // Check if username exists, return if not
  if ((!req.body) || (!req.body.username)) {
    return res.status(400).json({
      message: 'username is required'
    });
  }

  // Check if password exists, return if not
  if ((!req.body) || (!req.body.password)) {
    return res.status(400).json({
      message: 'password is required'
    });
  }
  
  // Call passport.authenticate to authenticate the session
  passport.authenticate('local', (err: Error, user: any, info: any) => {
    if ((err) || (!user)) {
      console.log((err) ? err : 'No User');
      return res.status(500).send({
        error: ((err) && (err.message)) ? err.message : 
          'Internal Server error.'
      });
    }

    // Find the user object to provide more information to the client
    User.findById(user._id, (uerr: Error, _: any) => {
      if ((uerr) || (!user)) {
        console.log((uerr) ? uerr : 'No User');
        return res.status(500).send({
          error: ((uerr) && (uerr.message)) ? uerr.message : 
            'Incorrect email or password'
        });
      }

      // Login the session with `passport`
      req.logIn(user, async(lerr: Error) => {
        // We don't need to send these to the client!
        user.hash = undefined;
        user.salt = undefined;
        
        // Finally, return the user object
        return res.status(200).send({ user });
      });
    });

  })(req, res, next); // WARNING: DO NOT FORGET THIS PART or your auth will not work!
});

/**
 * Allow the user to signout of their account
 * this is just a standard GET request to make 
 * it easier to use, we could use POST but it's 
 * not really necessary here
 */
router.get('/signout', (req: Request, res: Response, next: NextFunction) => {
  // Really unhappy with as any :(
  req.logout();

  return res.status(200).send();
});

module.exports = router;
