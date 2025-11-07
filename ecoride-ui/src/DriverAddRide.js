

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API = "http://127.0.0.1:5000";

// export default function DriverAddRide() {
//   const [driverId, setDriverId] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [rides, setRides] = useState([]);
//   const [editingRide, setEditingRide] = useState(null);
//   const [rideDetails, setRideDetails] = useState({
//     start_location: "",
//     destination: "",
//     date: "",
//     time: "",
//     available_seats: "",
//   });

//   const fetchRides = async () => {
//     try {
//       const res = await axios.get(`${API}/driver-rides/${driverId}`);
//       setRides(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleLogin = async () => {
//     if (!driverId) return alert("Enter Driver ID!");
//     try {
//       const res = await axios.post(`${API}/driver-login`, { driver_id: driverId });
//       if (res.data.success) {
//         setIsLoggedIn(true);
//         fetchRides();
//         alert("✅ Driver logged in successfully!");
//       } else {
//         alert("Invalid Driver ID!");
//       }
//     } catch {
//       alert("Login failed!");
//     }
//   };

//   const handleChange = (e) => {
//     setRideDetails({ ...rideDetails, [e.target.name]: e.target.value });
//   };

//   const handleAddOrUpdateRide = async () => {
//     try {
//       if (editingRide) {
//         await axios.put(`${API}/ride/${editingRide.Ride_ID}`, {
//           ...rideDetails,
//           driver_id: driverId,
//         });
//         alert("✅ Ride updated successfully!");
//         setEditingRide(null);
//       } else {
//         await axios.post(`${API}/add-ride`, { ...rideDetails, driver_id: driverId });
//         alert("✅ Ride added successfully!");
//       }
//       setRideDetails({
//         start_location: "",
//         destination: "",
//         date: "",
//         time: "",
//         available_seats: "",
//       });
//       fetchRides();
//     } catch (err) {
//       alert("❌ Error saving ride!");
//     }
//   };

//   const handleEdit = (ride) => {
//     setEditingRide(ride);
//     setRideDetails({
//       start_location: ride.Start_Location,
//       destination: ride.Destination,
//       date: ride.Date,
//       time: ride.Time,
//       available_seats: ride.Available_Seats,
//     });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this ride?")) return;
//     try {
//       await axios.delete(`${API}/ride/${id}`);
//       alert("🗑️ Ride deleted successfully!");
//       fetchRides();
//     } catch {
//       alert("❌ Error deleting ride!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">
//       <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">🚗 Driver Dashboard</h1>

//       {!isLoggedIn ? (
//         <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//           <h2 className="text-xl font-semibold mb-4 text-blue-700">Driver Login</h2>
//           <input
//             type="number"
//             placeholder="Enter Driver ID"
//             value={driverId}
//             onChange={(e) => setDriverId(e.target.value)}
//             className="w-full border rounded-lg p-2 mb-4"
//           />
//           <button
//             onClick={handleLogin}
//             className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Login
//           </button>
//         </div>
//       ) : (
//         <div className="max-w-4xl mx-auto space-y-8">
//           <div className="bg-white shadow-lg rounded-xl p-6">
//             <h2 className="text-xl font-semibold mb-4 text-blue-700">
//               {editingRide ? "✏️ Edit Ride" : "➕ Add New Ride"}
//             </h2>

//             {Object.keys(rideDetails).map((key) => (
//               <input
//                 key={key}
//                 name={key}
//                 placeholder={key.replace("_", " ").toUpperCase()}
//                 value={rideDetails[key]}
//                 onChange={handleChange}
//                 className="w-full border rounded-lg p-2 mb-3"
//               />
//             ))}

//             <button
//               onClick={handleAddOrUpdateRide}
//               className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               {editingRide ? "Update Ride" : "Add Ride"}
//             </button>
//           </div>

