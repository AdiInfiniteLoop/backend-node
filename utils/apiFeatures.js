class APIFeatures {
  //query is the Mongo Query we want to execute. queryString is the express request the client is sending
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString 
  }

  filter() {
    //Excluding special field name
    let queryObj = {...this.queryString}
    const excludedFields = ["page", "sort", "fields", "limit"];
    excludedFields.forEach((el) => delete queryObj[el])
    // 1.filtering: simply put it in model.find(...) from mongo


    //2.Advanced filtering
    // model.find({duration: {$gte: 43} } )
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, matched => `$${matched}`)

    this.query = this.query.find(JSON.parse(queryStr))

    return this;
  }

  sort() {
    //3. Sorting
    if(this.queryString.sort) {
      //Tie Breaker Sorting
      //req.query.sort = price,duration,...
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query =  this.query.sort(sortBy)

    }
    else {
      this.query = this.query.sort('-createdAt')
    }

    return this;
  }

  fields() {
    //4. Field Limiting
    if(this.queryString.fields) {
      const limitField = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(limitField)
    }
    else {
      this.query = this.query.select('-__v')
    }
    return this;
  }

  pagination() {
    //5. Paginaton
    if(this.queryString.page && this.queryString.limit) {
      //skip = (pageIdx - 1) * limit
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skipVal = (page- 1) * limit


      this.query =  this.query.skip(skipVal).limit(limit)
    }
    return this;
  }

}


module.exports = APIFeatures
