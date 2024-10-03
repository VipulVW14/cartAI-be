# Backend API Documentation

This document outlines the API endpoints and requirements for the frontend application.

## API Endpoints

### 1. Get Cart Data (SSE)
- **Endpoint:** `/api/cart/sse/:sessionId`
- **Method:** `GET`
- **Description:** Retrieves the cart data for a specific session using Server-Sent Events (SSE).
- **Parameters:**
  - `sessionId`: The ID of the session.
- **Response:** The cart data for the specified session.

### 2. Add Items to Cart
- **Endpoint:** `/api/cart/add`
- **Method:** `POST`
- **Description:** Adds items to the cart for a specific session.
- **Request Body:**
  - `sessionId`: The ID of the session.
  - `items`: An array of items to add to the cart.
    - Each item should contain:
      - `id`: The item ID.
      - `quantity`: The quantity of the item to add.
- **Response:** The updated cart data for the specified session.

### 3. Delete or Decrease Quantity of Items from Cart
- **Endpoint:** `/api/cart/delete`
- **Method:** `POST`
- **Description:** Deletes or decreases the quantity of items from the cart for a specific session.
- **Request Body:**
  - `sessionId`: The ID of the session.
  - `items`: An array of items to delete or decrease from the cart.
    - Each item should contain:
      - `id`: The item ID.
      - `quantity`: The quantity to delete or a negative number to decrease.
- **Response:** The updated cart data for the specified session.

### 4. Seat Purchase
- **Endpoint:** `/api/cart/seatPurchase`
- **Method:** `POST`
- **Description:** Processes a seat purchase for a specific session.
- **Request Body:**
  - `sessionId`: The ID of the session.
  - `quantity`: The quantity of seats to purchase.
  - `description`: The description of the seats.
- **Response:** The updated cart data for the specified session.

### 5. Seat Upgrade
- **Endpoint:** `/api/cart/seatUpgrade`
- **Method:** `POST`
- **Description:** Processes a seat upgrade for a specific session.
- **Request Body:**
  - `sessionId`: The ID of the session.
  - `quantity`: The number of seats to upgrade.
- **Response:** The updated cart data for the specified session.

### 6. Trigger Web Popup
- **Endpoint:** `/api/show-web`
- **Method:** `POST`
- **Description:** Triggers a web popup for all connected clients.
- **Request Body:**
  - `url`: The URL to display in the popup.
- **Response:** A success message.

### 7. Set up Server-Sent Events (SSE)
- **Endpoint:** `/events`
- **Method:** `GET`
- **Description:** Sets up Server-Sent Events (SSE) for the application.
- **Response:** The SSE event stream.

## Requirements

- The frontend application should send requests to the API endpoints with the required parameters and request bodies.
- The frontend application should handle the responses from the API endpoints and update the application state accordingly.
- The frontend application should use the `sessionId` parameter to identify the session and retrieve the corresponding cart data.
- The frontend application should use the `Items` parameter to add, delete, or decrease the quantity of items in the cart.
- The frontend application should use the `quantity` and `description` parameters to process seat purchases and upgrades.
