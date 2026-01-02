import { Routes, Route, useLocation } from "react-router-dom"
import Signup from "./pages/signup/Signup"
import SetupPassword from "./pages/Setup-Password/setupPassword"
import NotFound from "./pages/Page Not Found/NotFound"
import Login from "./pages/login/Login"
import ForgotPassword from "./pages/forgot-password/forgotPassword"
import ResetPassword from "./pages/reset-password/resetPassword"

import ProtectedRoute from "./components/protectedRoute"
import Articles from "./pages/article/Article"
//import Drafts from "./pages/article/draft"
import ArticleDetail from "./pages/article/articleDetail"
import EditArticle from "./pages/article/updateArticle"
import CreateArticle from "./pages/article/createArticle"
import ArticlesLayout  from "./components/articlesLayout"
import Users from "./pages/Users/userLists"
import CreateUser from "./pages/Users/create"
import UserProfile from "./pages/profile"
import Sidebar from "./components/sideBar"

function App() {
  const location = useLocation();
  
  // Check if user is admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";
  
  // Check if we're on a protected route (not auth pages)
  const authRoutes = ["/signup", "/login", "/forgot-password", "/setup-password", "/reset-password"];
  const isAuthPage = authRoutes.some(route => location.pathname.startsWith(route)) || location.pathname === "/";
  
  const showSidebar = isAdmin && !isAuthPage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showSidebar && <Sidebar />}
      
      {/* Conditional margin based on sidebar visibility */}
      <div className={showSidebar ? "ml-64" : ""}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/setup-password/:token" element={<SetupPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="" element={<Signup/>} />

          <Route 
            element={
              <ProtectedRoute>
                <ArticlesLayout />
              </ProtectedRoute>
            }
          >
            <Route path="articles" element={<Articles status="published"/>}/>
            <Route path="drafts" element={ <Articles status="draft" /> }/>
            <Route path="articles/:id/edit" element={<EditArticle /> }/>
            <Route path="articles/:id" element={ <ArticleDetail /> }/>
            <Route path="articles/new" element={ <CreateArticle /> }/>
            <Route path="users" element={<Users />} />
            <Route path="user-profile" element={<UserProfile />} />
          </Route>
        </Routes> 
      </div>
    </div>
  )
}

export default App