import App from './index'
import supertest from 'supertest';

const request = supertest(App)

describe('Store Administration', () => {
    describe('Set Item Details', () => {
        test('Happy Flow: Set item Details', async () => {
            const response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "387",
                    "price": 50
                });

            expect(response.status).toEqual(200);
            await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "388",
                    "price": 100
                });
        })
        test('Secure Resource', async () => {
            const response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "Non-Admin",
                    "item_id": "387",
                    "price": 0.1
                });

            expect(response.status).toEqual(401);
        })
        test('Valid Request: Empty', async () => {
            const response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                });

            expect(response.status).toEqual(400);
        })
        test('Valid Request: Invalid Item Price', async () => {
            let response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "001",
                    "price": 0
                });

            expect(response.status).toEqual(400);
            expect(response.text).toMatch(/Invalid Item Price/)

            response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "001",
                    "price": -1
                });

            expect(response.status).toEqual(400);
            expect(response.text).toMatch(/Invalid Item Price/)

            response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "001",
                    "price": NaN
                });

            expect(response.status).toEqual(400);
            expect(response.text).toMatch(/Invalid Item Price/)

            response = await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "001",
                    "price": "100"
                });

            expect(response.status).toEqual(400);
            expect(response.text).toMatch(/Invalid Item Price/)
        })
    });

    describe('Update Inventory', () => {
        test('Happy Flow: Update inventory for Item', async () => {
            const response = await request
                .post('/api/v1/inventory')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "387",
                    "amount": 10
                });

            expect(response.status).toEqual(200);
        })
        test('Happy Flow: add Inventory', async () => {
            await request
                .post('/api/v1/item')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "AddTest",
                    "price": 50
                });


            const response = await request
                .post('/api/v1/inventory')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "item_id": "AddTest",
                    "add": 10
                });

            expect(response.status).toEqual(200);
        })
    });

    describe('Get Inventory', () => {
        test('Happy Flow: Get Inventory - Full List', async () => {
            const response = await request
                .post('/api/v1/inventory/query')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                });

            expect(response.body).toEqual({
                "items": [{ "inventory": 10, "item_id": "387" }, { "inventory": 0, "item_id": "388" }, {
                    "item_id": "AddTest", "inventory": 10
                }]
            });
            expect(response.status).toEqual(200);
        })
        test('Happy Flow: Get Inventory - Items List ', async () => {
            const response = await request
                .post('/api/v1/inventory/query')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "items": [{ "item_id": "387" }]
                });

            expect(response.body).toEqual({ "items": [{ "inventory": 10, "item_id": "387" }] });
            expect(response.status).toEqual(200);
        })
        test('Secure Resource', async () => {
            const response = await request
                .post('/api/v1/inventory/query')
                .set('Accept', 'application/json')
                .send({
                    "username": "Non-Admin",
                    "items": [{ "item_id": "387" }]
                });

            expect(response.status).toEqual(401);
        })
        test('Request Validation: Invalid ItemId in List', async () => {
            const response = await request
                .post('/api/v1/inventory/query')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "items": [{ "item_id": "NotValid" }]
                });

            expect(response.text).toMatch(/items list contains invalid item_id's : NotValid/)
            expect(response.status).toEqual(400);
        })
    });
});

describe('Client (Cart)', () => {
    describe('Add Item to Cart', () => {
        test('Happy Flow: Add An Item to the cart - First Time', async () => {
            const response = await request
                .post('/api/v1/cart/add-item')
                .set('Accept', 'application/json')
                .send({ "username": "mike", "item_id": "387", "quantity": 2 });

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({ "total_cost": 100, "items": [{ "item_id": { "id": "387" }, "quantity": 2 }] })

            // Expect Inventory Adjustment
            const inventory_response = await request
                .post('/api/v1/inventory/query')
                .set('Accept', 'application/json')
                .send({
                    "username": "admin",
                    "items": [{ "item_id": "387" }]
                });

            expect(inventory_response.body).toEqual({ "items": [{ "inventory": 8, "item_id": "387" }] });
            expect(inventory_response.status).toEqual(200);

        });

        test('Happy Flow: Add An Item to the cart - Addition', async () => {
            const response = await request
                .post('/api/v1/cart/add-item')
                .set('Accept', 'application/json')
                .send({ "username": "mike", "item_id": "387", "quantity": 2 });

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({ "total_cost": 200, "items": [{ "item_id": { "id": "387" }, "quantity": 4 }] })
        });
    });

    // Remove item from cart
    // Cart Deletion
    // Cart Expirations Time
    // Purchase items in cart
});