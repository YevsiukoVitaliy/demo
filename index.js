require('dotenv').config();
const host = process.env.HOST;
const port = process.env.PORT;

const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const sequelize = require('./db/db');
const models = require('./models/models');

const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const azure = require('azure-storage');
const blobService = azure.createBlobService(
  'DefaultEndpointsProtocol=https;AccountName=csb10032002800ae99d;AccountKey=kZq4+eM9bdbNygg+p65TXPKwwWMTdUpyQIWGCcAWQEwzcURDB6G5tSf+yzf9BbiimlISSuVNjBH6+AStMR5RIQ==;EndpointSuffix=core.windows.net'
);

// Upload files to Azure Blob Storage
const directoryPath = path.join(__dirname, 'static');
const containerName = 'store';
const fileList = fs.readdirSync(directoryPath);

for (const file of fileList) {
  const filePath = path.join(directoryPath, file);
  const blobName = file;
  blobService.createBlockBlobFromLocalFile(
    containerName,
    blobName,
    filePath,
    (error, result, response) => {
      if (error) {
        console.log(`Error uploading file ${filePath}:`, error);
      } else {
        console.log(`File ${filePath} uploaded successfully:`, result);
      }
    }
  );
}

// Use uploaded files in Express app

//middleware
app.use(cors());
app.use(express.json());
app.use(
  '/photos',
  express.static(
    `https://csb10032002800ae99d.blob.core.windows.net/${containerName}`
  )
);
app.use(fileUpload({}));
app.use('/api', router);

//Handler error, last middleware
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`App listening at http://${host}:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
};
start().then(() => console.log('Starting...'));
