import rateLimit from 'express-rate-limit';
import mongoStore from 'rate-limit-mongo';

// Common rate limit storage
const store = new mongoStore({
  collectionName: 'rates',
  uri: process.env.DATABASE || 'mongodb://localhost:27017/Auth'
});

export const sanitize = (v: any): any => {
  if (v instanceof Object) {
    for (const key in v) {
      if (/^\$/.test(key)) {
        delete v[key];

      } else {
        sanitize(v[key]);
      }
    }
  }

  return v;
};

export const limits = {
  // 450 requests per minute per ip
  default: rateLimit({
    max: 450,
    store,
    windowMs: 1 * 60 * 1000
  }),
  
  // 250 requests per minute per ip
  secure: rateLimit({
    max: 250,
    store,
    windowMs: 1 * 60 * 1000
  })
};
