const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');

// Custom Requires
const { sequelize } = require('../models');

const config = require('./config/vars');
const xlsx = require('xlsx');
const { sampleData } = require('../models/index');

// app express
const app = express();

// cors Options
const corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// home handler
app.use('/', (req, res, next) => {
  res.response = { code: 404, message: rescodes.notFound };
  next();
});

// create schema
const createSchema = async function () {
  await sequelize.showAllSchemas({ logging: false }).then(async (data) => {
    if (!data.includes(config.db.schema)) {
      await sequelize.createSchema(config.db.schema);
    }
  });
};
createSchema();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const filePath = path.join(__dirname, '../src/data/sampleData.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

let rowIndex = 0;

// Function to insert data and update "Op Finish Time"
async function insertDataAndUpdateTime() {
  if (rowIndex >= data.length) {
    console.log('All data inserted.');
    return;
  }

  const rowData = data[rowIndex];

  const productCount = await uphtarget.count();
  const currentHour = new Date().getHours();
  const windowIndex = Math.floor(currentHour / 3);
  // Determine the index based on windowIndex and productCount
  const index = windowIndex % productCount; // Ensure index wraps around based on product count

  // Fetch product ID based on the calculated index
  const product = await uphtarget.findOne({ offset: index });

  // Assuming row data is in the correct format
  const newRow = {
    dest_Operation: rowData['Dest Operation'],
    Associate_Id: rowData['Associate Id'],
    Mfg_Order_Id: rowData['Mfg Order Id'],
    product_id: product.product_id,
    Serial_Num: rowData['Serial Num'],
    Operation_Id: rowData['Operation Id'],
    Work_Position_Id: rowData['Work Position Id'],
    line: 'L1', // Assuming lineDetails is defined somewhere
    isActive: true,
    deletedAt: null,
  };
  sampleData
    .create(newRow)
    .then(() => {
      rowIndex++;
    })
    .catch((error) => {
      console.error('Error inserting row:', error);
    });
}

cron.schedule('*/30 * * * * *', () => {
  insertDataAndUpdateTime();
});

sequelize
  .sync({ logging: false })
  .then(() => {
    console.log('DB Connection Successful');
    httpServer.listen(config.app.port, () => {
      console.log(`Listening to port ${config.app.port}`);
    });
  })
  .catch((error) => {
    console.log('DB Connection Error');
  });

module.exports = app;
