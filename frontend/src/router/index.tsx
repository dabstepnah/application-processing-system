import { Navigate, createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AdminRoute } from "./AdminRoute";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { FeedPage } from "../pages/FeedPage";
import { CreateQuestionPage } from "../pages/CreateQuestionPage";
import { QuestionPage } from "../pages/QuestionPage";
import { UserProfilePage } from "../pages/UserProfilePage";
import { MyProfilePage } from "../pages/MyProfilePage";
import { MyQuestionsPage } from "../pages/MyQuestionsPage";
import { ReviewsPage } from "../pages/ReviewsPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { UsersPage } from "../pages/UsersPage";
import { AdminQuestionsPage } from "../pages/AdminQuestionsPage";
import { AdminCommentsPage } from "../pages/AdminCommentsPage";
import { AdminReviewsPage } from "../pages/AdminReviewsPage";
import { StatisticsPage } from "../pages/StatisticsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "questions/new", element: <CreateQuestionPage /> },
      { path: "questions/:id", element: <QuestionPage /> },
      { path: "users/:id", element: <UserProfilePage /> },
      { path: "my-profile", element: <MyProfilePage /> },
      { path: "my-questions", element: <MyQuestionsPage /> },
      { path: "reviews", element: <ReviewsPage /> },
      {
        element: <AdminRoute />,
        children: [
          { path: "admin", element: <AdminDashboardPage /> },
          { path: "admin/users", element: <UsersPage /> },
          { path: "admin/questions", element: <AdminQuestionsPage /> },
          { path: "admin/comments", element: <AdminCommentsPage /> },
          { path: "admin/reviews", element: <AdminReviewsPage /> },
          { path: "admin/statistics", element: <StatisticsPage /> }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
