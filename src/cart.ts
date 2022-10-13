import { Request } from "express";
import { BadRequestError, Cart, CartItem, InventoryCount, ItemId, Username, ValidationError } from "./domain";
import Store from './repository';

export class AddItemToCartRequest {
  private constructor(public username: Username, public itemId: ItemId, public quantity: InventoryCount) { }

  static fromRequest(
    req: Request<{}, {}, { username: string; item_id: string; quantity: number }>
  ) {
    return new this(new Username(req.body.username), new ItemId(req.body.item_id), new InventoryCount(req.body.quantity));
  }
}

export class RemoveItemToCartRequest {
  private constructor(public username: Username, public itemId: ItemId, public quantity: InventoryCount) { }

  static fromRequest(
    req: Request<{}, {}, { username: string; item_id: string; quantity: number }>
  ) {
    return new this(new Username(req.body.username), new ItemId(req.body.item_id), new InventoryCount(req.body.quantity));
  }
}

function getCartSummary(cart: Cart) {
  const cartItems = Object.values(cart.items);
  let totalCost = 0;

  for (let item of cartItems) {
    const itemDetails = Store.getItem(item.item_id);
    const itemPrice = itemDetails.price.value * item.quantity;

    totalCost += itemPrice;
  }

  return {
    total_cost: totalCost,
    items: cartItems,
  };
}

export function AddItemToCartHandler(req, res) {
  try {
    const { itemId, quantity, username } = AddItemToCartRequest.fromRequest(req);
    const itemInventory = Store.getItemInventory(itemId);

    if(itemInventory < quantity.value){
      throw new BadRequestError(`Store inventory is not sufficient, items in inventory: ${itemInventory}`)
    }

    let userCart = Store.getUserCart(username);
    if (!userCart) {
      userCart = Store.createUserCart(username, itemId, quantity);
    } else {
      userCart.addItem(new CartItem(itemId, quantity.value));
    }

    Store.setItemInventory(itemId, new InventoryCount(itemInventory - quantity.value))

    return res.status(200).json(getCartSummary(userCart));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message })
    }
    return res.sendStatus(500);
  }
}

// export function RemoveItemFromCartHandler(req, res) {
//   try {
//     const { itemId, quantity, username } = AddItemToCartRequest.fromRequest(req);
//     let userCart = Store.getUserCart(username);
//     if (!userCart) {
//       throw new BadRequestError('Cart not exists');
//     }
    
    
//     // userCart.removeItem(new CartItem(itemId, quantity.value));

//     return res.status(200).json(getCartSummary(userCart));
//   } catch (error) {
//     if (error instanceof ValidationError || error instanceof BadRequestError) {
//       return res.status(400).json({ message: error.message })
//     }
    
//     return res.sendStatus(500);
//   }
// }