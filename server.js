// Import required modules
const http = require('http'); // To create an HTTP server
const fs = require('fs'); // To handle file system operations (e.g., reading files)
const path = require('path'); // To handle and transform file paths
const { MongoClient } = require('mongodb'); // To interact with MongoDB

// Define server port and MongoDB connection URI
const PORT = process.env.PORT || 3000; // Set port to environment variable or default to 3000
const MONGO_URI = 'mongodb+srv://mgoru1:Medha%40217@cluster0.qtpeb.mongodb.net/plantcare?retryWrites=true&w=majority'; // MongoDB connection URI

// Create a new MongoClient instance to interact with MongoDB
const client = new MongoClient(MONGO_URI);

// Function to fetch plant data from MongoDB
async function fetchPlantData() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('plantcare'); // Access 'plantcare' database
    const collection = db.collection('plants'); // Access 'plants' collection
    // Fetch all documents from the 'plants' collection and return as an array
    return await collection.find({}).toArray();
  } catch (err) {
    console.error('Database connection error:', err); // Log error if connection fails
    throw err; // Throw the error so it can be handled elsewhere
  }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  // Check if the request is for the '/api' endpoint
  if (req.url === '/api') {
    try {
      // Fetch plant data from MongoDB
      const plantData = await fetchPlantData();
      // Set response header to specify JSON content and allow CORS
      res.writeHead(200, {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' // Allow CORS for frontend requests
      });
      // Send the plant data as a JSON response
      res.end(JSON.stringify(plantData));
    } catch (err) {
      // If there's an error fetching data, respond with a 500 error and a message
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch data' }));
    }
  } else {
    // If the request is for a static file (e.g., HTML, CSS, JS), serve it from the 'public' directory
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase(); // Get file extension to determine content type
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif'
    };

    // Set the content type based on the file extension
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read the requested file from the 'public' directory
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If file not found, send a 404 error with a message
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          // If another error occurs, send a 500 error with a message
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 Internal Server Error</h1>', 'utf-8');
        }
      } else {
        // If file is read successfully, send it as the response
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

// Start the server and listen for incoming requests
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
