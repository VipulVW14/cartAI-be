const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: '*', // Or specify a specific domain if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Add more headers if needed
  credentials: true, // Set to true if you need to send cookies or other credentials
};

// Use CORS with the specified options
app.use(cors(corsOptions));

// Path to the cart data JSON file
const cartDataPath = path.join(__dirname, 'cartData.json');

// Middleware
app.use(bodyParser.json());

// Helper function to read cart data
const readCartData = () => {
  const data = fs.readFileSync(cartDataPath);
  return JSON.parse(data);
};

// Helper function to write cart data
const writeCartData = (data) => {
  fs.writeFileSync(cartDataPath, JSON.stringify(data, null, 2));
};

// Get all items in the cart
app.get('/api/cart', (req, res) => {
  try {
    const data = readCartData();
    res.json(data);
  } catch (error) {
    console.error('Error reading cart data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add an item to the cart
app.post('/api/cart/add', (req, res) => {
  console.log(req.body?.message?.toolCalls[0]?.function?.arguments);
  try {
    const { id, name, price, quantity, image } = req.body?.message?.toolCalls[0]?.function?.arguments || req.body;
    const data = readCartData();

    const itemIndex = data.items.findIndex((item) => item.id === id);

    if (itemIndex >= 0) {
      // Item exists, update quantity (convert to number to ensure proper addition)
      data.items[itemIndex].quantity += Number(quantity);
    } else {
      // Item does not exist, add new item (ensure quantity is a number)
      data.items.push({ id, name, price, quantity: Number(quantity), image });
    }

    writeCartData(data);
    res.json(data);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove an item or decrease its quantity
app.post('/api/cart/remove', (req, res) => {
  console.log(req.body?.message?.toolCalls[0]?.function?.arguments);
  try {
    const { id, quantity } = req?.body?.message?.toolCalls[0]?.function?.arguments || req?.body;
    const data = readCartData();

    const itemIndex = data.items.findIndex((item) => item.id === id);

    if (itemIndex >= 0) {
      // Decrease quantity if greater than 1
      if (data.items[itemIndex].quantity > 1) {
        data.items[itemIndex].quantity -= 1;
      } else {
        // Remove item if quantity is 1
        data.items.splice(itemIndex, 1);
      }

      writeCartData(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an item from the cart
app.post('/api/cart/delete', (req, res) => {
  console.log(req.body?.message?.toolCalls[0]?.function?.arguments);
  try {
    const { id } = req?.body?.message?.toolCalls[0]?.function?.arguments || req?.body ;
    const data = readCartData();

    const updatedItems = data.items.filter((item) => item.id !== id);
    data.items = updatedItems;

    writeCartData(data);
    res.json(data);
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
