import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist folder
app.use(express.static('dist'));

// Catch all other routes and serve index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
