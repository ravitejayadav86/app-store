import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppDetail from "./pages/AppDetail";
import Profile from "./pages/Profile";
import Submit from "./pages/Submit";
import AdminDashboard from "./pages/AdminDashboard";

const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apps/:id" element={<AppDetail />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/submit" element={<PrivateRoute><Submit /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}