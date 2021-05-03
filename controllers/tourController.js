const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const asyncCatch = require('../utils/asyncCatch');
const AppError = require('../utils/appError');

exports.alias = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name price difficulty ratingsAverage';
  next();
};

exports.getAllTours = asyncCatch(async (req, res, next) => {
  // create new class that return query (features.query) as promise and chain it to cover all options filter / sort / limit / paginate
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query; // in such case we can use sort | limit and other query options like below

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = asyncCatch(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError(`Tour with id ${req.params.id} is not found`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = asyncCatch(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = asyncCatch(async (req, res, next) => {
  const tour = await Tour.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError(`Tour with id ${req.params.id} was not found and was not updated`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = asyncCatch(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`Tour with id ${req.params.id} is not found and was not deleted`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// http://localhost:3000/api/v1/tours/stat-data
exports.getTourStats = asyncCatch(async (req, res, next) => {
  const stat = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
    // { $match: { _id: { $ne: 'EASY' } } } // and not equal Easy
  ]);
  res.status(200).json({
    status: 'stat data success',
    data: {
      stat
    }
  });
});

// http://localhost:3000/api/v1/tours/monthly-payment/2021
exports.getMonthlyPayment = asyncCatch(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const stDate = new Date(`${year}-01-01`);
  const enDate = new Date(`${year}-12-31`);

  const payment = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: stDate,
          $lte: enDate
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: false }
    },
    {
      $sort: { numTours: -1 }
    }
    // {
    //   $limit: 12
    // }
  ]);
  res.status(200).json({
    status: 'stat data success',
    data: {
      payment
    }
  });
});
