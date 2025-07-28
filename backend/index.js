const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const assetsRouter = require('./routes/assets');
const quotesRouter = require('./routes/quotes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/assets', assetsRouter);
app.use('/api/quotes', quotesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});