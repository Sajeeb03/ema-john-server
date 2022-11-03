const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { query } = require('express');

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const uri = 'mongodb://0.0.0.0:27017';
const client = new MongoClient(uri);

const dbConnect = async () => {
    try {
        await client.connect();
        console.log('db connected');
    } catch (error) {
        console.log(error.name, error.message)
    }
}

dbConnect();

const Products = client.db("ema-john").collection("products");

app.post('/products', async (req, res) => {
    const result = await Products.insertOne(req.body);
    res.send(result)
})

app.get('/products', async (req, res) => {
    try {

        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size)

        const result = await Products.find({}).skip(page * size).limit(size).toArray();
        const count = await Products.estimatedDocumentCount();
        res.send({
            success: true,
            count,
            products: result
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.post('/productsByIds', async (req, res) => {
    const ids = req.body;
    const objIds = ids.map(id => ObjectId(id))
    console.log(objIds)
    const query = { _id: { $in: objIds } };
    const cursor = Products.find(query);
    const result = await cursor.toArray();
    // console.log(result)
    res.send(result)
})


app.get('/', (req, res) => {
    res.send('Server is on')
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`)
})