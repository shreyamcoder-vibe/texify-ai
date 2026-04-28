import { Navigate } from "react-router-dom";

// Auth disabled for demo — redirect to app.
export default function AuthPage() {
  return <Navigate to="/app" replace />;
}
