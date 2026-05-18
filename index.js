require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Session = require("./models/Session");

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected ✅");
})
.catch((err) => {
  console.log(err);
});

app.use(cors());
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const PORT = 5000;

// Chat route
app.post("/chat", async (req, res) => {

  try {

    let { message, sessionId } = req.body;

    let session;

    // Find existing session
    if (sessionId) {

      session = await Session.findOne({
        sessionId
      });
    }

    // Create new session
    if (!session) {

      sessionId = uuidv4();

      session = new Session({

        sessionId,

        currentOrder: [],

        orderHistory: [],

        state: "HOME",

        pendingItem: null

      });

    }

    // Handle chatbot logic
    let response = handleUserInput(
      message,
      session
    );

    // Save session
    await session.save();

    res.json({
      sessionId: session.sessionId,
      response
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      response: "Server error"
    });
  }

});

// Handle user input
function handleUserInput(input, session) {

  // HOME STATE
  if (session.state === "HOME") {

    switch (input) {

      case "1":

        session.state = "ORDERING";

        return `Menu 🍔

1. Burger - $10
2. Pizza - $15
3. Shawarma - $8
4. Drink - $5

Select an item number`;

      case "99":

        if (session.currentOrder.length === 0) {
          return "No order to place.";
        }

        session.state = "PAYMENT";

        const total = calculateTotal(
          session.currentOrder
        );

        return `💳 Payment

Order total: $${total}

Select:
1 - Confirm Payment
0 - Cancel`;

      case "98":

        if (session.orderHistory.length === 0) {
          return "No order history.";
        }

        let history = "📦 Order History\n\n";

        session.orderHistory.forEach((order, index) => {

          history += `Order ${index + 1}\n`;

          let total = 0;

          order.forEach(item => {

            history += `- ${item.name} - $${item.price}\n`;

            total += item.price;

          });

          history += `Total: $${total}\n\n`;

        });

        return history;

      case "97":

        return formatOrder(session.currentOrder);

      case "0":

        session.currentOrder = [];

        return "Order cancelled.";

      default:

        return `Invalid option.

Select:
1 - Place Order
99 - Checkout
98 - History
97 - Current Order
0 - Cancel`;
    }
  }

  // ORDERING STATE
  if (session.state === "ORDERING") {

    // Remove item
    if (input.startsWith("remove")) {

      const parts = input.split(" ");

      const itemNumber = parseInt(parts[1]);

      if (
        isNaN(itemNumber) ||
        itemNumber < 1 ||
        itemNumber > session.currentOrder.length
      ) {
        return "Invalid item number.";
      }

      const removedItem =
        session.currentOrder.splice(itemNumber - 1, 1);

      return `${removedItem[0].name} removed successfully ✅`;
    }

    return handleMenuSelection(
      input,
      session
    );
  }

  // QUANTITY STATE
  if (session.state === "QUANTITY") {

    const quantity = parseInt(input);

    if (isNaN(quantity) || quantity <= 0) {
      return "Please enter a valid quantity.";
    }

    for (let i = 0; i < quantity; i++) {

      session.currentOrder.push(
        session.pendingItem
      );
    }

    const itemName = session.pendingItem.name;

    session.pendingItem = null;

    session.state = "ORDERING";

    return `${quantity} ${itemName}(s) added 🛒

Select another item:

1. Burger
2. Pizza
3. Shawarma
4. Drink

99 - Checkout
97 - View Current Order
0 - Cancel Order`;
  }

  // PAYMENT STATE
  if (session.state === "PAYMENT") {

    // Confirm payment
    if (input === "1") {

      session.orderHistory.push([
        ...session.currentOrder
      ]);

      session.currentOrder = [];

      session.state = "HOME";

      return `Payment successful ✅

Order placed successfully 🎉

Select:
1 - Place New Order
98 - View Order History`;
    }

    // Cancel payment
    if (input === "0") {

      session.state = "ORDERING";

      return `Payment cancelled.

Select:
97 - View Current Order
99 - Checkout`;
    }

    return `Invalid option.

Select:
1 - Confirm Payment
0 - Cancel`;
  }
}

// Menu selection
function handleMenuSelection(input, session) {

  const menu = {

    "1": {
      name: "Burger",
      price: 10
    },

    "2": {
      name: "Pizza",
      price: 15
    },

    "3": {
      name: "Shawarma",
      price: 8
    },

    "4": {
      name: "Drink",
      price: 5
    }

  };

  // Add item
    // Add item
  if (menu[input]) {

    session.pendingItem = menu[input];

    session.state = "QUANTITY";

    return `How many ${menu[input].name} would you like?`;
  }

  // Checkout
  if (input === "99") {

    if (session.currentOrder.length === 0) {
      return "No order to place.";
    }

    session.state = "PAYMENT";

    const total = calculateTotal(
      session.currentOrder
    );

    return `💳 Payment

Order total: $${total}

Select:
1 - Confirm Payment
0 - Cancel`;
  }

  // Current order
  if (input === "97") {

    return formatOrder(session.currentOrder);
  }

  // Cancel order
  if (input === "0") {

    session.currentOrder = [];

    session.state = "HOME";

    return "Order cancelled.";
  }

  return "Invalid menu option.";
}

// Calculate total
function calculateTotal(order) {

  let total = 0;

  order.forEach(item => {
    total += item.price;
  });

  return total;
}

// Format order
function formatOrder(order) {

  if (order.length === 0) {
    return "No current order.";
  }

  let message = "🛒 Current Order\n\n";

  let total = calculateTotal(order);

  order.forEach((item, index) => {

    message += `${index + 1}. ${item.name} - $${item.price}\n`;

  });

  message += `\nTotal: $${total}`;

  message += `

Type:
remove 1
remove 2
etc... to remove an item`;

  return message;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});