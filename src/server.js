const express = require('express');

const app = express();
const cors = require('cors');
require('./database');

const routes = require('./routes');

app.use(cors);
app.use(express.json());
app.use(routes);

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
