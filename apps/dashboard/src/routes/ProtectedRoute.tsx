import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { FullScreenSpinner } from "../components/ui/Spinner";
import { ROUTES } from "@/constants/routes";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner label="Restoring your session…" />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  return children;
};

export const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
};
