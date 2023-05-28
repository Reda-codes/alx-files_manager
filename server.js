import routes from './routes';

const express = require('express');

const app = express();
const port = 5000;

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});

module.exports = app;
export default app;
