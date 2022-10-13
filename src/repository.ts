import { ValidationError, Item, ItemId, InventoryCount, Username, Cart, CartItem } from "./domain";

export class StoreRepository {
  private items: Record<string, Item> = {};
  private inventory: Record<string, number> = {};
  private carts: Record<string, Cart> = {};

  // private cartsDisposerList: Record<string,NodeJS.Timeout> = {};

  setItem(item: Item) {
    const isNew = !this.items[item.item_id.id];
    this.items[item.item_id.id] = item;

    if (isNew) {
      this.setItemInventory(item.item_id, new InventoryCount(0));
    }
  }

  getItem(itemId: ItemId) {
    return this.items[itemId.id];
  }

  setItemInventory(itemId: ItemId, amount: InventoryCount) {
    if (!this.items[itemId.id]) throw new ValidationError(`No Item found for id ${itemId.id}`);
    this.inventory[itemId.id] = amount.value;
  }

  getItemInventory(itemId: ItemId) {
    return this.inventory[itemId.id];
  }

  getAllInventory() {
    return this.inventory;
  }

  getUserCart(username: Username) {
    return this.carts[username.value];
  }

  // TODO: DeleteUserCart

  createUserCart(username: Username, itemId: ItemId, quantity: InventoryCount){
    const cart = Cart.create(username.value, itemId.id, quantity.value);
    this.carts[username.value] = cart;
    return cart;
  }
}

export default new StoreRepository();