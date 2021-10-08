import express, { NextFunction, Request, Response } from 'express';

export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  /*
   * If the user is authenticated we can allow the 
   * next function to run by manually calling it 
   */
  if (req.isAuthenticated()) {
    return next();
  }

  /*
   * If we get here we know that the user is not 
   * authenticated so we can reject the request 
   * with 401 - Unauthorized
   */
  return res.status(401).send({
    error: 'Authorization Required.'
  });
};
