const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

console.log('Enviroment name is ====>>>', process.env.NODE_ENV);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// message in case API is wrong and can't be found on the server for all kind of requests
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find api => ${req.originalUrl} on this server!!`, 404));
});
// error handler for all Operational mistakes => 4 arguments with err in the beginning means it's error  miadelware
app.use(globalErrorHandler);

module.exports = app;
