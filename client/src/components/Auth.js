import { useState } from "react";
import axios from "axios"; // Install axios if not already installed using `npm install axios`

const Auth = ({ setAuthToken,setUserId }) => {
  const [error, setError] = useState(null);
  const [isLogin, setisLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");

  const viewlogin = (status) => {
    setisLogin(status);
    setError(null); // Reset error when switching modes
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Determine the API endpoint based on login or registration
    const endpoint = isLogin ? "/api/login" : "/api/register";

    // Validate form data for registration
    if (!isLogin && password !== confirmpassword) {
        console.log(password);
        console.log(confirmpassword);
      setError("Passwords dono match");
      return;
    }

    try {
      // Send request to backend
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password,
      });


      const { token, message, userId } = response.data; // Expect a token from the backend
      localStorage.setItem("authToken", token); // Save token
      localStorage.setItem("userId", userId);

      setAuthToken(token); // Update state in the parent component
      setUserId(userId);


      

      setError(null); // Clear any previous errors
    } catch (err) {
      // Handle error from backend
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-box">
        <h2>TODO</h2>
        <form onSubmit={handleSubmit}>
          <h2>{isLogin ? "Please Log In" : "Please Sign Up"}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmpassword}
              onChange={(e) => setConfirmpassword(e.target.value)} // Update confirmPassword state
              required
            />
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? "Log In" : "Sign Up"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <div className="auth-options">
          <button
            onClick={() => viewlogin(false)}
            style={{
              backgroundColor: !isLogin ? "rgb(255,255,255)" : "rgb(188,188,188)",
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => viewlogin(true)}
            style={{
              backgroundColor: isLogin ? "rgb(255,255,255)" : "rgb(188,188,188)",
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
