// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;







// import React, { useState, useEffect } from "react";
// import axios from "axios";


// const API = "http://127.0.0.1:5000";

// export default function App() {
//   const [rides, setRides] = useState([]);
//   const [selectedRide, setSelectedRide] = useState(null);
//   const [booking, setBooking] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("");

//   useEffect(() => {
//     axios.get(`${API}/rides`)
//       .then(res => setRides(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   const handleBook = async (ride_id) => {
//     const body = { ride_id, passenger_id: 2, seats: 1 }; // fixed user for now
//     try {
//       const res = await axios.post(`${API}/book-ride`, body);
//       setBooking(res.data);
//       setSelectedRide(ride_id);
//     } catch (err) {
//       alert("Error booking ride");
//     }
//   };

//   const handlePayment = async () => {
//     if (!booking) return alert("No booking found!");
//     try {
//       const body = { booking_id: booking.booking_id, payment_method: paymentMethod };
//       await axios.post(`${API}/make-payment`, body);
//       alert("✅ Payment successful!");
//     } catch (err) {
//       alert("Error while making payment");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
//       <h1 className="text-3xl font-bold text-center mb-6 text-green-800">🌿 EcoRide Booking</h1>

//       <div className="grid md:grid-cols-2 gap-6">
//         {rides.map((ride) => (
//           <div key={ride.Ride_ID} className="bg-white shadow-lg rounded-xl p-4">
//             <h2 className="text-xl font-semibold text-green-700">
//               {ride.Start_Location} → {ride.Destination}
//             </h2>
//             <p className="text-gray-600 mt-1">
//               Date: {ride.Date} | Time: {ride.Time}
//             </p>
//             <p className="text-gray-700 mt-2">Available Seats: {ride.Available_Seats}</p>
//             <p className="text-gray-700">Fare: ₹{ride.Fare}</p>
//             <button
//               onClick={() => handleBook(ride.Ride_ID)}
//               className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               Book Ride
//             </button>
//           </div>
//         ))}
//       </div>

//       {booking && (
//         <div className="mt-8 bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//           <h3 className="text-2xl font-bold text-green-700 mb-2">Booking Confirmed ✅</h3>
//           <p>Booking ID: {booking.booking_id}</p>
//           <p>Total Fare: ₹{booking.total_amount}</p>

//           <div className="mt-4">
//             <label className="block text-gray-700 font-medium">Choose Payment Method:</label>
//             <select
//               className="border rounded-lg w-full p-2 mt-2"
//               value={paymentMethod}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//             >
//               <option value="">--Select--</option>
//               <option value="UPI">UPI</option>
//               <option value="Card">Card</option>
//               <option value="Cash">Cash</option>
//             </select>
//           </div>

//           <button
//             onClick={handlePayment}
//             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Make Payment
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }















// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import DriverAddRide from "./DriverAddRide";


// const API = "http://127.0.0.1:5000";

// export default function App() {
//   const [rides, setRides] = useState([]);
//   const [booking, setBooking] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [passengerId, setPassengerId] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [selectedSeats, setSelectedSeats] = useState(1);

//   useEffect(() => {
//     if (isLoggedIn) {
//       axios
//         .get(`${API}/rides`)
//         .then((res) => setRides(res.data))
//         .catch((err) => console.error(err));
//     }
//   }, [isLoggedIn]);

//   // Handle login
//   const handleLogin = async () => {
//     if (!passengerId) return alert("Enter passenger ID!");
//     try {
//       const res = await axios.post(`${API}/login`, { passenger_id: passengerId });
//       if (res.data.success) {
//         setIsLoggedIn(true);
//         alert("✅ Login successful!");
//       } else {
//         alert("Invalid Passenger ID!");
//       }
//     } catch (err) {
//       alert("Login failed!");
//     }
//   };

//   // Handle booking
//   const handleBook = async (ride_id) => {
//     if (!isLoggedIn) return alert("Please log in first!");
//     if (selectedSeats < 1) return alert("Select at least one seat.");

