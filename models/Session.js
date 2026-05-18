const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({

  sessionId: {
    type: String,
    required: true
  },

  currentOrder: {
    type: Array,
    default: []
  },

  orderHistory: {
    type: Array,
    default: []
  },

  state: {
    type: String,
    default: "HOME"
  },

  pendingItem: {
    type: Object,
    default: null
  }

});

module.exports = mongoose.model(
  "Session",
  SessionSchema
);