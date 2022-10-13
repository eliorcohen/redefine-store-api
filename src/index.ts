import express from "express";
import { AddItemToCartHandler } from "./cart";
import { GetInventoryHandler, UpdateItemInventoryHandler } from "./inventory";
import { SetItemDetailsHandler } from "./items";

const port = 8080;
const app = express();

function usernameProtected(username = 'admin') {
  return (req, res, next) => {
    try {
      if (req.body.username && req.body.username !== username) {
        throw 'Invalid user ID';
      } else {
        next();
      }
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}

app.use(express.json());
const adminProtected = usernameProtected('admin');

// Items
app.post("/api/v1/item", adminProtected, SetItemDetailsHandler);

// Inventory
app.post("/api/v1/inventory", adminProtected, UpdateItemInventoryHandler);
app.post("/api/v1/inventory/query", adminProtected, GetInventoryHandler);

// Cart
app.post("/api/v1/cart/add-item", AddItemToCartHandler);

app.listen(port, () => {
  console.log(`Redefine Store Service Started @ http://localhost:${port}`);
});

export default app
