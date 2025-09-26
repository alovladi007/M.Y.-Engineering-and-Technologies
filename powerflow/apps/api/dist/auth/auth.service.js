"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    constructor() {
        this.users = [
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
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
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
            expiresIn: 3600
        };
    }
    async validateToken(token) {
        try {
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
        }
        catch {
            return null;
        }
    }
    async getUsersByRole(role) {
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
    async getAllUsers() {
        return this.users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            organization: u.organization
        }));
    }
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Date.now()
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
    decodeToken(token) {
        return JSON.parse(Buffer.from(token, 'base64').toString());
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map