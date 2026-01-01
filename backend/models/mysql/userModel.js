const db = require('../../config/mysql-database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create new user
  static async create(userData) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    
    const params = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.role || 'user'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = true';
    const rows = await db.query(sql, [username]);
    return rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = true';
    const rows = await db.query(sql, [email]);
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = ?';
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await db.query(sql, [userId]);
  }

  // Get all users
  static async findAll() {
    const sql = `
      SELECT id, username, email, role, is_active, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `;
    return await db.query(sql);
  }

  // Update user
  static async update(id, userData) {
    const fields = [];
    const params = [];
    
    if (userData.email) {
      fields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.role) {
      fields.push('role = ?');
      params.push(userData.role);
    }
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      fields.push('password = ?');
      params.push(hashedPassword);
    }
    if (typeof userData.is_active !== 'undefined') {
      fields.push('is_active = ?');
      params.push(userData.is_active);
    }
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
