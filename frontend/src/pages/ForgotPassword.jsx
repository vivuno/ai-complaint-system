import { useState } from "react";
import { forgotPassword } from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await forgotPassword(email);

    if (res.message) {
      alert("Reset link sent to email ");
    } else {
      alert(res.error || "Error");
    }
  };

  return (
    <div className="container py-5">
      <h3>Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary">Send Reset Link</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
