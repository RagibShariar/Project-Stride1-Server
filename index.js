const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// jwt token create 
const createToken = (user) => {
  const token = jwt.sign({
    email: user.email,
  }, 'secret', { expiresIn: '7d' });
  return token;
}

// verify token 
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}




// MongoDB Connections

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iki4bfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    app.put("/products/:id", verifyToken, async (req, res) => {
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

    // create/add a new product to database - POST
    app.post("/products", verifyToken, async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // delete a single product from database - DELETE
    app.delete("/products/:id", verifyToken, async (req, res) => {
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
    app.put("/users/:id", verifyToken, async (req, res) => {
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
      const token = createToken(newUser);
      // console.log(token);
      const isUserExist = await userCollection.findOne({email: newUser.email});
      if (isUserExist?._id) {
        return res.send({
          status: 'success',
          message: 'Login successful',
          token,
        });
      }
       await userCollection.insertOne(newUser);
      res.send({token});
    });

    // delete a single user from database - DELETE
    app.delete("/users/:id", verifyToken, async (req, res) => {
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
  res.send("welcome to the planet");
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});

