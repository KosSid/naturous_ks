class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // -------------------------------------------------------------1. ADVANCED SEARCH=> in case we need to have gte | lte ... => we need to add $ sign to query
    // http://localhost:3000/api/v1/tours?price[gte]=500&price[lte]=1000&difficulty=easy
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this; // important to return this to have possibility to chain it
  }

  sort() {
    // http://localhost:3000/api/v1/tours?sort=price,-ratingAverage
    // http://localhost:3000/api/v1/tours?price[gte]=2700&sort=-price,ratingAverage
    // http://localhost:3000/api/v1/tours?price[gte]=500&price[lte]=2000&sort=-price

    if (this.queryString.sort) {
      // we change , to " " for mongoose sort => sort({"price ratingAverage"})
      const sortedBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortedBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //http://localhost:3000/api/v1/tours?fields=name,duration,difficulty,price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // '-' minus means exclution of __v
    }
    return this;
  }

  paginate() {
    // http://localhost:3000/api/v1/tours?page=2&limit=10
    // http://localhost:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price
    const page = this.queryString.page * 1 || 1; // convert in number or page 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
