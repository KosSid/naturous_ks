const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

// http://localhost:3000/api/v1/tours/top-5-cheap
router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTours);

router
  .route('/stat-data')
  .get(tourController.getTourStats);

router
  .route('/monthly-payment/:year')
  .get(tourController.getMonthlyPayment);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour); // added 2 middleware functions

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
