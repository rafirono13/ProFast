const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 5000;

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//Middleware for Firebase token verification
//This guard checks if a user is logged in.
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized access");
  }
  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).send({ message: "unauthorized access" });
  }
};

// Middleware for verify if it's admin or not
// This guard checks if the logged-in user has the 'admin' role.
// It should always be used *after* verifyToken.
const verifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  const query = { email: email };
  const userCollection = client.db("ProFast").collection("users");
  const user = await userCollection.findOne(query);
  if (user?.role !== "admin") {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;

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

    // --- DataBase Collections ---
    const database = client.db("ProFast");
    const userCollection = database.collection("users");
    const parcelCollection = database.collection("parcels");

    // --- Start Your API Endpoints Here ---
    // !Create and Store USER
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // !Get all user (for admin)
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // !READ to check if a user is an admin
    app.get("/users/admin/:email", async (req, res) => {
      if (req.params.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const user = await userCollection.findOne({ email: req.params.email });
      res.send({ isAdmin: user?.role === "admin" });
    });

    // !Create and Store USER
    // <<------------------------------------------------>>
    // !Parcel API endpoints

    // *Create and Store Parcel
    app.post("/parcels", async (req, res) => {
      const parcelData = req.body;
      const result = await parcelCollection.insertOne(parcelData);
      res.send(result);
    });

    // *READ all parcels (for admin)
    app.get("/parcels", async (req, res) => {
      const result = await parcelCollection.find().toArray();
      res.send(result);
    });

    // *READ all parcels for a specific user
    // LOGGED-IN USER: Get their own parcels.
    app.get("/parcels/user/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { userEmail: req.params.email };
      const result = await parcelCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/parcels/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await parcelCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Parcel not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching parcel:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // *Update a full parcel (for user edits before payment)
    app.put("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const updatedParcelData = req.body;

      // It's a good practice to remove the _id from the body
      // to prevent any errors with MongoDB's immutable _id field.
      delete updatedParcelData._id;
      delete updatedParcelData.userEmail;
      delete updatedParcelData.bookingDate;
      delete updatedParcelData.trackingId;
      delete updatedParcelData.status;
      delete updatedParcelData.deliveryStatus;

      const filter = {
        _id: new ObjectId(id),
        status: "unpaid", // Safety check: Only allow edits on unpaid parcels
      };

      const updateDoc = {
        $set: updatedParcelData,
      };

      const result = await parcelCollection.updateOne(filter, updateDoc);

      // If nothing was modified, it might be because the status wasn't 'unpaid'
      // or the ID was not found.
      if (result.modifiedCount === 0) {
        return res.status(403).send({
          message:
            "Failed to update. The parcel may have already been paid for or does not exist.",
        });
      }

      res.send(result);
    });

    // *Update a parcel status (for admin / rider)
    app.patch("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStaus = req.body; // e.g., { status: "paid", deliveryStatus: "ready-to-pickup" }

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedStaus.status,
          deliveryStatus: updatedStaus.deliveryStatus,
        },
      };
      const result = await parcelCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await parcelCollection.deleteOne(query);
      res.send(result);
    });

    //

    // !Parcel API endpoints
    // <<------------------------------------------------>>
    // --- End Your API Endpoints Here ---

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("API Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
