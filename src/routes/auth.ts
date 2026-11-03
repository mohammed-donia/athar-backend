import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';
import { loginBody, registerBody } from '../lib/validation.js';
import { requireAuth, uid } from '../middleware/auth.js';
import { User, type IUser } from '../models/User.js';

export const authRouter = Router();

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'محاولات كثيرة، جرّب بعد شوي' },
});

function signToken(userId: string): string {
  return jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

function publicUser(u: Pick<IUser, '_id' | 'name' | 'email'>) {
  return { id: u._id.toString(), name: u.name, email: u.email };
}

authRouter.post('/register', authLimiter, async (req, res) => {
  const { name, email, password } = registerBody.parse(req.body);

  if (await User.exists({ email })) {
    throw new HttpError(409, 'هالإيميل مسجّل من قبل');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const { email, password } = loginBody.parse(req.body);

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok) {
    throw new HttpError(401, 'الإيميل أو كلمة السر غير صحيحة');
  }

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(uid(req));
  if (!user) throw new HttpError(401, 'الحساب غير موجود');
  res.json({ user: publicUser(user) });
});
