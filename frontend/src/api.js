const API = "http://127.0.0.1:8000";

// 🔹 Create complaint
export const createComplaint = async (text, username) => {
    const res = await fetch(`${API}/complaint?text=${text}&username=${username}`, {
        method: "POST"
    });
    return res.json();
};

// 🔹 Get all complaints
export const getComplaints = async (username) => {
    const res = await fetch(`${API}/complaints?username=${username}`);
    return res.json();
};

// 🔹 Update complaint status
export const updateComplaintStatus= async (id, status) => {
    const res = await fetch(`${API}/update-status?id=${id}&status=${status}`, {
        method: "PUT"
    });
    return res.json();
};

// 🔹 Register user
export const registerUser = async (username, password, email) => {
    const res = await fetch(`${API}/register?username=${username}&password=${password}&email=${email}`, {
        method: "POST"
    });
    return res.json();
};

// 🔹 Login user
export const loginUser = async (username, password) => {
    const res = await fetch(`${API}/login?username=${username}&password=${password}`, {
        method: "POST"
    });
    return res.json();
};


//track
export const searchComplaint = async (code) => {
  const res = await fetch(`${API}/search-complaint?code=${code}`);
  return res.json();
};


// forget password

export const forgotPassword = async (email) => {
  const res = await fetch(`${API}/forgot-password?email=${email}`, {
    method: "POST",
  });
  return res.json();
};

//reset password

export const resetPassword = async (token, password) => {
  const res = await fetch(
    `${API}/reset-password?token=${token}&new_password=${password}`,
    { method: "POST" }
  );
  return res.json();
};

// 🔹 Get complaint by ID
export const getComplaintById = async (id) => {
  const res = await fetch(`${API}/complaint/${id}`);
  return res.json();
};