//     const body = { ride_id, passenger_id: passengerId, seats: selectedSeats };
//     try {
//       const res = await axios.post(`${API}/book-ride`, body);
//       setBooking(res.data);
//       alert(`🎟️ Successfully booked ${selectedSeats} seat(s)!`);
//     } catch (err) {
//       alert("Error booking ride");
//     }
//   };

//   // Handle payment
//   const handlePayment = async () => {
//     if (!booking) return alert("No booking found!");
//     if (!paymentMethod) return alert("Please select a payment method!");
//     try {
//       const body = { booking_id: booking.booking_id, payment_method: paymentMethod };
//       await axios.post(`${API}/make-payment`, body);
//       alert("✅ Payment successful!");
//       setBooking(null);
//     } catch (err) {
//       alert("Error while making payment");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
//       <h1 className="text-3xl font-bold text-center mb-6 text-green-800">🌿 EcoRide Booking</h1>

//       {!isLoggedIn ? (
//         <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//           <h2 className="text-xl font-semibold mb-4 text-green-700">Passenger Login</h2>
//           <input
//             type="number"
//             placeholder="Enter Passenger ID"
//             value={passengerId}
//             onChange={(e) => setPassengerId(e.target.value)}
//             className="w-full border rounded-lg p-2 mb-4"
//           />
//           <button
//             onClick={handleLogin}
//             className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             Login
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="grid md:grid-cols-2 gap-6">
//             {rides.map((ride) => (
//               <div key={ride.Ride_ID} className="bg-white shadow-lg rounded-xl p-4">
//                 <h2 className="text-xl font-semibold text-green-700">
//                   {ride.Start_Location} → {ride.Destination}
//                 </h2>
//                 <p className="text-gray-600 mt-1">
//                   Date: {ride.Date} | Time: {ride.Time}
//                 </p>
//                 <p className="text-gray-700 mt-2">Available Seats: {ride.Available_Seats}</p>
//                 <p className="text-gray-700">Fare: ₹{ride.Fare}</p>

