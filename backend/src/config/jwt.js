import dotenv from 'dotenv';

dotenv.config();

export const secret = process.env.JWT_SECRET || 'your-secret-key';
export const expiresIn = '24h'; 