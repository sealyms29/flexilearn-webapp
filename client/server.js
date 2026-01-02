import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static files from dist first
app.use(express.static(distPath));

// Handle root route - redirect to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Handle all other routes - serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
