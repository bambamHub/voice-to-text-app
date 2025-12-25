import { User, LoginCredentials, SignupCredentials } from "../types/auth";

export class AuthService {
  private static USERS_KEY = "vtt_users";
  private static TOKEN_KEY = "vtt_token";
  private static CURRENT_USER_KEY = "vtt_current_user";

  static async login(credentials: LoginCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = this.getStoredUsers();
    const user = users.find(
      (u: any) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    localStorage.setItem(this.TOKEN_KEY, token);

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
    console.log("✅ Login successful:", userData);

    return userData;
  }

  static async signup(credentials: SignupCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = this.getStoredUsers();

    if (users.find((u: any) => u.email === credentials.email)) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: Date.now().toString(),
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    const token = btoa(
      JSON.stringify({ userId: newUser.id, email: newUser.email })
    );
    localStorage.setItem(this.TOKEN_KEY, token);

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
    console.log("✅ Signup successful:", userData);

    return userData;
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    console.log("👋 Logged out");
  }

  static getCurrentUser(): User | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private static getStoredUsers(): any[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}
