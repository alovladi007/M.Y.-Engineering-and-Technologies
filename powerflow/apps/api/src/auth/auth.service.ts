import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  organization?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  // Mock user database
  private users: Array<User & { password: string }> = [
    {
      id: 'admin-1',
      email: 'admin@powerflow.dev',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin'
    },
    {
      id: 'user-1',
      email: 'sarah.chen@tesla.com',
      password: 'user123',
      name: 'Sarah Chen',
      role: 'user',
      organization: 'Tesla Motors'
    },
    {
      id: 'user-2',
      email: 'mike@byd.com',
      password: 'user123',
      name: 'Michael Rodriguez',
      role: 'user',
      organization: 'BYD Auto'
    },
    {
      id: 'user-3',
      email: 'lisa@vw.de',
      password: 'user123',
      name: 'Lisa Wagner',
      role: 'user',
      organization: 'Volkswagen Group'
    }
  ];

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Generate mock JWT token
    const token = this.generateToken(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      },
      token,
      expiresIn: 3600 // 1 hour
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // In a real app, validate JWT token
      const payload = this.decodeToken(token);
      const user = this.users.find(u => u.id === payload.userId);
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      };
    } catch {
      return null;
    }
  }

  async getUsersByRole(role: 'user' | 'admin'): Promise<User[]> {
    return this.users
      .filter(u => u.role === role)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        organization: u.organization
      }));
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      organization: u.organization
    }));
  }

  private generateToken(user: User & { password: string }): string {
    // Mock JWT token generation
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now()
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private decodeToken(token: string): any {
    // Mock JWT token decoding
    return JSON.parse(Buffer.from(token, 'base64').toString());
  }
}