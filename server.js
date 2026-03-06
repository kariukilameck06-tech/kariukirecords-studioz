// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // allow cross-origin requests
app.use(bodyParser.json());

// In-memory storage for bookings
let bookings = [];

// POST: Save booking
app.post('/api/save-booking', (req, res) => {
  const { name, email, service, message, phone, method, amount, status, date } = req.body;

  if (!name || !service || !phone || !method || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const booking = {
    name,
    email,
    service,
    message,
    phone,
    method,
    amount: Number(amount),
    status,
    date: date || new Date().toISOString()
  };

  bookings.push(booking);

  console.log("New booking saved:", booking);
  res.status(200).json({ success: true, booking });
});

// GET: Admin dashboard data
app.get('/api/admin-data', (req, res) => {
  try {
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalBookings = bookings.length;

    // Calculate top service
    const serviceCount = {};
    bookings.forEach(b => {
      serviceCount[b.service] = (serviceCount[b.service] || 0) + 1;
    });
    let topService = "-";
    if (Object.keys(serviceCount).length) {
      topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Revenue by service
    const revenueByService = bookings.reduce((acc, b) => {
      acc[b.service] = (acc[b.service] || 0) + Number(b.amount);
      return acc;
    }, {});

    // Chart data (Bookings per day)
    const chart = {
      labels: bookings.map(b => new Date(b.date).toLocaleDateString()),
      values: bookings.map(_ => 1)
    };

    res.json({
      totalRevenue,
      totalBookings,
      topService,
      revenueByService,
      payments: bookings,
      chart
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));