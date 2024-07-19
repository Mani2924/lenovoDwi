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


const recordLimits = {
  '0-1': 200,
  '1-2': 200,
  '2-3': 200,
  '3-4': 200,
  '4-5': 200,
  '5-6': 200,
  '6-7': 200,
  '7-8': 200,      // Added this range
  '8-9': 200,      // Added this range
  '9-10': 200,
  '10-11': 200,
  '11-12': 120,
  '12-13': 120,    // Added this range
  '13-14': 120,
  '14-15': 120,    // Added this range
  '15-16': 120,    // Added this range
  '16-17': 120,    // Added this range
  '17-18': 200,    // Added this range
  '18-19': 200,
  '19-20': 200,    // Added this range
  '20-21': 200,
  '21-22': 200,
  '22-23': 200,
  '23-24': 200     // Added this range
};

let recordCount = {
  '0-1': 0,
  '1-2': 0,
  '2-3': 0,
  '3-4': 0,
  '4-5': 0,
  '5-6': 0,
  '6-7': 0,
  '7-8': 0,       // Added this range
  '8-9': 0,       // Added this range
  '9-10': 0,
  '10-11': 0,
  '11-12': 0,
  '12-13': 0,     // Added this range
  '13-14': 0,
  '14-15': 0,     // Added this range
  '15-16': 0,     // Added this range
  '16-17': 0,     // Added this range
  '17-18': 0,     // Added this range
  '18-19': 0,
  '19-20': 0,     // Added this range
  '20-21': 0,
  '21-22': 0,
  '22-23': 0,
  '23-24': 0      // Added this range
};

// Function to get the current time range
function getCurrentTimeRange() {
  const now = new Date();
  const hours = now.getHours();
  
  if (hours >= 0 && hours < 1) return '0-1';
  if (hours >= 1 && hours < 2) return '1-2';
  if (hours >= 2 && hours < 3) return '2-3';
  if (hours >= 3 && hours < 4) return '3-4';
  if (hours >= 4 && hours < 5) return '4-5';
  if (hours >= 5 && hours < 6) return '5-6';
  if (hours >= 6 && hours < 7) return '6-7';
  if (hours >= 7 && hours < 8) return '7-8';
  if (hours >= 8 && hours < 9) return '8-9';
  if (hours >= 9 && hours < 10) return '9-10';
  if (hours >= 10 && hours < 11) return '10-11';
  if (hours >= 11 && hours < 12) return '11-12';
  if (hours >= 12 && hours < 13) return '12-13';
  if (hours >= 13 && hours < 14) return '13-14';
  if (hours >= 14 && hours < 15) return '14-15';
  if (hours >= 15 && hours < 16) return '15-16';
  if (hours >= 16 && hours < 17) return '16-17';
  if (hours >= 17 && hours < 18) return '17-18';
  if (hours >= 18 && hours < 19) return '18-19';
  if (hours >= 19 && hours < 20) return '19-20';
  if (hours >= 20 && hours < 21) return '20-21';
  if (hours >= 21 && hours < 22) return '21-22';
  if (hours >= 22 && hours < 23) return '22-23';
  if (hours >= 23 && hours < 24) return '23-24';

  return null;
}

function getRandomLines(lines) {
  const selectedLines = [];
  const numLines = Math.floor(Math.random() * lines.length) + 1; // Random number between 1 and lines.length

  while (selectedLines.length < numLines) {
    const randomIndex = Math.floor(Math.random() * lines.length);
    const selectedLine = lines[randomIndex];
    if (!selectedLines.includes(selectedLine)) {
      selectedLines.push(selectedLine);
    }
  }

  return selectedLines;
}


// Function to insert data and update time
async function insertDataAndUpdateTime() {
  const currentTimeRange = getCurrentTimeRange();
  if (currentTimeRange && recordCount[currentTimeRange] >= recordLimits[currentTimeRange]) {
    console.log(`Record limit reached for the time range ${currentTimeRange}.`);
    return;
  }
  const rowData = data[1];
  const newRow = {
    dest_Operation: rowData['Dest Operation'],
    Associate_Id: rowData['Associate Id'],
    Mfg_Order_Id: rowData['Mfg Order Id'],
    product_id: '11T5S30S00',
    Serial_Num: rowData['Serial Num'],
    Operation_Id: rowData['Operation Id'],
    Work_Position_Id: rowData['Work Position Id'],
    isActive: true,
    deletedAt: null,
  };

  const lines = ['L1', 'L2', 'L3'];
  const selectedLines = getRandomLines(lines);
  const newRowArray = selectedLines.map(line => ({ ...newRow, line }));
  try {
    await sampleData.bulkCreate(newRowArray);
    recordCount[currentTimeRange]++;
    console.log(`Record inserted for the time range ${currentTimeRange}. Count: ${recordCount[currentTimeRange]}`);
  } catch (error) {
    console.error('Error inserting row:', error);
  }
}


cron.schedule('*/30 * * * * *', () => {
    insertDataAndUpdateTime();
});
// Schedule the insertion of data every 30 seconds
// cron.schedule('*/30 * * * * *', insertDataAndUpdateTime);

// Reset counters every hour at the start of the hour
cron.schedule('0 * * * *', () => {
  Object.keys(recordCount).forEach(range => {
    recordCount[range] = 0;
  });
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