//           <div className="bg-white shadow-lg rounded-xl p-6">
//             <h2 className="text-xl font-semibold mb-4 text-blue-700">Your Rides</h2>
//             {rides.length === 0 ? (
//               <p className="text-gray-500">No rides found.</p>
//             ) : (
//               rides.map((r) => (
//                 <div key={r.Ride_ID} className="border-b py-3 flex justify-between items-center">
//                   <div>
//                     <p className="font-semibold text-gray-700">
//                       {r.Start_Location} → {r.Destination}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {r.Date} at {r.Time} | Seats: {r.Available_Seats}
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEdit(r)}
//                       className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(r.Ride_ID)}
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function DriverAddRide() {
  const [driverId, setDriverId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rides, setRides] = useState([]);
  const [editingRide, setEditingRide] = useState(null);
  const [rideDetails, setRideDetails] = useState({
    start_location: "",
    destination: "",
    date: "",
    time: "",
    available_seats: "",
  });

  // ✅ New: state for environmental impact
  const [impact, setImpact] = useState(null);
  const [selectedRideId, setSelectedRideId] = useState(null);

  const fetchRides = async () => {
    try {
      const res = await axios.get(`${API}/driver-rides/${driverId}`);
      setRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    if (!driverId) return alert("Enter Driver ID!");
    try {
      const res = await axios.post(`${API}/driver-login`, { driver_id: driverId });
      if (res.data.success) {
        setIsLoggedIn(true);
        fetchRides();
        alert("✅ Driver logged in successfully!");
      } else {
        alert("Invalid Driver ID!");
      }
    } catch {
      alert("Login failed!");
    }
  };

  const handleChange = (e) => {
    setRideDetails({ ...rideDetails, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateRide = async () => {
    try {
      if (editingRide) {
        await axios.put(`${API}/ride/${editingRide.Ride_ID}`, {
          ...rideDetails,
          driver_id: driverId,
        });
        alert("✅ Ride updated successfully!");
        setEditingRide(null);
      } else {
        await axios.post(`${API}/add-ride`, { ...rideDetails, driver_id: driverId });
        alert("✅ Ride added successfully!");
      }
      setRideDetails({
        start_location: "",
        destination: "",
        date: "",
        time: "",
        available_seats: "",
      });
      fetchRides();
    } catch (err) {
      alert("❌ Error saving ride!");
    }
  };

  const handleEdit = (ride) => {
    setEditingRide(ride);
    setRideDetails({
      start_location: ride.Start_Location,
      destination: ride.Destination,
      date: ride.Date,
      time: ride.Time,
      available_seats: ride.Available_Seats,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ride?")) return;
    try {
      await axios.delete(`${API}/ride/${id}`);
      alert("🗑️ Ride deleted successfully!");
      fetchRides();
      if (selectedRideId === id) {
        setImpact(null);
        setSelectedRideId(null);
      }
    } catch {
      alert("❌ Error deleting ride!");
    }
  };

  // ✅ New: fetch environmental impact for a ride
  const handleViewImpact = async (rideId) => {
    try {
      const res = await axios.get(`${API}/environmental-impact/${rideId}`);
      setImpact(res.data);
      setSelectedRideId(rideId);
    } catch (err) {
      alert("⚠️ No environmental impact data found for this ride.");
      setImpact(null);
      setSelectedRideId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        🚗 Driver Dashboard
      </h1>

      {!isLoggedIn ? (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Driver Login</h2>
          <input
            type="number"
            placeholder="Enter Driver ID"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Add or Edit Ride */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              {editingRide ? "✏️ Edit Ride" : "➕ Add New Ride"}
            </h2>

            {Object.keys(rideDetails).map((key) => (
              <input
                key={key}
                name={key}
                placeholder={key.replace("_", " ").toUpperCase()}
                value={rideDetails[key]}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mb-3"
              />
            ))}

            <button
              onClick={handleAddOrUpdateRide}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {editingRide ? "Update Ride" : "Add Ride"}
            </button>
          </div>

          {/* Driver's Rides List */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Your Rides</h2>
            {rides.length === 0 ? (
              <p className="text-gray-500">No rides found.</p>
            ) : (
              rides.map((r) => (
                <div
                  key={r.Ride_ID}
                  className="border-b py-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">
                        {r.Start_Location} → {r.Destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        {r.Date} at {r.Time} | Seats: {r.Available_Seats}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.Ride_ID)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* 🌿 Environmental Impact Button */}
                  <button
                    onClick={() => handleViewImpact(r.Ride_ID)}
                    className="text-green-700 text-sm underline self-start hover:text-green-800"
                  >
                    🌿 View Environmental Impact
                  </button>

                  {/* Show impact if selected */}
                  {impact && selectedRideId === r.Ride_ID && (
                    <div className="bg-green-50 border border-green-300 rounded-xl p-4 mt-2">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        Environmental Impact
                      </h3>
                      <p className="text-gray-700">
                        CO₂ Saved: <b>{impact.CO2_Saved}</b> kg
                      </p>
                      <p className="text-gray-700">
                        Fuel Saved: <b>{impact.Fuel_Saved}</b> L
                      </p>
                      <p className="text-gray-500 text-sm">
                        Calculated on: {impact.Calculation_Date}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

