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

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error(`ERROR: dist folder not found at ${distPath}`);
  console.error('Make sure to run: npm run build');
}

// Serve static files from dist directory
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}));

// SPA fallback: serve index.html for any request that doesn't match a file
app.use((req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at ${indexPath}`);
    res.status(404).send('index.html not found. Please run: npm run build');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving from: ${distPath}`);
  console.log(`index.html exists: ${fs.existsSync(indexPath)}`);
});
