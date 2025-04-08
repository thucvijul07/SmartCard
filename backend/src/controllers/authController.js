import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { secret } from '../config/jwt.js';

const register = async (req, res) => {
  try {
    const { username, email, password, birthday } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        is_success: false,
        error: 'Email đã được sử dụng' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password_hash,
      birthday,
      role: 0 // Mặc định role là user (0)
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '24h' });

    res.status(201).json({
      is_success: true,
      data: {
        role: user.role,
        avatar_url: user.avatar_url,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ 
      is_success: false,
      error: 'Lỗi server' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        is_success: false,
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        is_success: false,
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '24h' });

    res.json({
      is_success: true,
      data: {
        {role: user.role,
        avatar_url: user.avatar_url,}
        token
      }
    });
  } catch (error) {
    res.status(500).json({ 
      is_success: false,
      error: 'Lỗi server' 
    });
  }
};

export { register, login };  
