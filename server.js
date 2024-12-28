const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')
dotenv.config({path: './config.env'})

const DB = process.env.DATABASE

//Deprecation Warning Here because of URL Parser . Issue still persists
mongoose.connect(DB, {
  useNewUrlParser: true,
  //// useCreateIndex:true,
  ////useFindAndModify: false,
  useUnifiedTopology:true
}).then ((connection)=> {
    console.log('Connected Sucessfully to DB')
  } )



app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}...`);
});
