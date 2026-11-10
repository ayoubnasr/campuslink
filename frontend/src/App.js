import { Routes, Route } from "react-router-dom";
import LoginForm from "./Pages/LoginPage/LoginForm";
import SignupForm from "./Pages/LoginPage/SignUpForm";
import ForgotPasswordForm from "./Pages/LoginPage/ForgotPasswordForm";
import StudentHomePage from "./Pages/Home_Page/StudentHomePage"

const App = () => {
  return (
    <div className="container">
      <Routes>
        {/* 🔹 Default Route (Login Page) */}
        <Route path="/" element={<LoginForm />} />  

        {/* 🔹 Login & Signup Routes */}
        <Route path="/login" element={<LoginForm />} />  
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />

        {/* 🔹 Home Route (Cabinet Selection) */}
        <Route path="/home" element={<StudentHomePage />} />

      </Routes>
    </div>
  );
};

export default App;
