var Product = require('../models/product');
var mongoose = require('mongoose');
const mongo = mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true });
mongo.then(() => {
    console.log('connected');
}).catch((err) => {
    console.log('err', err);
});
var products = [
    new Product({
        imagePath: 'product-01.jpg',
        title: 'T-shirt',
        description: 'Using for women',
        userGroup: 'women',
        price: 70,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-02.jpg',
        title: 'White Shirt',
        description: 'Using for women',
        userGroup: 'women',
        price: 90,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-04.jpg',
        title: 'Jacket',
        description: 'Uisng for Women',
        userGroup: 'women',
        price: 130,
        reviews: [
        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-05.jpg',
        title: 'Shirt Jean',
        description: 'Using for Women',
        userGroup: 'women',
        price: 170,
        reviews: [
        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-07.jpg',
        title: 'Jeans',
        description: 'Using for Women',
        userGroup: 'women',
        price: 60,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-08.jpg',
        title: 'Tree-shirt',
        description: 'Using for Women',
        userGroup: 'women',
        price: 20,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-10.jpg',
        title: 'Black-T-shirt',
        description: 'Using for Women',
        userGroup: 'women',
        price: 80,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-13.jpg',
        title: 'Jeans Italia',
        description: 'Using for Women',
        userGroup: 'women',
        price: 110,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-14.jpg',
        title: 'Black T-Shirt',
        description: 'Using for Women',
        userGroup: 'women',
        price: 23,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-16.jpg',
        title: 'Lazzy clothes',
        description: 'Using for Women',
        userGroup: 'women',
        price: 56,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-06.jpg',
        title: 'Vintage Inspired Classic',
        description: 'Using for Men/Women',
        userGroup: 'watches',
        price: 77,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-15.jpg',
        title: 'Mini Silver Mesh Watch',
        description: 'Using for Men/Women',
        userGroup: 'watches',
        price: 84,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-11.jpg',
        title: 'Shirt-Lightblue',
        description: 'Using for Men',
        userGroup: 'men',
        price: 55,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-03.jpg',
        title: 'Blue Shirt',
        description: 'Using for Men',
        userGroup: 'men',
        price: 50,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit:0
    }),
    new Product({
        imagePath: 'product-12.jpg',
        title: 'Herschel supply',
        description: 'Using for Men',
        userGroup: 'men',
        price: 63,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
    new Product({
        imagePath: 'product-09.jpg',
        title: 'Herschel supply',
        description: 'Using for Men/Women',
        userGroup: 'shoes',
        price: 79,
        reviews: [

        ],
        orderList: [],
        productRate: 0,
        totalProfit: 0
    }),
];
var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        done++;
        if (done == products.length) {
            exit();
        }
    });
}
function exit() {
    mongoose.disconnect();
}