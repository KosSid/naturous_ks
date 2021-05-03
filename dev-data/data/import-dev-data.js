// USE it to import/delete data from json file to database
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

// 1. To connect data base

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// 2. READ JSON FILE and put data in the variable. This data we'll upkoad in Mongo DB
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB => to process launch in terminal => node dev-data/data/import-dev-data.js --import
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // exit form this process
};

// DELETE ALL DATA FROM DB > to process launch in terminal => node dev-data/data/import-dev-data.js --delete
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // exit form this process
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

// to Execute you need to Launch it in the terminal for delete and for import!!!

  // node dev-data/data/import-dev-data.js --import
  // node dev-data/data/import-dev-data.js --delete