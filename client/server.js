import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Redirect root to /index.html so URL is visible in browser
app.get('/', (req, res) => {
  res.redirect(301, '/index.html');
});

// Serve static files from dist directory (CSS, JS, images, index.html)
// Use absolute path to ensure it works on Render
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: serve index.html for all other routes (React Router handles navigation)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
