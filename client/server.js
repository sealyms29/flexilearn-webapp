import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = join(__dirname, 'dist');

// Serve static files from the dist folder
app.use(express.static(distPath));

// Redirect root path to index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Catch all other routes and serve index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
