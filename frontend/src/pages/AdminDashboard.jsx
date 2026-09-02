import { useEffect, useState } from "react";
import { getComplaints, updateComplaintStatus } from "../api";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AdminDashboard() {

  const username = localStorage.getItem("username");
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingType, setLoadingType] = useState("");

  const loadData = async () => {
  try {
    const res = await getComplaints(username);

    if (Array.isArray(res)) {
      setData(res);
    } else {
      console.error("API Error:", res);
      setData([]); // ✅ prevent crash
    }

  } catch (err) {
    console.error(err);
    setData([]); // ✅ prevent crash
  }
};

  useEffect(() => {
   loadData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
  setLoadingId(id);
  setLoadingType(status);

  try {
    await updateComplaintStatus(id, status);
    await loadData();
  } catch (err) {
    alert("Error updating status ");
  }

  setLoadingId(null);
  setLoadingType("");
};

  return (
    
      

      <div className="container py-5">
        <h2 className="text-center mb-4">Admin Dashboard</h2>

        {/* Stats */}
        <div className="row g-4 mb-5">

          <div className="col-md-4">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <h3>{data.length}</h3>
                <p>Total Complaints</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <h3>{data.filter(c => c.status !== "Resolved").length}</h3>
                <p>Pending</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <h3>{data.filter(c => c.status === "Resolved").length}</h3>
                <p>Resolved</p>
              </div>
            </div>
          </div>

        </div>

        {/* Complaints */}
        <div className="card p-3">
          <h4>Manage Complaints</h4>

         {Array.isArray(data) && data.map((c) => (
  <div key={c.id} className="border p-3 mb-3 rounded">
    <h5>{c.text}</h5>
    <p>
      <strong>Complaint ID:</strong> {c.complaint_code} <br />
      <strong>Category:</strong> {c.category} <br />
      <strong>Priority:</strong> {c.priority} <br />
      <strong>Status:</strong> {c.status}
    </p>

    <button
  onClick={() => handleStatusUpdate(c.id, "In Progress")}
  disabled={c.status !== "Submitted"}
  className="btn btn-warning me-2"
>
{c.status ==="In Progress"?"In progress" : "Start"}


  {loadingId === c.id && loadingType === "In Progress" ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      
    </>
  ) : (
    ""
  )}
</button>

   <button
  onClick={() => handleStatusUpdate(c.id, "Resolved")}
  disabled={c.status !=="In Progress"}
  className="btn btn-success"
>
{c.status ==="Resolved" ? "Resolved" : "Resolve"}

  {loadingId === c.id && loadingType === "Resolved" ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      
    </>
  ) : (
    ""
  )}
</button>
  </div>
))}

        </div>
      </div>

      
    
  );
}

export default AdminDashboard;
