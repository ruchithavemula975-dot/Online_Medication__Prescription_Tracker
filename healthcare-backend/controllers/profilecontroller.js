import pool from '../config/db.js';

export const completeProfile = async (req, res) => {
  const { userId, role } = req.body;
  let query = '';
  let values = [];

  try {
    if (role === 'PATIENT') {
      const { dob, gender, blood_group, emergency_contact, medical_history } = req.body;
      query = `INSERT INTO patient_profiles 
        (user_id, dob, gender, blood_group, emergency_contact, medical_history)
        VALUES (?, ?, ?, ?, ?, ?)`;
      values = [userId, dob || null, gender, blood_group || null, emergency_contact || null, medical_history || null];
    }

    else if (role === 'DOCTOR') {
      const { specialization, license_number } = req.body;
      query = `INSERT INTO doctor_profiles (user_id, specialization, license_number)
        VALUES (?, ?, ?)`;
      values = [userId, specialization, license_number];
    }

    else if (role === 'PHARMACIST') {
      const { shop_name, shop_license_number, shop_address } = req.body;
      query = `INSERT INTO pharmacist_profiles 
        (user_id, shop_name, shop_license_number, shop_address)
        VALUES (?, ?, ?, ?)`;
      values = [userId, shop_name, shop_license_number, shop_address || null];
    }

    else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await pool.query(query, values);

    res.json({
      success: true,
      message: 'Profile completed successfully',
      redirectTo: '/login'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'License number already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};