//                 <div className="mt-3 flex items-center gap-3">
//                   <label htmlFor={`seats-${ride.Ride_ID}`} className="text-sm text-gray-700">
//                     Seats:
//                   </label>
//                   <select
//                     id={`seats-${ride.Ride_ID}`}
//                     value={selectedSeats}
//                     onChange={(e) => setSelectedSeats(Number(e.target.value))}
//                     className="border rounded-lg px-3 py-1"
//                   >
//                     {[...Array(ride.Available_Seats).keys()].map((n) => (
//                       <option key={n + 1} value={n + 1}>
//                         {n + 1}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={() => handleBook(ride.Ride_ID)}
//                     className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                   >
//                     Book
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {booking && (
//             <div className="mt-8 bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//               <h3 className="text-2xl font-bold text-green-700 mb-2">Booking Confirmed ✅</h3>
//               <p>Booking ID: {booking.booking_id}</p>

//               <div className="mt-4">
//                 <label className="block text-gray-700 font-medium">Choose Payment Method:</label>
//                 <select
//                   className="border rounded-lg w-full p-2 mt-2"
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                 >
//                   <option value="">--Select--</option>
//                   <option value="UPI">UPI</option>
//                   <option value="Card">Card</option>
//                   <option value="Cash">Cash</option>
//                 </select>
//               </div>

//               <button
//                 onClick={handlePayment}
//                 className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
//               >
//                 Make Payment
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
















// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API = "http://127.0.0.1:5000";

// export default function App() {
//   const [rides, setRides] = useState([]);
//   const [booking, setBooking] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [userId, setUserId] = useState("");
//   const [role, setRole] = useState("Passenger");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [selectedSeats, setSelectedSeats] = useState(1);
//   const [rideForm, setRideForm] = useState({
//     startLocation: "",
//     destination: "",
//     date: "",
//     time: "",
//     availableSeats: "",
//   });
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (isLoggedIn && role === "Passenger") {
//       axios
//         .get(`${API}/rides`)
//         .then((res) => setRides(res.data))
//         .catch((err) => console.error(err));
//     }
//   }, [isLoggedIn, role]);

//   // Handle login
//   const handleLogin = async () => {
//     if (!userId) return alert("Enter ID!");
//     try {
//       const endpoint = role === "Driver" ? "/login-driver" : "/login";
//       const res = await axios.post(`${API}${endpoint}`, {
//         user_id: userId,
//       });
//       if (res.data.success) {
//         setIsLoggedIn(true);
//         setMessage(`✅ Logged in as ${role}`);
//       } else {
//         alert("Invalid ID!");
//       }
//     } catch (err) {
//       alert("Login failed!");
//     }
//   };

//   // Handle booking
//   const handleBook = async (ride_id) => {
//     if (!isLoggedIn) return alert("Please log in first!");
//     if (selectedSeats < 1) return alert("Select at least one seat.");

//     const body = { ride_id, passenger_id: userId, seats: selectedSeats };
//     try {
//       const res = await axios.post(`${API}/book-ride`, body);
//       setBooking(res.data);
//       alert(`🎟️ Successfully booked ${selectedSeats} seat(s)!`);
//     } catch (err) {
//       alert("Error booking ride");
//     }
//   };

//   // Handle payment
//   const handlePayment = async () => {
//     if (!booking) return alert("No booking found!");
//     if (!paymentMethod) return alert("Please select a payment method!");
//     try {
//       const body = { booking_id: booking.booking_id, payment_method: paymentMethod };
//       await axios.post(`${API}/make-payment`, body);
//       alert("✅ Payment successful!");
//       setBooking(null);
//     } catch (err) {
//       alert("Error while making payment");
//     }
//   };

//   // Handle ride field changes
//   const handleRideChange = (e) => {
//     const { name, value } = e.target;
//     setRideForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // Submit ride (for driver)
//   const handleAddRide = async (e) => {
//     e.preventDefault();
//     setMessage("Adding ride...");

//     try {
//       const res = await axios.post(`${API}/add-ride-auto`, {
//         Start_Location: rideForm.startLocation,
//         Destination: rideForm.destination,
//         Date: rideForm.date,
//         Time: rideForm.time,
//         Available_Seats: rideForm.availableSeats,
//         Driver_ID: userId,
//       });

//       if (res.data.success) {
//         setMessage(`✅ Ride added successfully! Ride ID: ${res.data.Ride_ID}`);
//         setRideForm({
//           startLocation: "",
//           destination: "",
//           date: "",
//           time: "",
//           availableSeats: "",
//         });
//       } else {
//         setMessage("❌ Failed to add ride");
//       }
//     } catch (error) {
//       setMessage("❌ Could not connect to server");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
//       <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
//         🌿 EcoRide Platform
//       </h1>

//       {/* LOGIN SECTION */}
//       {!isLoggedIn ? (
//         <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//           <h2 className="text-xl font-semibold mb-4 text-green-700">
//             User Login
//           </h2>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Select Role:
//             </label>
//             <select
//               className="w-full border rounded-lg p-2 mt-1"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//             >
//               <option value="Passenger">Passenger</option>
//               <option value="Driver">Driver</option>
//             </select>
//           </div>

//           <input
//             type="number"
//             placeholder={`Enter ${role} ID`}
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             className="w-full border rounded-lg p-2 mb-4"
//           />

//           <button
//             onClick={handleLogin}
//             className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             Login
//           </button>
//         </div>
//       ) : role === "Passenger" ? (
//         <>
//           {/* PASSENGER VIEW */}
//           <div className="grid md:grid-cols-2 gap-6">
//             {rides.map((ride) => (
//               <div key={ride.Ride_ID} className="bg-white shadow-lg rounded-xl p-4">
//                 <h2 className="text-xl font-semibold text-green-700">
//                   {ride.Start_Location} → {ride.Destination}
//                 </h2>
//                 <p className="text-gray-600 mt-1">
//                   Date: {ride.Date} | Time: {ride.Time}
//                 </p>
//                 <p className="text-gray-700 mt-2">Available Seats: {ride.Available_Seats}</p>
//                 <p className="text-gray-700">Fare: ₹{ride.Fare}</p>

//                 <div className="mt-3 flex items-center gap-3">
//                   <label htmlFor={`seats-${ride.Ride_ID}`} className="text-sm text-gray-700">
//                     Seats:
//                   </label>
//                   <select
//                     id={`seats-${ride.Ride_ID}`}
//                     value={selectedSeats}
//                     onChange={(e) => setSelectedSeats(Number(e.target.value))}
//                     className="border rounded-lg px-3 py-1"
//                   >
//                     {[...Array(ride.Available_Seats).keys()].map((n) => (
//                       <option key={n + 1} value={n + 1}>
//                         {n + 1}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={() => handleBook(ride.Ride_ID)}
//                     className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                   >
//                     Book
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* PAYMENT SECTION */}
//           {booking && (
//             <div className="mt-8 bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//               <h3 className="text-2xl font-bold text-green-700 mb-2">
//                 Booking Confirmed ✅
//               </h3>
//               <p>Booking ID: {booking.booking_id}</p>

//               <div className="mt-4">
//                 <label className="block text-gray-700 font-medium">
//                   Choose Payment Method:
//                 </label>
//                 <select
//                   className="border rounded-lg w-full p-2 mt-2"
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                 >
//                   <option value="">--Select--</option>
//                   <option value="UPI">UPI</option>
//                   <option value="Card">Card</option>
//                   <option value="Cash">Cash</option>
//                 </select>
//               </div>

//               <button
//                 onClick={handlePayment}
//                 className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
//               >
//                 Make Payment
//               </button>
//             </div>
//           )}
//         </>
//       ) : (
//         <>
//           {/* DRIVER VIEW */}
//           <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
//             <h2 className="text-xl font-semibold mb-4 text-green-700">
//               Add New Ride
//             </h2>
//             <form onSubmit={handleAddRide}>
//               <input
//                 type="text"
//                 name="startLocation"
//                 placeholder="Start Location"
//                 value={rideForm.startLocation}
//                 onChange={handleRideChange}
//                 className="w-full border rounded-lg p-2 mb-3"
//                 required
//               />
//               <input
//                 type="text"
//                 name="destination"
//                 placeholder="Destination"
//                 value={rideForm.destination}
//                 onChange={handleRideChange}
//                 className="w-full border rounded-lg p-2 mb-3"
//                 required
//               />
//               <input
//                 type="date"
//                 name="date"
//                 value={rideForm.date}
//                 onChange={handleRideChange}
//                 className="w-full border rounded-lg p-2 mb-3"
//                 required
//               />
//               <input
//                 type="time"
//                 name="time"
//                 value={rideForm.time}
//                 onChange={handleRideChange}
//                 className="w-full border rounded-lg p-2 mb-3"
//                 required
//               />
//               <input
//                 type="number"
//                 name="availableSeats"
//                 placeholder="Available Seats"
//                 value={rideForm.availableSeats}
//                 onChange={handleRideChange}
//                 className="w-full border rounded-lg p-2 mb-4"
//                 required
//               />

//               <button
//                 type="submit"
//                 className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//               >
//                 Add Ride
//               </button>
//             </form>

//             {message && (
//               <p
//                 className={`mt-4 font-semibold ${
//                   message.includes("✅") ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {message}
//               </p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// } 144


import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PassengerApp from "./PassengerApp";
import DriverAddRide from "./DriverAddRide";

export default function App() {
  return (
    <Router>
      <nav className="flex justify-center gap-6 bg-green-800 text-white p-4 font-semibold text-lg">
        <Link to="/" className="hover:text-yellow-300">Passenger</Link>
        <Link to="/driver" className="hover:text-yellow-300">Driver</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PassengerApp />} />
        <Route path="/driver" element={<DriverAddRide />} />
      </Routes>
    </Router>
  );
}
