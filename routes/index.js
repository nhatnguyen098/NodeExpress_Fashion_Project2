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
    title: 'Shopping Cart',
    products: productChunks
  });
});



router.get('/product-search', async (req, res) => {
  console.log(req.query.search)
  Product.find({
    'title': req.query.search
  }, (err, docs) => {
    console.log(docs)
    res.render('pages/product', {
      products: docs
    })
  })

})

module.exports = router;