import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function PassengerApp() {
  const [rides, setRides] = useState([]);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);

  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get(`${API}/rides`)
        .then((res) => setRides(res.data))
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!passengerId) return alert("Enter passenger ID!");
    try {
      const res = await axios.post(`${API}/login`, { passenger_id: passengerId });
      if (res.data.success) {
        setIsLoggedIn(true);
        alert("✅ Login successful!");
      } else {
        alert("Invalid Passenger ID!");
      }
    } catch {
      alert("Login failed!");
    }
  };

  const handleBook = async (ride_id) => {
    if (!isLoggedIn) return alert("Please log in first!");
    if (selectedSeats < 1) return alert("Select at least one seat.");
    try {
      const res = await axios.post(`${API}/book-ride`, {
        ride_id,
        passenger_id: passengerId,
        seats: selectedSeats,
      });
      setBooking(res.data);
      alert(`🎟️ Successfully booked ${selectedSeats} seat(s)!`);
    } catch {
      alert("Error booking ride");
    }
  };

  const handlePayment = async () => {
    if (!booking) return alert("No booking found!");
    if (!paymentMethod) return alert("Please select a payment method!");
    try {
      await axios.post(`${API}/make-payment`, {
        booking_id: booking.booking_id,
        payment_method: paymentMethod,
      });
      alert("✅ Payment successful!");
      setBooking(null);
    } catch {
      alert("Error while making payment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-800">🌿 EcoRide Booking</h1>

      {!isLoggedIn ? (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Passenger Login</h2>
          <input
            type="number"
            placeholder="Enter Passenger ID"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {rides.map((ride) => (
              <div key={ride.Ride_ID} className="bg-white shadow-lg rounded-xl p-4">
                <h2 className="text-xl font-semibold text-green-700">
                  {ride.Start_Location} → {ride.Destination}
                </h2>
                <p className="text-gray-600 mt-1">
                  Date: {ride.Date} | Time: {ride.Time}
                </p>
                <p className="text-gray-700 mt-2">Available Seats: {ride.Available_Seats}</p>
                <p className="text-gray-700">Fare: ₹{ride.Fare}</p>

                <div className="mt-3 flex items-center gap-3">
                  <label htmlFor={`seats-${ride.Ride_ID}`} className="text-sm text-gray-700">
                    Seats:
                  </label>
                  <select
                    id={`seats-${ride.Ride_ID}`}
                    value={selectedSeats}
                    onChange={(e) => setSelectedSeats(Number(e.target.value))}
                    className="border rounded-lg px-3 py-1"
                  >
                    {[...Array(ride.Available_Seats).keys()].map((n) => (
                      <option key={n + 1} value={n + 1}>
                        {n + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleBook(ride.Ride_ID)}
                    className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>

          {booking && (
            <div className="mt-8 bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-green-700 mb-2">Booking Confirmed ✅</h3>
              <p>Booking ID: {booking.booking_id}</p>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium">Choose Payment Method:</label>
                <select
                  className="border rounded-lg w-full p-2 mt-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <button
                onClick={handlePayment}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
              >
                Make Payment
              </button>
              <button
              onClick={async () => {
                if (!booking.booking_id) return;
                if (!window.confirm("Cancel your booking?")) return;
                try {
                  await axios.post(`${API}/cancel-booking`, { booking_id: booking.booking_id });
                  alert("❌ Booking cancelled!");
                  setBooking(null);
                } catch {
                  alert("Error cancelling booking");
                }
              }}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full"
            >
              Cancel Booking
            </button>

            </div>
          )}
        </>
      )}
    </div>
  );
}
