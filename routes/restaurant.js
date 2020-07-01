const router = require("express").Router();
const Restaurant = require("../models/restaurnat.model");
const Address = require("../models/address.model");
const CuisineStyle = require("../models/cuisineStyle.model");
const Category = require("../models/category.model");
const PriceRange = require("../models/priceRange.model");
const StoreTime = require("../models/storeTime.model");

router.route("/").get((req, res) => {
  Restaurant.find()
    .populate("addressId")
    .then((restaurant) => res.json(restaurant))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/editresprofile").post((req, res) => {
  var _id = "5efa8fc9dd9918ba08ac9ade";
  //var _id = req.user._id;
  var obj = {
    resId: _id,
    resName: req.body.resname,
    phoneNumber: req.body.phonenumber,
    businessNum: req.body.businessnumber,
    description: req.body.description,

    //open and close times
    monOpenTime: req.body.monOpenTime,
    tueOpenTime: req.body.tueOpenTime,
    wedOpenTime: req.body.wedOpenTime,
    thuOpenTime: req.body.thuOpenTime,
    friOpenTime: req.body.friOpenTime,
    satOpenTime: req.body.satOpenTime,
    sunOpenTime: req.body.sunOpenTime,
    monCloseTime: req.body.monCloseTime,
    tueCloseTime: req.body.tueCloseTime,
    wedCloseTime: req.body.wedCloseTime,
    thuCloseTime: req.body.thuCloseTime,
    friCloseTime: req.body.friCloseTime,
    satCloseTime: req.body.satCloseTime,
    sunCloseTime: req.body.sunCloseTime,

    //address
    province: req.body.province,
    streetName: req.body.streetname,
    streetNum: req.body.streetnumber,
    postalCode: req.body.postalcode,
    city: req.body.city,

    //cuisine style
    cuisineStyleVal: req.body.cuisineStyle,

    //category
    categVal: req.body.category,

    //price range
    priceName: req.body.priceRange,
  };

  editRestaurantProfile(obj)
    .then(() => {
      res.json({ errcode: 0, errmsg: "success" });
    })
    .catch((err) => {
      res.json({ errcode: 1, errmsg: err });
    });
});

//for testing
router.route("/:id").get((req, res) => {
  Restaurant.findById(req.params.id)
    .populate("addressId")
    .populate("cuisineStyleId")
    .populate("categoryId")
    .populate("priceRangeId")
    .populate("monOpenTimeId")
    .populate("tueOpenTimeId")
    .populate("wedOpenTimeId")
    .populate("thuOpenTimeId")
    .populate("friOpenTimeId")
    .populate("satOpenTimeId")
    .populate("sunOpenTimeId")
    .populate("monCloseTimeId")
    .populate("tueCloseTimeId")
    .populate("wedCloseTimeId")
    .populate("thuCloseTimeId")
    .populate("friCloseTimeId")
    .populate("satCloseTimeId")
    .populate("sunCloseTimeId")
    .then((restaurant) => res.json(restaurant))
    .catch((err) => res.status(400).json("Error: " + err));
});

// for testing
router.route("/:id").post((req, res) => {
  var obj = {
    resId: req.params.id,
    resName: req.body.resname,
    phoneNumber: req.body.phonenumber,
    businessNum: req.body.businessnumber,
    description: req.body.description,

    //open and close times
    monOpenTime: req.body.monOpenTime,
    tueOpenTime: req.body.tueOpenTime,
    wedOpenTime: req.body.wedOpenTime,
    thuOpenTime: req.body.thuOpenTime,
    friOpenTime: req.body.friOpenTime,
    satOpenTime: req.body.satOpenTime,
    sunOpenTime: req.body.sunOpenTIme,
    monCloseTime: req.body.monCloseTime,
    tueCloseTime: req.body.tueCloseTime,
    wedCloseTime: req.body.wedCloseTime,
    thuCloseTime: req.body.thuCloseTime,
    friCloseTime: req.body.friCloseTime,
    satCloseTime: req.body.satCloseTime,
    sunCloseTime: req.body.sunCloseTime,

    //address
    province: req.body.province,
    streetName: req.body.streetname,
    streetNum: req.body.streetnumber,
    postalCode: req.body.postalcode,
    city: req.body.city,

    //cuisine style
    cuisineStyleVal: req.body.cuisineStyle,

    //category
    categVal: req.body.category,

    //price range
    priceName: req.body.priceRange,
  };

  editRestaurantProfile(obj)
    .then(() => {
      res.json({ errcode: 0, errmsg: "success" });
    })
    .catch((err) => {
      res.json({ errcode: 1, errmsg: err });
    });
});

