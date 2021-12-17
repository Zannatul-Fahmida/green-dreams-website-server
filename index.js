const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9pclo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('greenDreams');
        const plantsCollection = database.collection('plants');
        const orderCollection = database.collection("order");

        // GET API
        app.get('/plants', async (req, res) => {
            const cursor = plantsCollection.find({});
            const plants = await cursor.toArray();
            res.send(plants);
        });

        // GET Single Plant
        app.get('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const plant = await plantsCollection.findOne(query);
            res.json(plant);
        })

        // POST API
        app.post('/addPlants', async (req, res) => {
            const newPlant = req.body;
            const result = await plantsCollection.insertOne(newPlant);
            res.json(result)
        });

        // GET Order API
        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //add order in database
        app.post("/addOrder", (req, res) => {
            orderCollection.insertOne(req.body).then((result) => {
                res.json(result);
            });
        });

        // get all order by email query
        app.get("/myOrder/:email", async (req, res) => {
            const cursor = orderCollection.find({ email: req.params.email });
            const result = await cursor.toArray();
            res.json(result);
        });

        // GET Single order
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const ordered = await orderCollection.findOne(query);
            res.json(ordered);
        })

        //Update Status
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'shipped'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // DELETE Order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        // await client.close()
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running green dreams server');
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})