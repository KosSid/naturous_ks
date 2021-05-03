const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); // using validator packAge for custom validation

// create Schema
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'A tour Name must have <= 40 characters'],
      minlength: [10, 'A tour Name must have >= 10 characters'],
      // validate: [validator.isAlpha,'name should contain only letters based on custom validation'] // validation with validator, external source
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diddiculty can be easy | mid | difficult'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      max: [6, 'rev must be below = 6'],
      min: [1, 'rev must be above = 1']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this validation works only when we Create the document and doesn't work when we update it !!!!
          return val < this.price;
        },
        message: 'Mistake => Discount in amount ({VALUE}) is bigger vs price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String], // added array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // fasle mean that we will not return it from the server in response because it is false
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// VIRTUAL property
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// -----------------------------------------------------Middelwares

// -----------1. DOCUMENT Middelware => executes on document create / save
tourSchema.pre('save', function(next) {
  console.log('1st Middelware in Schema!!!!');
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('2nd Middelware');
//   next();
// });
//

// middleware are executed after the hooked method and all of its pre middleware have completed.
// tourSchema.post('save', function(docs, next) {
//   console.log('3rd Middelware', docs);
//   next();
// });

// -----------2. QUERY Middelware
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(`This q takes in mil sec ${Date.now() - this.start}`);
  // console.log(doc);
  next();
});

// -----------3. AGGREGATION Middelware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// create Model based on schema
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
