const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connections
const uri =
  "mongodb+srv://srragib:ksyHGbpzjHXqI5s8@cluster0.iki4bfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const productDB = client.db("productDB");
    const productCollection = productDB.collection("productCollection");
    const userDB = client.db("UserDB");
    const userCollection = userDB.collection("userCollection");

    // get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // get a single product - GET
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // update a single product - PUT/PATCH
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      // console.log(updatedData)
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const result = await productCollection.updateOne(
        filter,
        { $set: updatedData },
        option
      );
      res.send(result);
    });

    // create a new product to database - POST
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // delete a single product from database - DELETE
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("please delete product id: ", id);
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // User CRUD

    // get all users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get a single user - GET
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    // update a single user - PUT/PATCH
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      // console.log(updatedData);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const result = await userCollection.updateOne(
        filter,
        { $set: updatedData },
        option
      );
      res.send(result);
    });

    // create a new user to database - POST
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const isUserExist = await userCollection.findOne({email: newUser.email});
      if (isUserExist?._id) {
        return res.send("login success");
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // delete a single user from database - DELETE
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("please delete user id: ", id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome sample");
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});

// srragib
// ksyHGbpzjHXqI5s8

// srragib
// 5zFI5vw60uQxRyIT
