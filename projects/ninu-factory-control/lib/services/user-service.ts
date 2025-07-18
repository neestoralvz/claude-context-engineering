// User Service for database operations
import { query, DatabaseOperations } from '@/lib/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'supervisor' | 'viewer';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLogin?: Date;
  department?: string;
  shift?: 'morning' | 'afternoon' | 'night';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'supervisor' | 'viewer';
  firstName?: string;
  lastName?: string;
  department?: string;
  shift?: 'morning' | 'afternoon' | 'night';
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'operator' | 'supervisor' | 'viewer';
  department?: string;
  shift?: 'morning' | 'afternoon' | 'night';
  isActive?: boolean;
}

// Role-based permissions
const ROLE_PERMISSIONS = {
  admin: [
    'read:all',
    'write:all',
    'delete:all',
    'manage:users',
    'manage:system',
    'control:reactors',
    'control:stations',
    'view:analytics',
    'manage:orders'
  ],
  supervisor: [
    'read:all',
    'write:production',
    'control:reactors',
    'control:stations',
    'view:analytics',
    'manage:orders'
  ],
  operator: [
    'read:production',
    'write:production',
    'control:stations',
    'view:dashboard'
  ],
  viewer: [
    'read:dashboard',
    'view:dashboard'
  ]
};

export class UserService {
  /**
   * Initialize users table if it doesn't exist
   */
  static async initializeUsersTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role VARCHAR(50) NOT NULL DEFAULT 'operator',
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          department VARCHAR(100),
          shift VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if table is empty and seed with default users
      const countResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
      );

      if (countResult.rows[0].count === '0') {
        await this.seedDefaultUsers();
      }
    } catch (error) {
      console.error('Error initializing users table:', error);
      throw error;
    }
  }

  /**
   * Seed users table with default users
   */
  static async seedDefaultUsers(): Promise<void> {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@ninu.mx',
        password: 'admin123',
        role: 'admin' as const,
        firstName: 'Admin',
        lastName: 'User',
        department: 'IT'
      },
      {
        username: 'supervisor1',
        email: 'supervisor@ninu.mx',
        password: 'super123',
        role: 'supervisor' as const,
        firstName: 'Supervisor',
        lastName: 'User',
        department: 'Production',
        shift: 'morning' as const
      },
      {
        username: 'operator1',
        email: 'operator@ninu.mx',
        password: 'oper123',
        role: 'operator' as const,
        firstName: 'Operator',
        lastName: 'User',
        department: 'Production',
        shift: 'morning' as const
      }
    ];

    for (const user of defaultUsers) {
      await this.createUser(user);
    }

    console.log('✅ Users table seeded with default users');
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    const { username, email, password, role, firstName, lastName, department, shift } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query<any>(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, role, department, shift
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id,
        username,
        email,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      department,
      shift
    ]);

    const user = result.rows[0];
    user.permissions = ROLE_PERMISSIONS[role];
    return user;
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    const result = await query<any>(`
      SELECT 
        id,
        username,
        email,
        password_hash,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE username = $1 AND is_active = true
    `, [username]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    user.permissions = ROLE_PERMISSIONS[user.role];
    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const result = await query<any>(`
      SELECT 
        id,
        username,
        email,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    user.permissions = ROLE_PERMISSIONS[user.role];
    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query<any>(`
      SELECT 
        id,
        username,
        email,
        password_hash,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE email = $1 AND is_active = true
    `, [email]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    user.permissions = ROLE_PERMISSIONS[user.role];
    return user;
  }

  /**
   * Authenticate user with credentials
   */
  static async authenticate(username: string, password: string): Promise<User | null> {
    const result = await query<any>(`
      SELECT 
        id,
        username,
        email,
        password_hash,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE username = $1 AND is_active = true
    `, [username]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) return null;

    // Update last login
    await query(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [user.id]);

    user.permissions = ROLE_PERMISSIONS[user.role];
    delete user.password_hash; // Remove password hash from response
    return user;
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: UpdateUserData): Promise<User | null> {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'firstName' ? 'first_name' : 
                     key === 'lastName' ? 'last_name' : 
                     key === 'isActive' ? 'is_active' : key;
        updateFields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return await this.getUserById(id);
    }

    const result = await query<any>(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        username,
        email,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [...values, id]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    user.permissions = ROLE_PERMISSIONS[user.role];
    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Get current password hash
    const result = await query<{ password_hash: string }>(`
      SELECT password_hash FROM users WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) return false;

    const currentHash = result.rows[0].password_hash;
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!passwordMatch) return false;

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [newHash, id]);

    return true;
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    const result = await query<any>(`
      SELECT 
        id,
        username,
        email,
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login as "lastLogin",
        department,
        shift,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      ORDER BY created_at DESC
    `);

    return result.rows.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[user.role]
    }));
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(id: string): Promise<boolean> {
    const result = await query(`
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id]);

    return result.rowCount > 0;
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<boolean> {
    const result = await query(`
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id]);

    return result.rowCount > 0;
  }

  /**
   * Check if user has permission
   */
  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes('write:all');
  }

  /**
   * Get user permissions
   */
  static getUserPermissions(role: string): string[] {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  }
}