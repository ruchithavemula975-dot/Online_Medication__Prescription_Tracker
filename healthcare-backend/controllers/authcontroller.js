import pool from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import jwt from 'jsonwebtoken';
import { getProfileByUserId } from '../models/queries.js';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;

  try {
    // Check if email exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const password_hash = await hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, role, phone || null]
    );

    res.status(201).json({
      success: true,
      userId: result.insertId,
      role,
      redirectTo: '/profile-update'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    // Check profile completion
    const profile = user.role !== 'ADMIN' ? await getProfileByUserId(user.id, user.role) : true;

    let redirectTo = '/profile-update';
    if (user.role === 'ADMIN') redirectTo = '/admin-home';
    else if (user.role === 'PATIENT' && profile) redirectTo = '/patient-home';
    else if (user.role === 'DOCTOR' && profile) redirectTo = '/doctor-home';
    else if (user.role === 'PHARMACIST' && profile) redirectTo = '/pharmacist-home';

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        hasProfile: user.role === 'ADMIN' || !!profile
      },
      redirectTo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    const profile = user.role !== 'ADMIN' ? await getProfileByUserId(user.id, user.role) : true;

    let redirectTo = '/profile-update';
    if (user.role === 'ADMIN') redirectTo = '/admin-home';
    else if (profile) {
      redirectTo = user.role === 'PATIENT' ? '/patient-home' :
                   user.role === 'DOCTOR' ? '/doctor-home' :
                   '/pharmacist-home';
    }

    res.json({
      user,
      hasProfile: user.role === 'ADMIN' || !!profile,
      redirectTo
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};