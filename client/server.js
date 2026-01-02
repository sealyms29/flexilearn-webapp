import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static files from dist (CSS, JS, images, etc.)
app.use(express.static(distPath, {
  index: 'index.html'  // Serve index.html for directory requests
}));

// Catch-all for SPA: any unmatched route serves index.html
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
