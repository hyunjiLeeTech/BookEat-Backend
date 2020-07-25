const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");
const secret = require("./auth/secret");
require("dotenv").config();

const expressSession = require("express-session");
const passport = require("./auth/passport-config");
const jwt = require("jsonwebtoken");

const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require('gridfs-stream');
const methodOverride = require("method-override");

const app = express();
const port = process.env.PORT || 5000;

//database models
let Customer = require("./models/customer.model");
let Account = require("./models/account.model");
let RestaurantOwner = require("./models/restaurantOwner.model");
let Restaurant = require("./models/restaurnat.model");
let Address = require("./models/address.model");
let Manager = require("./models/manager.model");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  expressSession({
    secret: "BookEatAwesome",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

mongoose.set("useUnifiedTopology", true);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => {
  //init stream
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log("MongoDB database connection established successfully");
});

//create storage engine
var storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((res, ref) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return rejects(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        res(fileInfo);
      })
    })
  }
})

const upload = multer({ storage });

// routers
const customersRouter = require("./routes/customers");
const restaurantOwnerRouter = require("./routes/restaurnatOwners");
const cuisineStyleRouter = require("./routes/cuisineStyle");
const priceRangeRouter = require("./routes/priceRange");
const categoryRouter = require("./routes/category");
const accountRouter = require("./routes/account");
const restaurantRouter = require("./routes/restaurant");
const addressRouter = require("./routes/address");
const managerRouter = require("./routes/manager");
const storeTimeRouter = require("./routes/storeTime");
const menuRouter = require("./routes/menu");
const discountRouter = require("./routes/discount");
const reviewRouter = require("./routes/review");

// app.use
app.use(
  "/customers",
  passport.authenticate("jwt", { session: false }),
  customersRouter
);
app.use(
  "/restaurant",
  passport.authenticate("jwt", { session: false }), //FIXME: DEBUGGING
  restaurantRouter
);
app.use(
  "/restaurantOwners",
  passport.authenticate("jwt", { session: false }),
  restaurantOwnerRouter
);
app.use("/cuisineStyle", cuisineStyleRouter);
app.use("/category", categoryRouter);
app.use("/priceRange", priceRangeRouter);

app.use("/account", accountRouter);
app.use("/address", addressRouter);
app.use(
  "/manager",
  passport.authenticate("jwt", { session: false }),
  managerRouter
);
app.use(
  "/menu",
  passport.authenticate("jwt", { session: false }),
  menuRouter
);
app.use(
  "/discount",
  passport.authenticate("jwt", { session: false }),
  discountRouter
);
app.use("/storeTime", storeTimeRouter);
app.use(
  "/review",
  passport.authenticate("jwt", { session: false }),
  reviewRouter
)

app.post("/addMenuImage", upload.single('menuImage'), (req, res) => {
  console.log("Accessing /addMenuImage");
  // console.log(req.body.menuName);
  // console.log(req.file);
  menuImage = req.file;
  // console.log(req.file.id);
  res.json({ errcode: 0, menuImage: req.file.filename });
});

app.get("/getimage", (req, res) => {
  console.log("Accessing /getimage");
  var imageId = req.query.imageId;

  gfs.files.findOne({ filename: imageId }, (err, file) => {
    if (!file) {
      file = { isImage: false, file: 'File not found' };
      return res.json({ errcode: 1, image: file })
    }

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      file.isImage = true;
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      file.isImage = false;
      return res.json({ errcode: 1, file: 'Not an image file' });
    }
  })
})

app.get('/getimages', (req, res) => {
  console.log("Accessing /getimages");
  console.log(req.body);
})

app.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    var u = req.user;
    if (u) {
      console.log("logging out user: " + u.email);
      u.token = "";
      u.save()
        .then(() => {
          res.json({ errcode: 0, errmsg: "You have been logged out" });
        })
        .catch((err) => {
          res.json({ errcode: 1, errmsg: err });
        });
    }
  }
);

//login
app.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, function (
    err,
    user,
    info
  ) {
    if (err) {
      return next(err);
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      return res.json({ errcode: 1, errmsg: info.message });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      console.log("-------req.user-----------");
      console.log(user);
      console.log("-------req.user-----------");
      user.token = "";
      const token = jwt.sign(user.toJSON(), secret.secret, {
        expiresIn: "30 days",
      });
      user.token = token;
      user
        .save()
        .then(() => {
          console.log("User: " + user.email + " access token updated");
          user.password = "";
          user.token = "";
          let returnData = {
            errcode: 0,
            user: user,
            jwt: token,
          };
          res.json(returnData);
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    });
  })(req, res, next);
});

// for user signup
let findAccountByEmailAsyc = async function (email) {
  return await Account.find({ email: email });
};

