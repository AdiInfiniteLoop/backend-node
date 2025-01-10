const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtExceptions', (err) => {
  console.log(err.name, ' -> ', err.message);
  process.exit(1); //1 for unhandledRejection
});

const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

//Deprecation Warning Here because of URL Parser . Issue still persists
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    // ssl: true,
    // useCreateIndex:true,
    //useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((connection) => {
    console.log('Connected Sucessfully to DB');
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log(err.name, ' -> ', err.message);
  server.close(() => {
    process.exit(1); //1 for unhandledRejection
  });
});
