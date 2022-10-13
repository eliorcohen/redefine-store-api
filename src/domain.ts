export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class InventoryCount {
  public constructor(public value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError(`Invalid item inventory amount: ${value}`);
    }
  }
}
export class Username {
  public constructor(public value: string) {
    if (!value || typeof value !== 'string') {
      throw new ValidationError(`Invalid Username: ${value}`);
    }
  }
}

export class ItemId {
  public constructor(public id: string) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError(`Invalid Item id: ${id}`);
    }
  }
}
export class ItemPrice {
  public constructor(public value: number) {
    if (typeof value !== 'number' || value <= 0) {
      throw new ValidationError(`Invalid Item Price: ${value}`);
    }
  }
}

export class Item {
  item_id: ItemId;
  price: ItemPrice;

  private constructor(id: ItemId, price: ItemPrice) {
    this.item_id = id;
    this.price = price;
  }

  static create(id: string, price: number) {
    return new this(new ItemId(id), new ItemPrice(price));
  }
}

export class CartItem {
  public constructor(public item_id: ItemId, public quantity: number) {

  }
}

export class Cart {

  public items: Record<string, CartItem> = {};

  private constructor(public id: Username, private item: CartItem) {
    this.addItem(item);
  }

  public addItem(item: CartItem) {
    if (!this.items[item.item_id.id]) {
      this.items[item.item_id.id] = item;
    } else {
      this.items[item.item_id.id].quantity += item.quantity
    }
  }

  // TODO: RemoveItem

  static create(username: string, item_id: string, quantity: number) {
    return new this(
      new Username(username),
      new CartItem(new ItemId(item_id), quantity)
    );
  }
}