// for customer signup
let addCustomerAsync = async function (obj) {
  const regExpEmail = RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/);

  const regExpPhone = RegExp(
    /^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/
  );

  const firstName = obj.firstName;
  const lastName = obj.lastName;
  const email = obj.email;
  const phoneNumber = obj.phoneNumber;
  const password = obj.password;
  const userTypeId = obj.userTypeId;

  const newAccount = new Account({
    email,
    password,
    userTypeId,
  });

  let message = "";
  if ((await findAccountByEmailAsyc(email)).length > 0) {
    message = "This email is already registered";
    throw message;
  }

  if (firstName.length < 1) {
    message = "First name should have at least one char";
    throw message;
  }
  if (lastName.length < 1) {
    message = "First name should have at least one char";
    throw message;
  }
  if (!regExpEmail.test(email)) {
    message = "Incorrect email format";
    throw message;
  }

  if (!regExpPhone.test(phoneNumber)) {
    message = "Incorrect phone number";
    throw message;
  }
  let account = await newAccount.save();
  const newCustomer = new Customer({
    firstName,
    lastName,
    phoneNumber,
    noShowCount: 0,
    account: account._id,
  });

  return await newCustomer.save();
};

// post request (/customers/add)
app.post("/customersignup", (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;
  const phoneNumber = req.body.phonenumber;
  const password = req.body.password;
  const userTypeId = 1; //customer
  var obj = {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    userTypeId,
  };
  addCustomerAsync(obj)
    .then(() => {
      res.json({ errcode: 0, errmsg: "success" });
    })
    .catch((err) => {
      res.json({ errcode: 1, errmsg: err });
    });
});
// app.post('/login', passport.authenticate('local', {session: false}), function (req, res) {
//   console.log("-------req.user-----------");
//   console.log(req.user);
//   console.log("-------req.user-----------");
//   var user = req.user;

//   const token = jwt.sign(user.toJSON(), secret.secret, {expiresIn: 50000000});
//   let returnData = {
//     errcode: 0,
//     user: req.user,
//     jwt: token,
//   };
//   res.json(returnData);
// });

//restaurant signup
let addRestaurantOwnerAsync = async function (obj) {
  const regExpEmail = RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/);

  const regExpPhone = RegExp(
    /^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/
  );

  const regExpPostalCode = RegExp(/^\d{5}-\d{4}|\d{5}|[A-Z]\d[A-Z] \d[A-Z]\d$/);

  const regExpBusinessNum = RegExp(/^[0-9]{9}$/);

  //account
  const userTypeId = 2; // restaurant owner
  const password = obj.password;
  const email = obj.email;

  //restaurantOwner
  // this is for restaurant

  //address
  const province = obj.province;
  const streetNum = obj.streetNumber;
  const streetName = obj.streetName;
  const postalCode = obj.postalCode;
  const city = obj.city;

  //restaurant
  const resName = obj.resName;
  const businessNum = obj.businessNum;
  const phoneNumber = obj.phoneNumber;
  const status = obj.status;

  const newAccount = new Account({
    email,
    password,
    userTypeId,
  });

  const newAddress = new Address({
    province,
    streetName,
    streetNum,
    postalCode,
    city,
  });

  let message = "";
  if ((await findAccountByEmailAsyc(email)).length > 0) {
    message = "This email is already registered";
    throw message;
  }

  if (!regExpEmail.test(email)) {
    message = "Incorrect email format";
    throw message;
  }

  if (!regExpPhone.test(phoneNumber)) {
    message = "Incorrect phone number";
    throw message;
  }

  if (!regExpBusinessNum.test(businessNum)) {
    message = "Incorrect business number";
    throw message;
  }

  if (!regExpPostalCode.test(postalCode)) {
    message = "Incorrect postal code";
    throw message;
  }

  if (resName.length < 1) {
    message = "Restaurant name should have at least one char";
    throw message;
  }

  if (streetName.length < 1) {
    message = "Street name should have at least one char";
    throw message;
  }

  if (city.length < 1) {
    message = "City should have at least one char";
    throw message;
  }

  // if (!regExpPassword.test(password)) {
  //   message = "Incorrect password";
  //   throw message;
  // }

  let acnt = await newAccount.save();
  let address = await newAddress.save();

  const newRestaurantOwner = new RestaurantOwner({
    account: acnt._id,
  });

  let restOwner = await newRestaurantOwner.save();

  const newRestaurant = new Restaurant({
    resName,
    phoneNumber,
    businessNum,
    status,
    restaurantOwnerId: restOwner._id,
    addressId: address._id,
  });

  return await newRestaurant.save();
};

