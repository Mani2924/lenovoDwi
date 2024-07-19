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
  '6-7': 120,
  '9-10': 120,
  '10-11': 120,
  '11-12': 120,
  '13-14':120,
  '18-19': 120,
  '20-21': 100,
  '21-22': 120,
  '22-23': 120,
  '1-2': 120,
  '5-6': 120
};


let recordCount = {
  '6-7': 0,
  '9-10': 0,
  '10-11': 0,
  '11-12': 0,
  '14-15': 0,
  '18-19': 0,
  '20-21': 0,
  '21-22': 0,
  '22-23':0,
  '19-20': 0,
  '1-2': 0,
  '5-6': 0
};

// Function to get the current time range
function getCurrentTimeRange() {
  const now = new Date();
  const hours = now.getHours();
  if (hours >= 6 && hours < 7) return '6-7';
  if (hours >= 9 && hours < 10) return '9-10';
  if (hours >= 10 && hours < 11) return '10-11';
  if (hours >= 11 && hours < 12) return '11-12';
  if (hours >= 14 && hours < 15) return '14-15';
  if (hours >= 18 && hours < 19) return '18-19';
  if (hours >= 20 && hours < 21) return '20-21';
  if (hours >= 21 && hours < 22) return '21-22';
  if (hours >= 22 && hours < 23) return '22-23';
  if (hours >= 1 && hours < 2) return '1-2';
  if (hours >= 5 && hours < 6) return '5-6';
  
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


cron.schedule('*/10 * * * * *', () => {
  const randomDelay = Math.floor(Math.random() * (40 - 30 + 1) + 30) * 1000;
  setTimeout(() => {
    insertDataAndUpdateTime();
  }, randomDelay);
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
