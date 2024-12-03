const http = require('http');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://mgoru1:Medha%40217@cluster0.qtpeb.mongodb.net/plantcare?retryWrites=true&w=majority';

const client = new MongoClient(MONGO_URI);

async function fetchPlantData() {
  try {
    await client.connect();
    const db = client.db('plantcare'); // Replace 'plantcare' with your database name if different
    const collection = db.collection('plants'); // Replace 'plants' with your collection name
    return await collection.find({}).toArray();
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api') {
    try {
      const plantData = await fetchPlantData();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(plantData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch data' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
