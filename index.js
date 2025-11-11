const express = require('express')
const cors=require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;
//console.log(process.env) 



const serviceAccount = require("./online-learning-platform-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



//middleware
app.use(cors())
app.use(express.json())

const verifyFireBaseToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    // verify token
    try {
        
        const userInfo=await admin.auth().verifyIdToken(token);
        req.token_email = userInfo.email;
        console.log('after token validation', userInfo);
        next();
    }
    catch {
        console.log('invalid token')
        return res.status(401).send({ message: 'unauthorized access' })
    }

}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5w0kzva.mongodb.net/?appName=Cluster0`;

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
        
           const cursor = coursesCollection.find();
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

     //get api(get a specific course)
    app.get("/courses/:id",verifyFireBaseToken,async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result = await coursesCollection.findOne(query);
        //console.log(result)
        res.send(result)
    })
    //get only a user added courses
    app.get("/my-courses", verifyFireBaseToken, async(req, res) => {
      const email = req.query.email
       if (email !== req.token_email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
      const result = await coursesCollection.find({added_by: email}).toArray()
      res.send(result)
    })

    //my course delete
    app.delete('/courses/:id',async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coursesCollection.deleteOne(query);
            res.send(result);
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
