import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";
import { ROUTES } from "@/constants/routes";
import { FullScreenSpinner } from "../components/ui/Spinner";
import { Toaster } from "react-hot-toast";

const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const BoardPage = lazy(() => import("../pages/BoardPage"));
const MyTasks = lazy(() => import("../pages/MyTasks"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Team = lazy(() => import("../pages/Team"));
const Settings = lazy(() => import("../pages/Settings"));
const NotFound = lazy(() => import("../pages/NotFound"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));

export const AppRouter = () => (
  <Suspense fallback={<FullScreenSpinner />}>
    <Routes>
      <Route path={ROUTES.LANDING} element={<Landing />} />
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.MY_TASKS} element={<MyTasks />} />
        <Route path={ROUTES.CALENDAR} element={<Calendar />} />
        <Route path={ROUTES.TEAM} element={<Team />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.BOARD_PATH} element={<BoardPage />} />
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>

    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-line)",
          borderRadius: "999px",
          padding: "0.6rem 1rem",
          boxShadow: "var(--shadow-soft)",
          fontSize: "0.875rem",
          fontWeight: 500,
        },
      }}
    />
  </Suspense>
);
