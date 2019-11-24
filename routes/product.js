var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var paginate = require('../config/paginate')
var sizes = 8;
/* GET home page. */

router.get('/product-more', async (req, res) => {
    sizes = await (sizes + 4)
    await Product.paginate({}, {
        page: 1,
        limit: sizes
    }, async function (err, rs) {
        var docs = rs.docs
        var productChunks = []
        if (sizes > docs.length) {
            sizes = docs.length
            var hidenMore = true;
        }
        var chuckSize = 4;
        for (var i = 0; i < docs.length; i += chuckSize) {
            productChunks.push(docs.slice(i, i + chuckSize))
        }
        await res.render('product/productList', {
            products: productChunks,
            hidenMore: hidenMore
        });
    })

    // Product.find(async (err, docs) => {
    //     if (sizes >= docs.length) {
    //         sizes = docs.length
    //         var hidenMore = true;
    //     }
    //     var productChunks = [];
    //     productChunks = await paginate(1, sizes)
    //     await res.render('product/productList', {
    //         products: productChunks,
    //         hidenMore: hidenMore
    //     });

    // })
})

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
        res.render('product/productList', {
            products: productChunks
        })
    })
})

router.post('/filterPrice', (req, res) => {

})


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
                if (pro.orderList[i].userInfo.email == userAcc.email && pro.orderList[i].status == 1) {
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
            await res.render('product/detail', {
                proDetail: pro,
                proRelated: docs,
                checkAcc: checkReview,
                reviewLength: pro.reviews.length
            })
        })
    })
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
        "description": description,
        "date_time": new Date().toISOString().slice(0, 10)
    }
    var updPro
    await Product.findById(id, async (err, doc) => {
        for (var i = 0; i < doc.reviews.length; i++) {
            if (doc.reviews[i].userEmail == userEmail) { // find userEmail exist
                updPro = await Product.findOneAndUpdate({
                    'reviews.userEmail': userEmail
                }, {
                    "$set": {
                        'reviews.$.userName': userName,
                        'reviews.$.rating': rating,
                        'reviews.$.description': description,
                        'reviews.$.date_time': new Date().toISOString().slice(0, 10)
                    }
                }, {
                    upsert: true,
                    new: true
                }, async (err, docs) => {})
            }
        }
    })
    if (updPro == undefined) {
        await Product.findOneAndUpdate({
            _id: id
        }, {
            '$addToSet': {
                reviews: objReview
            }
        }, {
            new: true
        }, async (err, doc) => {

        })
    }
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

module.exports = router;