app.post("/restaurantownersignup", (req, res) => {
  //account
  const userTypeId = 2; // restaurant owner
  const password = req.body.password;
  const email = req.body.email;

  //restaurantOwner
  // this is for restaurant

  //address
  const province = req.body.province;
  const streetNumber = req.body.streetnumber;
  const streetName = req.body.streetname;
  const postalCode = req.body.postalcode;
  const city = req.body.city;

  //restaurant
  const resName = req.body.resname;
  const businessNum = req.body.businessnumber;
  const phoneNumber = req.body.phonenumber;
  const status = 3; // sign up. not completed the profile

  var obj = {
    userTypeId,
    password,
    email,
    province,
    streetNumber,
    streetName,
    postalCode,
    city,
    resName,
    businessNum,
    phoneNumber,
    status,
  };
  addRestaurantOwnerAsync(obj)
    .then(() => {
      res.json({ errcode: 0, errmsg: "success" });
    })
    .catch((err) => {
      res.json({ errcode: 1, errmsg: err });
    });
});

//manager sign up
let addManagerAsync = async function (obj) {
  //account info
  const email = obj.email;
  const password = obj.password;
  const userTypeId = 3; // manager user type: 3

  //manager info
  const firstname = obj.firstname;
  const lastname = obj.lastname;
  const phonenumber = obj.phonenumber;

  //manager and account info (status)
  const isActive = true; // maanager account activated

  const newAccount = new Account({
    email,
    password,
    userTypeId,
    isActive,
  });

  //Validation
  let message = "";
  const regExpEmail = RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/);

  const regExpPhone = RegExp(
    /^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/
  );

  if ((await findAccountByEmailAsyc(email)).length > 0) {
    message = "This email is already registered";
    throw message;
  }

  if (!regExpEmail.test(email)) {
    message = "Incorrect email format";
    throw message;
  }

  if (!regExpPhone.test(phonenumber)) {
    message = "Incorrect phone number";
    throw message;
  }

  if (lastname.length < 1) {
    message = "Lastname should have at least one char";
    throw message;
  }

  if (firstname.length < 1) {
    message = "Firstname should have at least one char";
    throw message;
  }

  let account = await newAccount.save();

  let restaurantId = await findRestaurantIdAsync(obj.resOwnerAccountId);

  const newManager = new Manager({
    firstname,
    lastname,
    phonenumber,
    isActive,
    accountId: account._id,
    restaurantId,
  });

  return await newManager.save();
};

app.post("/managersignup", (req, res) => {
  console.log("Accessing /managersignup");
  const resOwnerAccountId = req.body.resOwnerAccountId;

  //account info
  const email = req.body.email;
  const password = req.body.passwordMan;

  //manager info
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const phonenumber = req.body.phonenumber;

  obj = {
    email,
    password,
    firstname,
    lastname,
    phonenumber,
    resOwnerAccountId,
  };

  addManagerAsync(obj)
    .then(() => {
      res.json({ errcode: 0, errmsg: "success" });
    })
    .catch((err) => {
      res.json({ errcode: 1, errmsg: err });
    });
});

let findRestaurantIdAsync = async (accountId) => {
  let resOwnerId, resId;
  await RestaurantOwner.findOne({ account: accountId }).then((restOwner) => {
    resOwnerId = restOwner._id;
  });

  await Restaurant.findOne({ restaurantOwnerId: resOwnerId }).then(
    (restaurant) => {
      resId = restaurant._id;
    }
  );

  return resId;
};

app.get(
  "/testAuth",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    var u = req.user; //u is this user that in database - always up to date
    res.json({ message: "Logged in" });
    console.log(req.user);
  }
);

//TODO: menu item, put more information
app.get("/restaurants/:id", async function (req, res) {
  try {
    var rest = await Restaurant.findOne({ _id: req.params.id });
    console.log(req.params.id);
    res.json({ errcode: 0, restaurant: rest });
  } catch (err) {
    console.log(err);
    res.json({ errcode: 1, err: err });
  }
});












async function isTableAvaliableAtTimeAsync(table, datetime, eatingTime) {
  //console.log(datetime);
  var reservation = Reservation.find({
    table: table,
    status: 2,
    dateTime: {
      $gte: moment(datetime).add(0 - eatingTime, 'h').toDate(),
      $lte: moment(datetime).add(eatingTime, 'h').toDate()
    }
  })
  if ((await reservation).length > 0) {
    return false;
  }
  //console.log(moment(datetime).add(0-eatingTime, 'h').toDate());
  //console.log(new Date(datetime))
  return true;
}







// router.route('/search').post((req,res)=>{
//   var numOfPeople = req.body.numOfPeople;
//   var dateTime = req.body.dateTime;

// })

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
