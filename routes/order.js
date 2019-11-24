var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var Cart = require('../models/cart');
var Coupon = require('../models/coupon')
var sendMail = require('../config/sendMail')
var checkAuthen = require('../config/checkAuthenticate')
/* GET home page. */




router.get('/check-out', checkAuthen.isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/cart/shopping-cart')
  }
  var cart = new Cart(req.session.cart);
  res.render('order/checkout', {
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
  console.log(cartArr)
  var infoPro = `<table class="table">
  <thead>
  <tr>
    <th>Product Name</th>
    <th>Size</th>
    <th>Quantity</th>
    <th>Price</th>
    <th>Total Price</th>
  </tr>
  </thead>`;
  for (var i = 0; i < cartArr.length; i++) {
    var profit = 0;
    var NumberOrder = 0
    await Product.findById(cartArr[i].item._id, async function (err, docs) {
      if (err) {
        console.log(err)
      }
      NumberOrder = await docs.orderList.length + 1;
      if (cart.coupons.description == 0) {
        docs.totalProfit += cartArr[i].price
        profit = cartArr[i].price
      } else {
        docs.totalProfit += (cartArr[i].price - (cartArr[i].price * cart.coupons.discount))
        profit = (cartArr[i].price - (cartArr[i].price * cart.coupons.discount))
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
        }, (err, doc) => {

        })
      }
    })


    var objOrder = {
      "orderDate": new Date(),
      "totalQuantity": cartArr[i].qty,
      "totalPrice": cartArr[i].price,
      "Size": cartArr[i].size,
      "couponCode": cart.coupons,
      "totalHasDiscount": profit, // change cart.totalDiscount
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
          <td>${cartArr[i].size}</td>
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
  res.render('contact/notification')
})





module.exports = router;




