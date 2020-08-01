const router = require("express").Router();
let Review = require("../models/review.model");
let Customer = require("../models/customer.model");
let Restaurant = require("../models/restaurnat.model");

router.route("/").get(async (req, res) => {
    console.log("this is test");
})

router.route("/getreviewscustomerside").get(async (req, res) => {
    console.log("Accessing /review/getreviewscustomerside");
    console.log(req.body);
})

router.route("/getreviewsrestaurantside").get(async (req, res) => {
    console.log("Accessing /review/getreviewsrestaurantside");
    console.log(req.body);
})

router.route("/addreview").post(async (req, res) => {
    console.log("Accessing /review/addreview");
    console.log(req.body);

    var userType = req.user.userTypeId;

    if (userType == 1) { // customer
        var accountId = req.user._id;
        var customerId = await findCustomerByAccount(accountId);

        var comment = req.body.comment;
        var food = req.body.food;
        var service = req.body.service;
        var environment = req.body.environment;
        var satisfaction = req.body.satisfaction;
        var restaurantId = req.body.resId;

        var newReview = new Review({
            comment,
            food,
            service,
            environment,
            satisfaction,
            restaurantId,
            customerId
        })

        newReview.save()
            .then(() => {
                res.json({ errcode: 0, errmsg: "add review success" });
            })
            .catch((err) => {
                res.json({ errcode: 1, errmsg: err });
            })
    } else { // restaurant owner, manager
        res.json({ errcode: 2, errmsg: "Only customer can add review" });
    }

})

router.route("/editreview").post(async (req, res) => {
    console.log("Accessing /review/editreview");
    console.log(req.body);
})

router.route("/deletereview").post(async (req, res) => {
    console.log("Accessing /review/deletereview");
    console.log(req.body);
})

let findCustomerByAccount = async function (actId) {
    return await Customer.findOne({ account: actId });
}

module.exports = router;