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
export declare class AuthService {
    private users;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateToken(token: string): Promise<User | null>;
    getUsersByRole(role: 'user' | 'admin'): Promise<User[]>;
    getAllUsers(): Promise<User[]>;
    private generateToken;
    private decodeToken;
}
