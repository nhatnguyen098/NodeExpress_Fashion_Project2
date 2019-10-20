var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var Store = require('../models/store')
var Cart = require('../models/cart');
var Coupon = require('../models/coupon')
const nodemailer = require('nodemailer');
let sizes = 12;
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

router.get('/product/:page', async (req, res) => {
  var size = 12;
  pages = req.params.page;
  var productChunks = [];
  productChunks = await paginate(pages, size)
  await res.render('pages/product', {
    title: 'Shopping Cart',
    products: productChunks,
    pagePagi: pages
  });
})

router.get('/product-search', async (req, res) => {
  console.log(req.query.search)
  Product.find({
    'title': req.query.search
  }, (err, docs) => {
    console.log(docs)
    res.render('pages/product',{products:docs})
  })

})

router.get('/product-more', async (req, res) => {
  sizes = await (sizes + 8)
  Product.find(async(err,docs)=>{
    if(sizes > docs.length){
      sizes = docs.length
      var hidenMore = true;
    }

    var productChunks = [];
    productChunks = await paginate(1, sizes)
    await res.render('pages/product', {
      title: 'Shopping Cart',
      products: productChunks,
      hidenMore : hidenMore
    });

  })

})

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
    res.redirect('/shopping-cart');
  })
});


router.get('/shopping-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('pages/shopping-cart', {
      products: null
    })
  }
  var cart = new Cart(req.session.cart);
  var couponId = req.query.couponCode;
  Coupon.findOne({
    '_id': couponId,
    'active': true
  }, (err, doc) => {
    if (doc) {
      req.session.cart.coupons = doc;
      cart.coupons = doc
      cart.totalDiscount = cart.totalPrice - (cart.totalPrice * doc.discount);
      req.session.cart.totalDiscount = cart.totalDiscount;
    } else {
      req.session.cart.coupons = {
        'description': 0
      }
      cart.coupons = {
        'description': 0
      }
      cart.totalDiscount = cart.totalPrice
      req.session.cart.totalDiscount = cart.totalDiscount
    }
    res.render('pages/shopping-cart', {
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      couponCodes: cart.coupons,
      priceDiscount: cart.totalDiscount
    })
  })
})


router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/detail/:id', (req, res, next) => {
  var productId = req.params.id;
  var userAcc = req.session.user
  var checkReview = null;
  var product = Product.findById(productId, async (err, pro) => {
    if (err) {
      return res.redirect('/')
    }
    if (userAcc && pro.orderList.length > 0) {
      for (var i = 0; i < pro.orderList.length; i++) {
        if (pro.orderList[i].userInfo.email == userAcc.email) {
          checkReview = true;
        }
      }
    }

    Product.find({
      userGroup: pro.userGroup
    }, async (err, docs) => {
      for (var i = 0; i < docs.length; i++) {
        if (String(docs[i]._id) == productId) {
          await docs.splice(i, 1)
        }
      }
      await res.render('pages/detail', {
        proDetail: pro,
        proRelated: docs,
        checkAcc: checkReview,
        reviewLength: pro.reviews.length
      })
    })
  })
});

router.get('/check-out', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart')
  }
  var cart = new Cart(req.session.cart);
  res.render('pages/checkout', {
    total: cart.totalPrice,
    infoUser: req.session.user,
    products: cart.generateArray(),
    discount: cart.coupons.description,
    totalDiscount: cart.totalDiscount
  })
})


