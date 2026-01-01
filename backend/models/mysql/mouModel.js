const db = require('../../config/mysql-database');

class MOUModel {
  // Create new MOU
  static async create(mouData, userId) {
    const sql = `
      INSERT INTO mous (
        mou_id, institute, contact_person, email, phone, address,
        faculty, department, academic_year, start_date, duration,
        expiry_date, purpose, expected_outcome, signed_document,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      mouData.mouId,
      mouData.institute,
      mouData.contactPerson,
      mouData.email,
      mouData.phone,
      mouData.address,
      mouData.faculty,
      mouData.department,
      mouData.academicYear,
      mouData.startDate,
      mouData.duration,
      mouData.expiryDate,
      mouData.purpose,
      mouData.expectedOutcome,
      mouData.signedDocument,
      userId
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // Get all MOUs with pagination
  static async findAll(page = 1, limit = 50, filters = {}) {
    try {
      let sql = `
        SELECT m.*, u.username as created_by_username
        FROM mous m
        LEFT JOIN users u ON m.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters
      if (filters.status) {
        sql += ' AND m.status = ?';
        params.push(filters.status);
      }
      
      if (filters.faculty) {
        sql += ' AND m.faculty = ?';
        params.push(filters.faculty);
      }
      
      if (filters.academicYear) {
        sql += ' AND m.academic_year = ?';
        params.push(filters.academicYear);
      }
      
      if (filters.search) {
        sql += ' AND (m.institute LIKE ? OR m.contact_person LIKE ? OR m.mou_id LIKE ?)';
        const searchParam = `%${filters.search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Count total
      const countSql = sql.replace('SELECT m.*, u.username as created_by_username', 'SELECT COUNT(*) as total');
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      // Add pagination
      sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      console.log('Pagination params:', { limit: limitNum, offset: offsetNum, paramsLength: params.length });
      params.push(limitNum, offsetNum);

      const rows = await db.query(sql, params);
      
      return {
        mous: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('MOUModel.findAll error:', error);
      throw error;
    }
  }

  // Get MOU by ID
  static async findById(id) {
    const sql = `
      SELECT m.*, u.username as created_by_username
      FROM mous m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // Get MOU by mouId (unique identifier)
  static async findByMouId(mouId) {
    const sql = `
      SELECT m.*, u.username as created_by_username
      FROM mous m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.mou_id = ?
    `;
    const rows = await db.query(sql, [mouId]);
    return rows[0] || null;
  }

  // Update MOU
  static async update(id, mouData, userId) {
    const sql = `
      UPDATE mous SET
        institute = ?,
        contact_person = ?,
        email = ?,
        phone = ?,
        address = ?,
        faculty = ?,
        department = ?,
        academic_year = ?,
        start_date = ?,
        duration = ?,
        expiry_date = ?,
        purpose = ?,
        expected_outcome = ?,
        signed_document = ?,
        status = ?
      WHERE id = ?
    `;
    
    const params = [
      mouData.institute,
      mouData.contactPerson,
      mouData.email,
      mouData.phone,
      mouData.address,
      mouData.faculty,
      mouData.department,
      mouData.academicYear,
      mouData.startDate,
      mouData.duration,
      mouData.expiryDate,
      mouData.purpose,
      mouData.expectedOutcome,
      mouData.signedDocument,
      mouData.status || 'active',
      id
    ];
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // Delete MOU
  static async delete(id) {
    const sql = 'DELETE FROM mous WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Get expiring MOUs
  static async getExpiringMous(days = 30) {
    const sql = `
      SELECT m.*, 
        DATEDIFF(m.expiry_date, CURDATE()) as days_remaining
      FROM mous m
      WHERE m.status = 'active'
        AND m.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY m.expiry_date ASC
    `;
    return await db.query(sql, [days]);
  }

  // Get statistics
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_mous,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_mous,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_mous,
        SUM(CASE WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
            AND status = 'active' THEN 1 ELSE 0 END) as expiring_soon,
        COUNT(DISTINCT faculty) as unique_faculties,
        COUNT(DISTINCT institute) as unique_institutes
      FROM mous
    `;
    const rows = await db.query(sql);
    return rows[0];
  }

  // Get MOUs by faculty
  static async getByFaculty(faculty) {
    const sql = `
      SELECT * FROM mous
      WHERE faculty = ?
      ORDER BY expiry_date DESC
    `;
    return await db.query(sql, [faculty]);
  }
}

module.exports = MOUModel;
