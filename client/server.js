import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log(`Starting server...`);
console.log(`Expected dist path: ${distPath}`);
console.log(`Dist folder exists: ${fs.existsSync(distPath)}`);
console.log(`index.html exists: ${fs.existsSync(indexPath)}`);

// Serve static files from dist with caching
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', distExists: fs.existsSync(distPath) });
});

// SPA fallback: all other routes serve index.html
app.use((req, res) => {
  console.log(`Serving index.html for route: ${req.path}`);
  
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`Error sending index.html: ${err.message}`);
        res.status(500).send('Error loading application');
      }
    });
  } else {
    console.error(`CRITICAL: index.html not found at ${indexPath}`);
    res.status(503).send('Application files not found. Please rebuild.');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Server error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ Serving static files from: ${distPath}`);
});
