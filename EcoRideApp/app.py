from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests  


load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASS', ''),
    'database': os.getenv('DB_NAME', 'EcoRideApp'),
    'raise_on_warnings': True
}

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

def get_conn():
    return mysql.connector.connect(**DB_CONFIG)

# --- Health check
@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

# --- Register user
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role')  # 'Driver' or 'Passenger'
    if not all([name,email,phone,password,role]):
        return jsonify({'error':'missing fields'}), 400

    try:
        conn = get_conn()
        cursor = conn.cursor()
        sql = "INSERT INTO User (Name, Email, Phone, Password, Role) VALUES (%s,%s,%s,%s,%s)"
        cursor.execute(sql, (name,email,phone,password,role))
        conn.commit()
        uid = cursor.lastrowid
        # If driver or passenger, insert into their table so relations exist
        if role == 'Driver':
            cursor.execute("INSERT INTO Driver (Driver_ID, License_Number, Driver_Rating, Experience_Years) VALUES (%s, %s, %s, %s)",
                           (uid, data.get('license','NA'), data.get('rating',4.5), data.get('exp',0)))
        else:
            cursor.execute("INSERT INTO Passenger (Passenger_ID, Passenger_Rating, Preferred_Payment) VALUES (%s, %s, %s)",
                           (uid, data.get('rating',4.5), data.get('preferred_payment','UPI')))
        conn.commit()
        return jsonify({'message':'registered','user_id': uid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- Add vehicle (driver)
@app.route('/add-vehicle', methods=['POST'])
def add_vehicle():
    data = request.json
    driver_id = data.get('driver_id')
    license_plate = data.get('license_plate')
    model = data.get('model')
    fuel = data.get('fuel_type')
    seats = data.get('total_seats',4)
    if not all([driver_id,license_plate]):
        return jsonify({'error':'missing fields'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        sql = "INSERT INTO Vehicle (License_Plate, Model, Fuel_Type, Total_Seats, Driver_ID) VALUES (%s,%s,%s,%s,%s)"
        cursor.execute(sql, (license_plate, model, fuel, seats, driver_id))
        conn.commit()
        return jsonify({'message':'vehicle added','vehicle_id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error':str(e)}), 500
    finally:
        cursor.close(); conn.close()

# # --- Add ride (fare is auto calculated by DB trigger)
# @app.route('/add-ride', methods=['POST'])
# def add_ride():
#     data = request.json
#     required = ['start_location','destination','start_lat','start_lon','dest_lat','dest_lon','date','time','available_seats','driver_id']
#     if not all([data.get(k) for k in required]):
#         return jsonify({'error':'missing fields'}), 400
#     try:
#         conn = get_conn()
#         cursor = conn.cursor()
#         sql = """INSERT INTO Ride
#         (Start_Location, Destination, Start_Lat, Start_Lon, Dest_Lat, Dest_Lon, Date, Time, Available_Seats, Driver_ID)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
#         params = (data['start_location'], data['destination'],
#                   data['start_lat'], data['start_lon'], data['dest_lat'], data['dest_lon'],
#                   data['date'], data['time'], data['available_seats'], data['driver_id'])
#         cursor.execute(sql, params)
#         conn.commit()
#         return jsonify({'message':'ride added','ride_id': cursor.lastrowid}), 201
#     except Error as e:
#         return jsonify({'error':str(e)}), 500
#     finally:
#         cursor.close(); conn.close()

# --- List rides (simple)
@app.route('/rides', methods=['GET'])
def list_rides():
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""SELECT R.Ride_ID, R.Start_Location, R.Destination, R.Date, R.Time, R.Available_Seats, R.Fare, R.Driver_ID
                          FROM Ride R WHERE R.Date >= CURDATE()""")
        rows = cursor.fetchall()
        # Convert timedelta/time objects to strings
        for row in rows:
            for key, value in row.items():
                if hasattr(value, "isoformat"):
                    row[key] = value.isoformat()
                elif str(type(value)) == "<class 'datetime.timedelta'>":
                    row[key] = str(value)

        return jsonify(rows)

    except Error as e:
        return jsonify({'error':str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- Create booking (call stored procedure CreateBooking)
@app.route('/book-ride', methods=['POST'])
def book_ride():
    data = request.json
    ride_id = data.get('ride_id')
    passenger_id = data.get('passenger_id')
    seats = data.get('seats',1)
    if not all([ride_id, passenger_id]):
        return jsonify({'error':'missing fields'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.callproc('CreateBooking', (ride_id, passenger_id, seats))
        conn.commit()
        # Find last inserted booking
        cursor.execute("SELECT LAST_INSERT_ID()")
        booking_id = cursor.fetchone()[0]
        return jsonify({'message':'booked','booking_id': booking_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- Make payment (calls procedure CreatePayment which computes amount automatically)
@app.route('/make-payment', methods=['POST'])
def make_payment():
    data = request.json
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method','UPI')
    if not booking_id:
        return jsonify({'error':'missing booking_id'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.callproc('GeneratePayment', (booking_id, payment_method))
        conn.commit()
        return jsonify({'message':'payment recorded'}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- Get passenger bookings
@app.route('/my-bookings/<int:passenger_id>', methods=['GET'])
def my_bookings(passenger_id):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        sql = """SELECT B.Booking_ID, B.Seats_Booked, B.Booking_Status, R.Start_Location, R.Destination, R.Date, R.Time, R.Fare, R.Ride_ID
                 FROM Booking B JOIN Ride R ON B.Ride_ID = R.Ride_ID
                 WHERE B.Passenger_ID = %s"""
        cursor.execute(sql, (passenger_id,))
        rows = cursor.fetchall()
        return jsonify(rows)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- Passenger login (simple check)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    passenger_id = data.get('passenger_id')
    if not passenger_id:
        return jsonify({'success': False, 'message': 'Missing passenger_id'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT Passenger_ID FROM Passenger WHERE Passenger_ID = %s", (passenger_id,))
        passenger = cursor.fetchone()
        if passenger:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Invalid ID'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close(); conn.close()

import requests  # add this at the top if not imported yet

# --- Driver login ---
@app.route('/driver-login', methods=['POST'])
def driver_login():
    data = request.get_json()
    driver_id = data.get('driver_id')
    if not driver_id:
        return jsonify({'success': False, 'message': 'Missing driver_id'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT Driver_ID FROM Driver WHERE Driver_ID = %s", (driver_id,))
        driver = cursor.fetchone()
        if driver:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Invalid ID'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# # --- Add ride with auto coordinates ---
# @app.route('/add-ride-auto', methods=['POST'])
# def add_ride_auto():
#     data = request.json
#     required = ['start_location', 'destination', 'date', 'time', 'available_seats', 'driver_id']
#     if not all([data.get(k) for k in required]):
#         return jsonify({'error': 'missing fields'}), 400

#     def get_coords(place):
#         try:
#             url = f"https://nominatim.openstreetmap.org/search"
#             params = {'q': place, 'format': 'json'}
#             r = requests.get(url, params=params, timeout=5)
#             r.raise_for_status()
#             results = r.json()
#             if results:
#                 return float(results[0]['lat']), float(results[0]['lon'])
#             return None, None
#         except Exception as e:
#             print("Coordinate fetch error:", e)
#             return None, None

#     start_lat, start_lon = get_coords(data['start_location'])
#     dest_lat, dest_lon = get_coords(data['destination'])

#     if not start_lat or not dest_lat:
#         return jsonify({'error': 'could not fetch coordinates'}), 400

#     try:
#         conn = get_conn()
#         cursor = conn.cursor()
#         sql = """INSERT INTO Ride 
#                  (Start_Location, Destination, Start_Lat, Start_Lon, Dest_Lat, Dest_Lon, Date, Time, Available_Seats, Driver_ID)
#                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
#         cursor.execute(sql, (
#             data['start_location'], data['destination'],
#             start_lat, start_lon, dest_lat, dest_lon,
#             data['date'], data['time'], data['available_seats'], data['driver_id']
#         ))
#         conn.commit()
#         return jsonify({'message': 'ride added with coordinates', 'ride_id': cursor.lastrowid}), 201
#     except Error as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         cursor.close(); conn.close()

# --- Add Ride (Fare auto-calculated by DB trigger/function) ---
@app.route('/add-ride', methods=['POST'])
def add_ride():
    data = request.json
    required = ['start_location', 'destination', 'date', 'time', 'available_seats', 'driver_id']
    
    # ✅ Check all required fields
    # if not all([data.get(k) for k in required]):
    #     return jsonify({'error': 'missing fields'}), 400
    print("DEBUG /add-ride data:", data)
    for field in required:
        if field not in data or data[field] in (None, "", []):
            return jsonify({'error': f'missing or empty field: {field}', 'data': data}), 400

        # ✅ Predefined fallback coordinates for Bangalore areas
    FALLBACK_COORDS = {
        "Hebbal": (13.0358, 77.5970),
        "Koramangala": (12.9352, 77.6245),
        "Banashankari": (12.9250, 77.5938),
        "Indiranagar": (12.9784, 77.6408),
        "Whitefield": (12.9698, 77.7499),
    }

    # ✅ Fetch coordinates using OpenStreetMap API
    def get_coords(place):
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {'q': place, 'format': 'json'}
            headers = {
            'User-Agent': 'EcoRideApp/1.0 (contact: rohinilakkimsetty2005@gmail.com)'
            }
            r = requests.get(url, params=params, headers=headers, timeout=10)
            r.raise_for_status()
            results = r.json()
            if results:
                return float(results[0]['lat']), float(results[0]['lon'])
            return None, None
        except Exception as e:
            print("Coordinate fetch error:", e)
            return None, None

    start_lat, start_lon = get_coords(data['start_location'])
    dest_lat, dest_lon = get_coords(data['destination'])

    # if not start_lat or not dest_lat:
    #     return jsonify({'error': 'could not fetch coordinates'}), 400
    if not start_lat or not dest_lat:
        print("⚠️ Fallback coordinates used for testing.")
        start_lat, start_lon = FALLBACK_COORDS.get(
            next((key for key in FALLBACK_COORDS if key.lower() in data['start_location'].lower()), "Hebbal"),
            (12.9716, 77.5946)
        )
        dest_lat, dest_lon = FALLBACK_COORDS.get(
            next((key for key in FALLBACK_COORDS if key.lower() in data['destination'].lower()), "Koramangala"),
            (12.9250, 77.5938)
        )
    try:
        conn = get_conn()
        cursor = conn.cursor()

        # ✅ Fare will be computed automatically by trigger
        insert_sql = """
            INSERT INTO Ride 
            (Start_Location, Destination, Start_Lat, Start_Lon, Dest_Lat, Dest_Lon, 
             Date, Time, Available_Seats, Driver_ID)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cursor.execute(insert_sql, (
            data['start_location'], data['destination'],
            start_lat, start_lon, dest_lat, dest_lon,
            data['date'], data['time'], data['available_seats'], data['driver_id']
        ))

        conn.commit()
        ride_id = cursor.lastrowid
        return jsonify({'message': 'Ride added successfully', 'ride_id': ride_id}), 201

    except Error as e:
        print("DB Error:", e)
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()
# # --- Get rides created by a driver ---
# @app.route('/driver-rides/<int:driver_id>', methods=['GET'])
# def get_driver_rides(driver_id):
#     try:
#         conn = get_conn()
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute("""
#             SELECT Ride_ID, Start_Location, Destination, Date, Time, Available_Seats, Fare 
#             FROM Ride 
#             WHERE Driver_ID = %s
#             ORDER BY Date DESC
#         """, (driver_id,))
#         rides = cursor.fetchall()
#         return jsonify(rides)
#     except Error as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         cursor.close()
#         conn.close()
# --- Get rides created by a driver ---
@app.route('/driver-rides/<int:driver_id>', methods=['GET'])
def get_driver_rides(driver_id):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT Ride_ID, Start_Location, Destination, Date, Time, Available_Seats, Fare 
            FROM Ride 
            WHERE Driver_ID = %s
            ORDER BY Date DESC
        """, (driver_id,))
        rides = cursor.fetchall()

        # ✅ Convert non-serializable fields (like timedelta or datetime)
        for row in rides:
            for key, value in row.items():
                if hasattr(value, "isoformat"):
                    row[key] = value.isoformat()
                elif str(type(value)) == "<class 'datetime.timedelta'>":
                    row[key] = str(value)

        return jsonify(rides)

    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Get environmental impact for a ride ---
@app.route('/environmental-impact/<int:ride_id>', methods=['GET'])
def get_environmental_impact(ride_id):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT EI.Impact_ID, EI.CO2_Saved, EI.Fuel_Saved, EI.Calculation_Date, EI.Ride_ID
            FROM ecorideapp.environmentalimpact EI
            WHERE EI.Ride_ID = %s
        """, (ride_id,))
        impact = cursor.fetchone()
        if not impact:
            print(f"⚠️ No environmental impact for Ride_ID {ride_id}")
            return jsonify({'error': 'No environmental impact found for this ride'}), 404
        return jsonify(impact)
    except Error as e:
        print("❌ DB Error:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# --- Update a ride ---
@app.route('/ride/<int:ride_id>', methods=['PUT'])
def update_ride(ride_id):
    data = request.get_json()
    try:
        conn = get_conn()
        cursor = conn.cursor()
        sql = """
            UPDATE Ride
            SET Start_Location=%s, Destination=%s, Date=%s, Time=%s, Available_Seats=%s
            WHERE Ride_ID=%s
        """
        cursor.execute(sql, (
            data.get('start_location'),
            data.get('destination'),
            data.get('date'),
            data.get('time'),
            data.get('available_seats'),
            ride_id
        ))
        conn.commit()
        return jsonify({'success': True, 'message': 'Ride updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
# # --- Delete a ride ---
# @app.route('/ride/<int:ride_id>', methods=['DELETE'])
# def delete_ride(ride_id):
#     try:
#         conn = get_conn()
#         cursor = conn.cursor()
#         cursor.execute("DELETE FROM Ride WHERE Ride_ID = %s", (ride_id,))
#         conn.commit()
#         if cursor.rowcount == 0:
#             return jsonify({'error': 'Ride not found'}), 404
#         return jsonify({'success': True, 'message': 'Ride deleted successfully'})
#     except Error as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         cursor.close()
#         conn.close()
# --- Delete a ride (safe version that clears dependent bookings) ---
# --- Delete a ride (clears dependent impacts, payments, bookings) ---
@app.route('/ride/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    try:
        conn = get_conn()
        cursor = conn.cursor()

        # ✅ Delete environmental impact data linked to this ride
        cursor.execute("DELETE FROM EnvironmentalImpact WHERE Ride_ID = %s", (ride_id,))

        # ✅ Delete payments linked to this ride (through bookings)
        cursor.execute("""
            DELETE FROM Payment 
            WHERE Booking_ID IN (SELECT Booking_ID FROM Booking WHERE Ride_ID = %s)
        """, (ride_id,))

        # ✅ Delete bookings linked to this ride
        cursor.execute("DELETE FROM Booking WHERE Ride_ID = %s", (ride_id,))

        # ✅ Finally delete the ride itself
        cursor.execute("DELETE FROM Ride WHERE Ride_ID = %s", (ride_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Ride not found'}), 404

        return jsonify({'success': True, 'message': 'Ride, bookings, payments, and environmental impact deleted successfully'})

    except Error as e:
        print("❌ DB Error during delete:", e.msg)
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# --- Cancel a booking ---
@app.route('/cancel-booking', methods=['POST'])
def cancel_booking():
    data = request.get_json()
    booking_id = data.get('booking_id')
    if not booking_id:
        return jsonify({'error': 'Missing booking_id'}), 400
    try:
        conn = get_conn()
        cursor = conn.cursor()
        # Mark as cancelled
        cursor.execute("UPDATE Booking SET Booking_Status = 'Cancelled' WHERE Booking_ID = %s", (booking_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Booking not found'}), 404
        return jsonify({'success': True, 'message': 'Booking cancelled successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(port=5000, debug=True)
