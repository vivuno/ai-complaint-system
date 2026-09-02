import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await resetPassword(token, password);

    if (res.message) {
      alert("Password updated ");
      navigate("/login");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="container py-5">
      <h3>Reset Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mb-3"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-success">Update Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
