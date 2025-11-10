const express = require('express')
const cors=require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;


//middleware
app.use(cors())
app.use(express.json())

//onlineLearningDB
//BmmexGv78Yw8ey18

const uri = "mongodb+srv://onlineLearningDB:BmmexGv78Yw8ey18@cluster0.5w0kzva.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})


async function run() {
    try{
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    

      const db = client.db('learningDB');
      //collections
      const coursesCollection = db.collection('courses');


      //post api
       app.post('/courses', async (req, res) => {
            const newcourse = req.body;
            const result = await coursesCollection.insertOne(newcourse);
            res.send(result);
        })

     //get all courses
     app.get('/courses', async (req, res) => {
          const query=req.body

            const cursor = coursesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });
      //6 courses by feature field
      app.get('/feature-courses', async (req, res) => {
            const cursor = coursesCollection.find({isFeatured: true }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
      //filter by course category
      app.get("/filter", async(req, res) => {
      const filter_category = req.query.search
      const result = await coursesCollection.find({category: {$regex: filter_category, $options: "i"}}).toArray()
      res.send(result)
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally{

    }

}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
