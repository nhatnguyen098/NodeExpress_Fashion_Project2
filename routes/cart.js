var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var Cart = require('../models/cart');
var Coupon = require('../models/coupon')
/* GET home page. */



router.post('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var qty = req.body.num;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/')
    }
    cart.add(product, product.id, qty)
    req.session.cart = cart;
    res.redirect('/cart/shopping-cart');
  })
});


router.get('/shopping-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('cart/shopping-cart', {
      products: null
    })
  }
  var cart = new Cart(req.session.cart);
  var couponId = req.query.couponCode;
  Coupon.findOne({
    '_id': couponId,
  }, (err, doc) => {
    if (doc && doc.active == true) {
      req.session.cart.coupons = doc;
      cart.coupons = doc
      cart.totalDiscount = cart.totalPrice - (cart.totalPrice * doc.discount);
      req.session.cart.totalDiscount = cart.totalDiscount;
    } else if(doc && doc.active == false){
      req.session.cart.coupons = {
        'description': 0
      }
      cart.coupons = {
        'description': 0
      }
      var show_messages = 'The coupon code inActive!'
    }
     else if(!doc) {
      req.session.cart.coupons = {
        'description': 0
      }
      cart.coupons = {
        'description': 0
      }
      cart.totalDiscount = cart.totalPrice
      req.session.cart.totalDiscount = cart.totalDiscount
      if(couponId){
        var show_messages = 'Not found coupon code!'
      }

    }
    res.render('cart/shopping-cart', {
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      couponCodes: cart.coupons,
      priceDiscount: cart.totalDiscount,
      messages: show_messages
    })
  })
})


router.get('/removeAll/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {})
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/cart/shopping-cart');

});
router.get('/reduceByOne/:id', (req, res) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {})
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/cart/shopping-cart');
})


module.exports = router;