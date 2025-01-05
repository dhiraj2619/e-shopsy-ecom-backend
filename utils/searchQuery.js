const search = (query,queryString)=>{
   const keyword = queryString.keyword ?{
      name:{
          $regrex:queryString.keyword,
          $options:"i",
      },
   }:{}

   return query.find({...keyword});
}


const filter = (query, queryString) => {
   const queryCopy = { ...queryString };

   
   const removeFields = ["keyword", "page", "limit"];
   removeFields.forEach(key => delete queryCopy[key]);

   
   let queryStringModified = JSON.stringify(queryCopy);
   queryStringModified = queryStringModified.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

   
   return query.find(JSON.parse(queryStringModified));
};

const pagination=(query,queryString,resultPerPage)=>{
     const currentPage = Number(queryString.page) || 1;
     const skip = resultPerPage * (currentPage - 1);


     return query.limit(resultPerPage).skip(skip);
}


module.exports =  {search,filter,pagination}