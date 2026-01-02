import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist directory (CSS, JS, images, etc.)
// Use absolute path to ensure it works on Render
app.use(express.static(path.join(__dirname, 'dist')));

// SPA: serve index.html for all routes (React Router handles navigation)
// This serves index.html for root (/) and all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
