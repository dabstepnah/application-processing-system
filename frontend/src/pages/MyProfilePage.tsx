import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const MyProfilePage = () => {
  const { userId } = useAuth();
  if (!userId) return null;
  return <Navigate to={`/users/${userId}`} replace />;
};
