import { Request } from "express";
import { ValidationError, ItemId, InventoryCount } from "./domain";
import Store from "./repository";

export class UpdateItemInventoryRequest {
  public username: string;
  public itemId: ItemId;
  public amount?: InventoryCount;
  public add?: InventoryCount;
  private constructor(username: string, item_id: string, amount?: number, add?: number) {
    this.username = username;
    this.itemId = new ItemId(item_id);
    this.amount = amount ? new InventoryCount(amount) : null;
    this.add = add ? new InventoryCount(add) : null;

    if (!Store.getItem(this.itemId)) {
      throw new ValidationError(`invalid item_id value: ${this.itemId.id}`);
    }

  }

  static fromRequest(
    req: Request<{}, {}, { username: string; item_id: string; amount?: number, add?: number }>
  ) {
    return new this(req.body.username, req.body.item_id, req.body.amount, req.body.add);
  }
}

export function UpdateItemInventoryHandler(req, res) {
  try {
    const { itemId, add, amount } = UpdateItemInventoryRequest.fromRequest(req);
    
    let inventoryCount = Store.getItemInventory(itemId);
    if (amount instanceof InventoryCount) {
      inventoryCount = amount.value;
    } else if (add instanceof InventoryCount) {
      inventoryCount = inventoryCount + add.value
    }

    Store.setItemInventory(itemId, new InventoryCount(inventoryCount));

    return res.status(200).json({
      "item_id": itemId.id,
      "inventory": inventoryCount
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500);
  }
}

export class GetInventoryRequest {
  public username: string;
  public items?: ItemId[];
  private constructor(username: string, items?: { item_id: string }[]) {
    this.username = username;
    if (items) {
      this.items = [];
      for (let item of items) {
        this.items.push(new ItemId(item.item_id));
      }
    }
  }

  static fromRequest(
    req: Request<{}, {}, { username: string; items?: { item_id: string }[] }>
  ) {
    if (req.body.items) {
      const hasInvalidIds = req.body.items.find((item => Store.getItemInventory(new ItemId(item.item_id)) === undefined));
      if(hasInvalidIds){
        throw new ValidationError(`items list contains invalid item_id\'s : ${hasInvalidIds.item_id}`)
      }
    }

    return new this(req.body.username, req.body.items);
  }
}
export function GetInventoryHandler(req, res) {
  try {
    const { items } = GetInventoryRequest.fromRequest(req);
    let inventoryItems = {};

    if (!items) {
      inventoryItems = Store.getAllInventory();
    } else {
      inventoryItems = items.reduce((agg, cur) => {
        const iVal = Store.getItemInventory(cur);
        if (iVal !== undefined) { agg[cur.id] = iVal; }
        return agg;
      }, {});
    }


    return res.status(200).json({
      "items": Object.entries(inventoryItems).map(entry => ({ item_id: entry[0], inventory: entry[1] }))
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message })
    }
    return res.sendStatus(500);
  }
}
