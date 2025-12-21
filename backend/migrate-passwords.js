require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

/**
 * Migration script to hash existing plaintext passwords in users.json
 * Run this once to migrate existing users
 */
async function migratePasswords() {
  const usersFile = path.join(__dirname, 'users.json');
  
  try {
    // Read existing users
    const data = await fs.readFile(usersFile, 'utf8');
    const users = JSON.parse(data);
    
    console.log(`Found ${users.length} users to migrate...`);
    
    // Hash each user's password if it's not already hashed
    for (const user of users) {
      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      if (!user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        console.log(`✓ Migrated password for: ${user.email}`);
      } else {
        console.log(`- Skipped (already hashed): ${user.email}`);
      }
    }
    
    // Write back to file
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    console.log('\n✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error.message);
    process.exit(1);
  }
}

// Run migration
migratePasswords();
