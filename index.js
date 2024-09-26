const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: '*', // Specify your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

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

// Function to read cart data for a specific session
const readCartDataForSession = (sessionId) => {
  const data = readCartData(); // Assume this reads the whole cart data structure
  return data[sessionId] || [] ; // Return the cart for the specific session or an empty array if not found
};

// Function to write cart data for a specific session
const writeCartDataForSession = (sessionId, cartData) => {
  const data = readCartData(); // Read the entire data
  data[sessionId] = cartData; // Update the specific session's cart
  writeCartData(data); // Write back the entire cart data structure
};

// Get all items in the cart for a specific session
app.get('/api/cart/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  try {
    const items = readCartDataForSession(sessionId);
    res.json({ items });
  } catch (error) {
    console.error('Error reading cart data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add items to the cart for a specific session
app.post('/api/cart/add', (req, res) => {
  console.log('/api/cart/add');
  console.log(req.body?.message?.toolCalls[0]?.function?.arguments.Items);
  
  const sessionId = req.body.message.call.id; // Get sessionId from request
  try {
    const items = req.body?.message?.toolCalls[0]?.function?.arguments.Items || req.body.Items;
    const existingItems = readCartDataForSession(sessionId);

    // Loop through the items and add them to the session cart
    items.forEach((item) => {
      const { Id, Name, Price, Quantity, Image } = item;

      const itemIndex = existingItems.findIndex((cartItem) => cartItem.id === Id);

      if (itemIndex >= 0) {
        // Item exists, update quantity
        existingItems[itemIndex].quantity += Number(Quantity);
      } else {
        // Item does not exist, add new item
        existingItems.push({
          id: Id,
          name: Name,
          price: Number(Price),
          quantity: Number(Quantity),
          image: Image,
        });
      }
    });

    // Save the updated items for the session
    writeCartDataForSession(sessionId, existingItems);
    res.json(existingItems);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete or decrease quantity of items from the cart for a specific session
app.post('/api/cart/delete', (req, res) => {
  console.log('/api/cart/delete');
  console.log(req.body?.message?.toolCalls[0]?.function?.arguments.Items);
  
  const sessionId = req.body.message.call.id; // Get sessionId from request
  try {
    const itemsToDelete = req?.body?.message?.toolCalls[0]?.function?.arguments.Items || req?.body?.Items;
    const existingItems = readCartDataForSession(sessionId);

    itemsToDelete.forEach((item) => {
      const { Id, Quantity } = item;

      const itemIndex = existingItems.findIndex((cartItem) => cartItem.id === Id);

      if (itemIndex >= 0) {
        const currentQuantity = existingItems[itemIndex].quantity;
        const newQuantity = currentQuantity - Number(Quantity);

        if (newQuantity > 0) {
          // Update quantity
          existingItems[itemIndex].quantity = newQuantity;
        } else {
          // Remove item
          existingItems.splice(itemIndex, 1);
        }
      }
    });

    // Save the updated items for the session
    writeCartDataForSession(sessionId, existingItems);
    res.json(existingItems);
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Seat purchase endpoint
app.post('/api/cart/seatPurchase', (req, res) => {
  console.log('/api/cart/seatPurchase');
  
  // Extract sessionId from the request
  const sessionId = req.body.message.call.id;

  try {
    const { quantity, description } = req.body?.message?.toolCalls[0]?.function?.arguments; // Extracting quantity and description from the request body

    // Predefined seat purchase data
    const seatItem = { 
      id: 101, // Example ID for seat purchase
      name: 'Tickets', // Example seat name
      price: 23, // Example price per seat
      image: 'https://i.postimg.cc/dtpyn6kc/DALL-E-2024-09-24-21-28-34-A-modern-logo-that-represents-a-ticket-specifically-a-courtside-ticket.webp', // Example image URL
      quantity: Number(quantity), // Convert quantity to a number
      description // Add description directly from the request body
    };

    const cartData = readCartDataForSession(sessionId);

    const itemIndex = cartData.findIndex((item) => item.id === seatItem.id);

    if (itemIndex >= 0) {
      // If the seat item exists, update the quantity
      cartData.items[itemIndex].quantity += seatItem.quantity;
    } else {
      // If the seat item doesn't exist, add it to the cart
      cartData.items.push(seatItem);
    }

    writeCartDataForSession(sessionId, cartData); // Write back the updated cart for the session
    res.json(cartData);
  } catch (error) {
    console.error('Error processing seat purchase:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Seat upgrade endpoint
app.post('/api/cart/seatUpgrade', (req, res) => {
  console.log('/api/cart/seatUpgrade');

  // Extract sessionId from the request
  const sessionId = req.body.message.call.id;

  try {
    // Create a new seat upgrade item based on the custom data from the request
    const seatUpgradeItem = {
      id: 102,
      name: "Court Side Ticket",
      price: 200, 
      image: "https://i.postimg.cc/FRBBtVSN/DALL-E-2024-09-25-14-09-11-A-sleek-premium-looking-courtside-ticket-logo-for-a-sporting-event-Th.webp",
      quantity: 1, 
      description: 'C1, C2, C3'
    };

    const cartData = readCartDataForSession(sessionId);

    const itemIndex = cartData.findIndex((item) => item.id === seatUpgradeItem.id);

    if (itemIndex >= 0) {
      // If the seat upgrade item exists, update the quantity
      cartData.items[itemIndex].quantity += seatUpgradeItem.quantity;
    } else {
      // If the seat upgrade item doesn't exist, add it to the cart
      cartData.items.push(seatUpgradeItem);
    }

    writeCartDataForSession(sessionId, cartData); // Write back the updated cart for the session
    res.json(cartData);
  } catch (error) {
    console.error('Error processing seat upgrade:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

let clients = [];
// API to trigger the web popup
app.post('/api/show-web', (req, res) => {
  console.log('/api/show-web');
  const url = 'https://americanairlinescenter.com/';
  
  // Notify all connected clients to show the popup
  clients.forEach((client) => client.res.write(`data: ${JSON.stringify({ url })}\n\n`));

  res.json({ message: 'Popup triggered successfully' });
});

// API to set up Server-Sent Events (SSE)
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  // Add this client to the list of connected clients
  clients.push({ req, res });

  // When the connection closes, remove the client
  req.on('close', () => {
    clients = clients.filter(client => client.res !== res);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
