const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/* // ------------------ MONGODB SETUP (Cmd+K, Cmd+U to uncomment) ------------------

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect(); // Connect to MongoDB on startup

    // --- Start Your API Endpoints Here ---
    
    // Example: app.get('/users', async (req, res) => { ... });

    // --- End Your API Endpoints Here ---

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// -------------------------------------------------------------------------- 
*/


app.get('/', (req, res) => {
  res.send('API Server is running...');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
