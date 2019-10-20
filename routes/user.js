var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var User = require('../models/user')
var csrf = require('csurf');
var passport = require('passport')
var csurfProtection = csrf();
var mongoose = require('mongoose');


router.post('/update/:email', (req, res) => {
  User.findOneAndUpdate({
    'email': req.params.email
  }, {
    '$set': {
      'fullName': req.body.fullName,
      'birthday': req.body.birthday,
      'company': req.body.company,
      'phoneNum': req.body.phoneNum,
      'address': req.body.address,
      'description': req.body.description
    }
  }, {
    upsert: true,
    new: true
  }, (err, doc) => {
    res.redirect('./user/profile')
  })
})

router.post('/viewDetail', isLoggedIn, (req, res) => {

  Product.findOne({
    '_id': req.body.pro_id
  }, (err, docs) => {
    docs.orderList.forEach(s => {
      if (s.numberOrder == req.body.numberOrder) {
        s.id = docs._id
        s.proName = docs.title
        s.proPrice = docs.price
        if(s.couponCode.discount){
          s.totalPrice -= (s.totalPrice * s.couponCode.discount)
        }
        s.orderDate = s.orderDate.toISOString()
        res.render('user/orderDetail', {
          orderDetail: s
        })
      }
    })
  })

})

router.post('/deleteOrder/:id', async (req, res) => {
  // console.log(req.params.id)
  // console.log(req.body.numberOrder)

  var updPro = await Product.findOneAndUpdate({
    '_id': req.params.id,
    'orderList.numberOrder': Number(req.body.numberOrder)
  }, {
    "$set": {
      'orderList.$.status': -1,
    }
  }, {
    upsert: true,
    new: true
  }, async (err, docs) => {
    // res.render('user/profile')
    res.redirect('../profile')
  })



})




router.use(csurfProtection);



router.get('/profile', isLoggedIn, function (req, res, next) {
  var user = req.session.user
  var arr = [];
  Product.find(async (err, docs) => {
    for (var i = 0; i < docs.length; i++) {
      for (var s = docs[i].orderList.length - 1; s >= 0; s--) {
        if (docs[i].orderList[s].userInfo) {
          if (docs[i].orderList[s].userInfo.email == user.email && docs[i].orderList[s].status == 0) {
            docs[i].orderList[s].orderDate = docs[i].orderList[s].orderDate.toISOString().slice(0, 10)
            var objOrder = {
              'id': docs[i]._id,
              'orderInfo': docs[i].orderList[s],
            }
            await arr.push(objOrder)
          }
        }
      }
    }
  })
  User.findOne({
    'email': user.email
  }, (err, doc) => {
    var birthday = "";
    if (doc.birthday != null) {
      birthday = doc.birthday.toISOString().slice(0, 10)
    }
    res.render('user/profile', {
      users: doc,
      orderList: arr,
      birthday: birthday
    })
  })

})

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logOut();
  req.session.user = null;
  res.redirect('/');
})

router.use('/', notLoggedIn, function (req, res, next) {
  next();
})

router.get('/signup', function (req, res, next) {
  var messages = req.flash('error')
  res.render('user/signup', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  })
})
router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: './signup',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('./profile')
  }
})


router.get('/signin', function (req, res, next) {
  var messages = req.flash('error')
  res.render('user/signin', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  })
})

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: './signin',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('./profile')
  }
})





module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}