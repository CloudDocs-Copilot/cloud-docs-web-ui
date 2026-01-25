import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = { children: React.ReactNode };

export default function PrivateRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}