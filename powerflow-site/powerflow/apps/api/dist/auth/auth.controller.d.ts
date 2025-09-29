import { AuthService, AuthResponse, User } from './auth.service';
declare class LoginRequestDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginRequestDto): Promise<AuthResponse>;
    getProfile(auth?: string): Promise<User>;
    getUsers(auth?: string): Promise<User[]>;
    logout(): Promise<{
        message: string;
    }>;
}
export {};
