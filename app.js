const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory data store
const rooms = [];
const bookings = [];

// 1. Create Room
app.post('/rooms', (req, res) => {
  const { room_name, seats_available, amenities, price_per_hour } = req.body;
  const room = {
    room_id: (rooms.length + 1).toString(),
    room_name,
    seats_available,
    amenities,
    price_per_hour
  };
  rooms.push(room);
  res.json({ room_id: room.room_id, message: 'Room created successfully.' });
});

// 2. Book a Room
app.post('/bookings', (req, res) => {
  const { customer_name, date, start_time, end_time, room_id } = req.body;
  const room = rooms.find(r => r.room_id === room_id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  const booking = {
    booking_id: (bookings.length + 1).toString(),
    customer_name,
    date,
    start_time,
    end_time,
    room_id,
    booking_status: 'confirmed',
    booking_date: new Date().toISOString()
  };

  bookings.push(booking);
  res.json({ booking_id: booking.booking_id, message: 'Booking successful.' });
});

// 3. List all Rooms with Booked Data
app.get('/rooms/bookings', (req, res) => {
  const roomBookings = rooms.map(room => {
    const booking = bookings.find(b => b.room_id === room.room_id);
    return {
      room_name: room.room_name,
      booked_status: !!booking,
      customer_name: booking ? booking.customer_name : null,
      date: booking ? booking.date : null,
      start_time: booking ? booking.start_time : null,
      end_time: booking ? booking.end_time : null
    };
  });

  res.json(roomBookings);
});

// 4. List all Customers with Booked Data
app.get('/customers/bookings', (req, res) => {
  const customerBookings = bookings.map(booking => ({
    customer_name: booking.customer_name,
    room_name: rooms.find(room => room.room_id === booking.room_id).room_name,
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time
  }));

  res.json(customerBookings);
});

// 5. List Customer Booking History
app.get('/customers/:customer_id/booking-history', (req, res) => {
  const customerHistory = bookings
    .filter(booking => booking.customer_name === req.params.customer_id)
    .map(booking => ({
      booking_id: booking.booking_id,
      room_name: rooms.find(room => room.room_id === booking.room_id).room_name,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      booking_date: booking.booking_date,
      booking_status: booking.booking_status
    }));

  res.json(customerHistory);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
