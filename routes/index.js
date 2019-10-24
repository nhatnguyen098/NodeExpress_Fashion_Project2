var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var paginate = require('../config/paginate')

/* GET home page. */
router.get('/', async function (req, res, next) {
  // var ratingStart = []
  // Product.find((err, docs) => {
  //   for (var i = 0; i < docs.length; i++) {
  //     ratingStart.push(docs[i].productRate)
  //   }
  //   var list = ratingStart.sort((a, b) => {
  //     return b - a
  //   })
  // })

  var size = 8;
  productChunks = await paginate(1, size)
  await res.render('pages/index', {
    products: productChunks
  });
});



router.post('/product-search', async (req, res) => {
  console.log(req.body.search)
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