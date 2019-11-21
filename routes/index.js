var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var paginate = require('../config/paginate')
var check_fields = require('../config/checkAuthenticate')
/* GET home page. */


router.get('/', async function (req, res, next) {
  // var size = 8;
  // productChunks = await paginate(1, size)
  // await res.render('pages/index', {
  //   products: productChunks
  // });

  // top 8 product rating star
  Product.find().sort({
    totalProfit: -1
  }).limit(8).exec(async (err, rs) => {
    var productChunks = []
    var chunkSize = 4;
    for(var i = 0; i < rs.length; i += chunkSize){
      productChunks.push(rs.slice(i,i+chunkSize))
    }
    await res.render('pages/index',{
      products: productChunks
    })
  })
});



router.post('/product-search', async (req, res) => {
  Product.find({
    'title': {
      '$regex': req.body.search,
      '$options': 'i'
    }
  }, (err, docs) => {
    var productChunks = [];
    var chunkSize = docs.length;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize))
    }
    res.render('pages/index', {
      products: productChunks
    })
  })
})



module.exports = router