var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var User = require('../models/user')
var csrf = require('csurf');
var passport = require('passport')
var csurfProtection = csrf();



router.post('/update/:email',(req,res)=>{
  User.findOneAndUpdate({'email':req.params.email},{'$set':{'fullName': req.body.fullName, 'birthday': req.body.birthday,'company': req.body.company, 'phoneNum': req.body.phoneNum, 'address': req.body.address, 'description': req.body.description}},{upsert:true, new:true},(err,doc)=>{
    res.redirect('./profile')
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
          if (docs[i].orderList[s].userInfo.email == user.email) {
            docs[i].orderList[s].orderDate = docs[i].orderList[s].orderDate.toISOString().slice(0,10)
            var objOrder = {
              'id': docs[i]._id,
              'orderInfo': docs[i].orderList[s]
            }
            await arr.push(objOrder)
          }
        }
      }
    }
  })
  User.findOne({'email': user.email},(err,doc)=>{
    var s = "";
    if(doc.birthday != null){
      s = doc.birthday.toISOString().slice(0, 10)
    }
    console.log(s)
    res.render('user/profile',{users: doc, orderList: arr, birthday:s})
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
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 })
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
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 })
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