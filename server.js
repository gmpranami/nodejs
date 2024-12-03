const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://mgoru1:Medha%40217@cluster0.qtpeb.mongodb.net/plantcare?retryWrites=true&w=majority';

const client = new MongoClient(MONGO_URI);

// Function to fetch data from MongoDB
async function fetchPlantData() {
  try {
    await client.connect();
    const db = client.db('plantcare'); // Replace 'plantcare' with your database name
    const collection = db.collection('plants'); // Replace 'plants' with your collection name
    return await collection.find({}).toArray();
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  // Handling API route to fetch plant data from MongoDB
  if (req.url === '/api') {
    try {
      const plantData = await fetchPlantData();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Enable CORS for API requests
      });
      res.end(JSON.stringify(plantData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch data' }));
    }
  } else {
    // Serve static files from the "public" directory for frontend requests
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 Internal Server Error</h1>', 'utf-8');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
