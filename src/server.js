const express = require('express');

const app = express();
const cors = require('cors');
require('./database');

const routes = require('./routes');

app.use(express.json());
app.use(routes);

app.listen(process.env.APP_PORT || 5000, () => {
  console.log('Server started on port 5000');
});
