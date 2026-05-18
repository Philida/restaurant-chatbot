# Restaurant ChatBot 🍔

A full-stack restaurant chatbot application built with:

- Node.js
- Express.js
- MongoDB Atlas
- HTML/CSS/JavaScript

The chatbot allows customers to place food orders, manage their cart, checkout orders, and simulate payments through a conversational interface.

---

## Features

- Place food orders
- View current order
- Remove items from order
- Checkout system
- Mock payment integration
- Order history
- MongoDB session persistence
- Quantity selection for items
- Chat-style user interface
- Persistent user sessions

---

## Payment Integration

This project includes a mock payment workflow designed to simulate the payment process during checkout.

Paystack integration was planned for live payment processing using test API keys. Due to onboarding restrictions during development, a simulated payment confirmation system was implemented instead.

The architecture is structured in a way that allows easy future integration with:
- Paystack
- Stripe
- Flutterwave
- Other payment gateways

---

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- HTML5
- CSS3
- Vanilla JavaScript

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Philida/restaurant-chatbot.git
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file and add:

```env
MONGO_URI=your_mongodb_connection_string
```

---

## Run Project

```bash
node index.js
```

The application will run on:

```text
http://localhost:5000
```

---

## Live Demo

https://restaurant-chatbot-coks.onrender.com


## Future Improvements

- Real Paystack payment integration
- Scheduled food orders
- Authentication system
- Admin dashboard
- Real-time notifications
- Responsive mobile improvements

---

## Author

Philida