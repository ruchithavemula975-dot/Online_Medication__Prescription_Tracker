import pool from '../config/db.js';

// Check if profile exists based on role
export const getProfileByUserId = async (userId, role) => {
  let query = '';
  switch (role) {
    case 'PATIENT':
      query = 'SELECT * FROM patient_profiles WHERE user_id = ?';
      break;
    case 'DOCTOR':
      query = 'SELECT * FROM doctor_profiles WHERE user_id = ?';
      break;
    case 'PHARMACIST':
      query = 'SELECT * FROM pharmacist_profiles WHERE user_id = ?';
      break;
    default:
      return null;
  }
  const [rows] = await pool.query(query, [userId]);
  return rows[0] || null;
};