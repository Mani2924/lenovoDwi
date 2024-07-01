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
function insertDataAndUpdateTime() {
  if (rowIndex >= data.length) {
    console.log('All data inserted.');
    return;
  }

  const rowData = data[rowIndex];

  // Assuming row data is in the correct format
  const newRow = {
    dest_Operation: rowData['Dest Operation'],
    Associate_Id: rowData['Associate Id'],
    Mfg_Order_Id: rowData['Mfg Order Id'],
    product_id: '21JKS14D00',
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

// Schedule the insertion of data every 14 seconds
cron.schedule('*/30 * * * *', () => {
  const date = new Date();
  const hour = date.getHours();
  
  let recordsToInsert = 0;

  // Determine number of records to insert based on the hour
  if (hour === 11 || hour === 12) {
    recordsToInsert = 56; // Morning 11-12
  } else if (hour === 13 || hour === 14) {
    recordsToInsert = 25; // Afternoon 1-2
  } else if (hour === 15 || hour === 16) {
    recordsToInsert = 60; // 3-4
  } else if (hour === 19 || hour === 20) {
    recordsToInsert = 61; // Evening 7-8
  } else if (hour === 21 || hour === 22) {
    recordsToInsert = 76; // Night 9-10
  } else if (hour === 23 || hour === 0) {
    recordsToInsert = 15; // Night 11-12
  } else if (hour === 3 || hour === 4) {
    recordsToInsert = 54; // Morning 3-4
  }

  // Insert the required number of records
  for (let i = 0; i < recordsToInsert; i++) {
    insertDataAndUpdateTime(); // Call your insert function here
  }
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
