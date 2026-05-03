import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg text-ink">
        Loading library workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
