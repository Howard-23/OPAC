import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AuthorsPage from "./pages/authors/AuthorsPage";
import BooksPage from "./pages/books/BooksPage";
import RentalsPage from "./pages/rentals/RentalsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="rentals" element={<RentalsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
