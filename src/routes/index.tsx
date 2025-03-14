
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "@/components/auth/PrivateRoute";
import { routes } from "./routes.config";

export function AppRoutes() {
  return (
    <Routes>
      {routes.public.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      
      <Route element={<PrivateRoute />}>
        {routes.protected.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Route>
      
      <Route element={<PrivateRoute requireAdmin={true} />}>
        {routes.admin.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Route>
    </Routes>
  );
}
