import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

const validateRegister = [
    body('username').notEmpty().withMessage('Tên người dùng không được để trống'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('birthday').isISO8601().withMessage('Ngày sinh không hợp lệ'),
];

router.post('/register', validateRegister, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            is_success: false,
            error: errors.array() 
        });
    }
    next(); 
}, register);

router.post('/login', login);

export default router;  