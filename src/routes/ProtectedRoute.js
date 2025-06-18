import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthLocket";
import Loading from "../components/Loading";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />; // Hiển thị loading khi đang xác thực

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
