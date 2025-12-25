import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import "../styles/Auth.css";

interface LoginProps {
  onSwitchToSignup: () => void;
}

export const Login = ({ onSwitchToSignup }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading("Logging in...");

    try {
      await login({ email, password });
      toast.success("Welcome back! Login successful 🎉", { id: loadingToast });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Login failed. Please try again.",
        { id: loadingToast }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎤 Welcome Back</h1>
          <p>Login to continue to Voice to Text</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button
              className="auth-switch-btn"
              onClick={onSwitchToSignup}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
