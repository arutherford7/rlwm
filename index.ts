import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const app = express();
app.use(bodyParser.json());

const port = 3000;
const app_root = __dirname;

app.get('/', (req, res) => {
  res.sendFile(path.join(app_root, 'index.html'));
});

app.get('/img/:image_set/:image', (req, res) => {
  const p = path.join(app_root, 'img', req.params.image_set, req.params.image);
  res.sendFile(p);
});

app.get('/dist/bundle.js', (req, res) => {
  const p = path.join(app_root, 'dist/bundle.js');
  res.sendFile(p);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});