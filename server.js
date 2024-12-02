const http = require('http'); // Core module to create an HTTP server
const fs = require('fs'); // Core module to handle file system operations
const path = require('path'); // Core module to work with file and directory paths

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Check the requested URL
  if (req.url === '/api') {
    // Serve the JSON data for the API
    const filePath = path.join(__dirname, 'data.json'); // Path to the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Handle server errors
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } else {
        // Respond with the JSON data and enable CORS
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow cross-origin requests
        });
        res.end(data); // Send the JSON data
      }
    });
  } else {
    // Serve static files from the "public" directory
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Determine the file's MIME type based on its extension
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

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found, return 404
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          // Other server errors
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 Internal Server Error</h1>', 'utf-8');
        }
      } else {
        // Serve the file with the appropriate content type
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
