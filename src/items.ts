import { Request } from "express";
import { Item, ValidationError } from "./domain";
import Store from './repository';

export class SetItemRequest {
  private constructor(public username: string, public item: Item) { }

  static fromRequest(
    req: Request<{}, {}, { username: string; item_id: string; price: number }>
  ) {
    return new this(req.body.username, Item.create(req.body.item_id, req.body.price));
  }
}

export function SetItemDetailsHandler(req, res) {
  try {
    const { item } = SetItemRequest.fromRequest(req);
    Store.setItem(item);
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message })
    }
    return res.sendStatus(500);
  }
}