import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import StockPage from './pages/StockPage';
import LocationsPage from './pages/LocationsPage';
import IngredientsPage from './pages/IngredientsPage';
import { RegisterForm } from './components/auth/RegisterForm';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'stock',
        element: <StockPage />,
      },
      {
        path: 'locations',
        element: <LocationsPage />,
      },
      {
        path: 'ingredients',
        element: <IngredientsPage />,
      },
      {
        path: 'users/register',
        element: (
          <AdminRoute>
            <div className="py-6">
              <RegisterForm onSuccess={() => window.history.back()} />
            </div>
          </AdminRoute>
        ),
      },
    ],
  },
]);