router.post('/add-order', async function (req, res, next) {
  var user = req.session.user
  var cart = new Cart(req.session.cart)
  var cartArr = cart.generateArray();
  var infoPro = `<table class="table">
  <thead>
  <tr>
    <th>Product Name</th>
    <th>Quantity</th>
    <th>Price</th>
    <th>Total Price</th>
  </tr>
  </thead>`;
  for (var i = 0; i < cartArr.length; i++) {
    // var profit = 0;
    var NumberOrder = 0
    await Product.findById(cartArr[i].item._id, async function (err, docs) {
      if (err) {
        console.log(err)
      }
      NumberOrder = await docs.orderList.length + 1;
      if (cart.coupons.description == 0) {
        docs.totalProfit += cartArr[i].price
      } else {
        docs.totalProfit += (cartArr[i].price - (cartArr[i].price * cart.coupons.discount))
      }
      if (cart.coupons._id) {
        Coupon.findOneAndUpdate({
          _id: cart.coupons._id
        }, {
          $set: {
            'active': false
          }
        }, {
          upsert: true,
          new: true
        }, (err, doc) => {})
      }
      Product.findOneAndUpdate({
        _id: cartArr[i].item._id
      }, {
        $set: {
          totalProfit: docs.totalProfit
        }
      }, {
        upsert: true,
        new: true
      }, (err, doc) => {})
    })


    var objOrder = {
      "orderDate": new Date(),
      "totalQuantity": cartArr[i].qty,
      "totalPrice": cartArr[i].price,
      "couponCode": cart.coupons,
      "totalHasDiscount": cart.totalDiscount,
      "statusShip": "Not yet",
      "userInfo": {
        "name": user.fullName,
        "email": user.email,
        "phoneNum": user.phoneNum,
        "address": req.body.address,
        "district": req.body.district,
        "city": req.body.city,
        "country": req.body.country
      },
      "status": 0,
      "numberOrder": NumberOrder
    }
    await Product.findOneAndUpdate({
      _id: cartArr[i].item._id
    }, {
      $addToSet: {
        orderList: objOrder
      }
    }, (err, doc) => {
      if (err) {
        return redirect('/')
      }
      infoPro += `
        <tbody>
        <tr>
          <td>${cartArr[i].item.title}</td>
          <td>${cartArr[i].qty}</td>
          <td>${cartArr[i].item.price}</td>
          <td>${cartArr[i].qty * cartArr[i].item.price}</td>
        </tr>`;
    })
  }
  var output = await `
  <p>You have a new order</p>
  <h3>Contact Details</h3>
  <ul>
    <li>Name: ${user.fullName}.</li>
    <li>Email: ${user.email}.</li>
    <li>Order Date: ${new Date()}.</li>
    <li>Phone Number: ${user.phoneNum}.</li>
    <li>Address: ${req.body.address}, district ${req.body.district},${req.body.city}.</li>
    <li>Total Price Order:$ ${cart.totalPrice}.00</li>
    <li>Discount Order: ${cart.coupons.description}.</li>
    <li>Total Price:$ ${cart.totalDiscount}.</li>
  </ul>
` + infoPro + `</tbody></table>` + `<h3>Total:$ ${cart.totalDiscount}.00</h3>`;
  await sendMail(output, "Customer Order", user.email)
  req.session.cart = null;
  res.render('pages/notification')
})



router.get('/contact', function (req, res) {
  Store.find((err, docs) => {
    res.render('pages/contact', {
      store: docs
    })
  })

})

router.get('/about', (req, res) => {
  res.render('pages/about')
})

router.post('/review-product/:id', async (req, res) => {
  var id = req.params.id
  var rating = Number(req.body.rating);
  var userEmail = req.session.user.email;
  var userName = req.session.user.fullName;
  var description = req.body.review;
  var productRate = 0;
  var objReview = await {
    "userEmail": userEmail,
    "userName": userName,
    "rating": rating,
    "description": description
  }
  await Product.findById(id, async (err, doc) => {
    for (var i = 0; i < doc.reviews.length; i++) {
      if (doc.reviews[i].userEmail == userEmail) {
        var updPro = await Product.findOneAndUpdate({
          'reviews.userEmail': userEmail
        }, {
          "$set": {
            'reviews.$.userName': userName,
            'reviews.$.rating': rating,
            'reviews.$.description': description
          }
        }, {
          upsert: true,
          new: true
        }, async (err, docs) => {

        })
      }
    }
    if (updPro == undefined) {
      Product.findOneAndUpdate({
        _id: id
      }, {
        $push: {
          reviews: objReview
        }
      }, {
        upsert: true,
        new: true
      }, async (err, doc) => {

      })
    }
  })
  await Product.findById(id, async (err, doc) => {
    var sum = 0;
    var count = 0;
    if (doc.reviews.length == 0) {
      count = 1;
    }
    for (var i = 0; i < doc.reviews.length; i++) {
      sum = await (sum + doc.reviews[i].rating)
      await count++;
    }
    productRate = await (sum / count).toFixed(1)
    await Product.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        productRate: productRate
      }
    }, {
      upsert: true,
      new: true
    }, function (err, doc) {})
  })
  res.redirect('../detail/' + id)

})

router.post('/contact', async (req, res) => {
  const output = await `
    <p>You have a new contact request.!</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.msg}</p>
  `;
  await sendMail(output, "Customer Contact", "nhatnguyen00198@gmail.com")
  res.redirect('/notification')
})
router.get('/notification', (req, res) => {
  res.render('pages/notification')
})
router.get('/paginate', (req, res) => {
  res.render('/')
})

module.exports = router;


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

async function paginate(pages, limitNum) {
  var productChunks = [];
  await Product.paginate({}, {
    page: pages,
    limit: limitNum
  }, function (err, result) {
    var chuckSize = 4;
    for (var i = 0; i < result.docs.length; i += chuckSize) {
      productChunks.push(result.docs.slice(i, i + chuckSize))
    }
  });
  return await productChunks;
}

async function sendMail(content, title, emailTo) {
  let transporter = nodemailer.createTransport({
    host: 'mail.google.com',
    service: "Gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'nhatnguyen00198@gmail.com', // generated ethereal user
      pass: 'nhatnguyen' // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"${title}" <foo@example.com>`, // sender address
    to: `COZA Company, ${emailTo}`, // list of receivers
    subject: 'Coza Services', // Subject line
    text: 'Hello world?', // plain text body
    html: content // html body
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}