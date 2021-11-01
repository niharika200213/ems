const express=require('express');
const app=express();
const mongoose=require('mongoose');
require('dotenv/config');

const feedRoutes = require('./routes/eventposts');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/eventposts');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Autherization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    process.env.MONGOOSE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true} 
  )
  .then(result => {
    console.log('connection established');
    app.listen(3000);
  })
  .catch(err => console.log(err));


app.use('/auth',authRoutes);
app.use('/post',userRoutes);
app.get('/', function (req,res){res.send('ok')});
