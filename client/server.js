import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist directory
// The index: true option makes express serve index.html for directory requests (/)
app.use(express.static(path.join(__dirname, 'dist'), { index: true }));

// SPA fallback: For any route that doesn't match a static file,
// serve index.html so React Router can handle navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
