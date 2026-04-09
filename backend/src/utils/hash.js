import crypto from 'crypto';

export const sha256 = (payload) =>
  crypto.createHash('sha256').update(payload).digest('hex');