let editRestaurantProfile = async (obj) => {
  let addrId, cuisineId, categoryId, priceRangeId;
  let monOpenId,
    tueOpenId,
    wedOpenId,
    thuOpenId,
    friOpenId,
    satOpenId,
    sunOpenId,
    monCloseId,
    tueCloseId,
    wedCloseId,
    thuCloseId,
    friCloseId,
    satCloseId,
    sunCloseId;

  await CuisineStyle.findOne({ cuisineVal: obj.cuisineStyleVal }).then(
    (cuisineStyle) => {
      cuisineId = cuisineStyle._id;
    }
  );

  await Category.findOne({ categoryVal: obj.categVal }).then((category) => {
    categoryId = category._id;
  });

  await PriceRange.findOne({ priceRangeName: obj.priceName }).then(
    (priceRange) => {
      priceRangeId = priceRange._id;
      console.log(priceRangeId);
    }
  );

  //open and close time
  await StoreTime.findOne({ storeTimeVal: obj.monOpenTime }).then(
    (storeTime) => {
      monOpenId = storeTime._id;
    }
  );
  console.log(obj.tueOpenTime);
  await StoreTime.findOne({ storeTimeVal: obj.tueOpenTime }).then(
    (storeTime) => {
      tueOpenId = storeTime._id;
      console.log(tueOpenId);
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.wedOpenTime }).then(
    (storeTime) => {
      wedOpenId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.thuOpenTime }).then(
    (storeTime) => {
      thuOpenId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.friOpenTime }).then(
    (storeTime) => {
      friOpenId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.satOpenTime }).then(
    (storeTime) => {
      satOpenId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.sunOpenTime }).then(
    (storeTime) => {
      sunOpenId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.monCloseTime }).then(
    (storeTime) => {
      monCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.tueCloseTime }).then(
    (storeTime) => {
      tueCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.wedCloseTime }).then(
    (storeTime) => {
      wedCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.thuCloseTime }).then(
    (storeTime) => {
      thuCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.friCloseTime }).then(
    (storeTime) => {
      friCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.satCloseTime }).then(
    (storeTime) => {
      satCloseId = storeTime._id;
    }
  );

  await StoreTime.findOne({ storeTimeVal: obj.sunCloseTime }).then(
    (storeTime) => {
      sunCloseId = storeTime._id;
    }
  );

  await Restaurant.findById(obj.resId).then((restaurant) => {
    console.log(tueOpenId);
    console.log(wedOpenId);
    //restaurant info
    restaurant.resName = obj.resName;
    restaurant.restaurantDescription = obj.description;
    restaurant.phoneNumber = obj.phoneNumber;
    restaurant.businessNum = obj.businessNum;

    //open and close times
    restaurant.monOpenTimeId = monOpenId;
    restaurant.tueOpenTimeId = tueOpenId;
    restaurant.wedOpenTimeId = wedOpenId;
    restaurant.thuOpenTimeId = thuOpenId;
    restaurant.friOpenTimeId = friOpenId;
    restaurant.satOpenTimeId = satOpenId;
    restaurant.sunOpenTimeId = sunOpenId;
    restaurant.monCloseTimeId = monCloseId;
    restaurant.tueCloseTimeId = tueCloseId;
    restaurant.wedCloseTimeId = wedCloseId;
    restaurant.thuCloseTimeId = thuCloseId;
    restaurant.friCloseTimeId = friCloseId;
    restaurant.satCloseTimeId = satCloseId;
    restaurant.sunCloseTimeId = sunCloseId;

    //cuisine style id
    restaurant.cuisineStyleId = cuisineId;

    //category id
    restaurant.categoryId = categoryId;

    //price range id
    restaurant.priceRangeId = priceRangeId;

    // for address
    addrId = restaurant.addressId;

    restaurant.save();
  });

  await Address.findById(addrId).then((address) => {
    //address
    address.province = obj.province;
    address.streetName = obj.streetName;
    address.streetNum = obj.streetNum;
    address.postalCode = obj.postalCode;
    address.city = obj.city;

    address.save();
  });
};

module.exports = router;
