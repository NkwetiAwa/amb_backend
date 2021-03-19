const router = require('express').Router();
const db = require('./../models');
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const fs = require('fs');
const Op = require('Sequelize').Op;

const Merchants = db.merchant;
const Products = db.products;
const Transactions = db.transactions;

//Signing up new merchant users
router.route('/signup').post( async(req, res) => {
  const body = req.body;

  const newMerchant = { fullname: body.fullname, username: body.username.toLowerCase(), email: body.email, password: bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null), country: body.country };

  const save = await Merchants.create(newMerchant);
  if(save){
    return res.send({
      status: true,
      response: save,
    });
  }else{
    return res.send({
      status: false
    });
  }
});


//Loging in merchant users
router.route('/login').post( async(req, res) => {
  const mail = req.body.mail.toLowerCase();
  const pass = req.body.pass;
  var stat = 0, response;

  const user = await Merchants.findOne({  where: {
    [Op.or]: [{ username: mail}, { email: mail }]
  }  });
  if(user){
    const password = user.password;
    if(bcrypt.compareSync(pass, password)){
      stat = 1;
      response = user;
    }
  }else{
    stat = -1;
  }

  return res.send({ 
    stat: stat,
    response: response,
    type: 1,
  })
})



//Username check
router.route('/username').post( async(req, res) => {
  const username = req.body.username.toLowerCase().trim();
  
  const checker = await Merchants.findOne({ where: { username: username }});
  if(checker){
    return res.send({
      status: false
    });
  }else{
    return res.send({
      status: true
    })
  }
})


//Get all user information for dashboard
router.route('/dashboard').post( async(req, res) => {
  const username = req.body.username.toLowerCase();
  var stat = false, response;

  const user = await Merchants.findOne({ where: { username: username }});
  if(user){
    stat = true;
    response = user;
  }

  return res.send({
    stat: stat,
    response: response
  })
});


//Update profile picture
router.route('/edit/photo').post( async(req, res) => {
  const formData = new formidable.IncomingForm();
  var pic, stat = false;
  formData.parse(req, async (error, fields, files) => {
    const { username } = fields;
    if(files.picture){
      var picExtension = files.picture.name.substr(files.picture.name.lastIndexOf("."));
      const time = Date.now();
      var newPath = "profiles/merchants/" + username + "_" + time + picExtension;
      fs.rename(files.picture.path, newPath, (err) => {
        return;
      });

      pic = "profiles/merchants/"+ username + "_" + time + picExtension;
      const user = await Merchants.findOne({ where: { username: username }});
      if(user){
        userid = user.id;
        const saver = await Merchants.update( { picture: pic}, { where: { id: userid }});
        stat = true;
      }
    }
    return res.send({
      stat: stat,
      pic: pic
    })
  })
})

// Update Merchant settings
router.route('/edit/usersettings').post( async(req, res) => {
  const nusername = req.body.nusername.toLowerCase().trim();
  const { email, fullname, username } = req.body;
  var stat = false;
  const user = await Merchants.findOne({ where: {username: username}});
  if(user){
    const userid = user.id;
    await Merchants.update({ username: nusername, email: email, fullname: fullname }, { where: {id: userid }});
    stat = true;
  }
  return res.send({
    stat: stat
  })
});


//Update Merchant contact information
router.route('/edit/contactinfo').post( async(req, res) => {
  const { username, address, country, state, contact } = req.body;
  var stat = false;
  const user = await Merchants.findOne({ where: { username: username }});
  if(user){
    const userid = user.id;
    await Merchants.update({ address: address, country: country, state: state, contact: contact}, { where: {id: userid}});
    stat = true;
  }
  return res.send({ stat: stat });
})


//Get Information for the NavBar
router.route('/navbar').post( async(req, res) => {
  const username = req.body.username.toLowerCase();
  const user = await Merchants.findOne({ where: { username: username }});
  if(user){
    return res.send({
      stat: true,
      fullname: user.fullname,
      picture: user.picture,
    });
  }else{
    return res.send({
      stat: false
    })
  }
})


//Check if the merchant's account has been activared
router.route('/checkactivated').post( async(req, res) => {
  const username = req.body.username.toLowerCase();
  var stat = false, activated = false;
  const user = await Merchants.findOne({ where: { username: username }});
  if(user){
    stat = true;
    activated = user.active
  }
  return res.send({
    stat: stat,
    activated: activated
  })
})


//Activate an account
router.route('/activator').post( async(req, res) => {
  const username = req.body.username.toLowerCase().trim();
  const user = await Merchants.findOne({ where: { username: username }});
  const userid = user.id;
  await Merchants.update({ active: true, payment_date: Date.now() }, { where: {id: userid}});
  return res.send({
    status: true
  });
})


//Get all merchant's products
router.route('/products').post( async(req, res) => {
  const username = req.body.username.toLowerCase();
  const user = await Merchants.findOne({ where: { username: username }});
  const products = await Products.findAll({ where: { merchant_id: String(user.id) }, order: [['id', 'DESC' ]] });
  const transactions = await Transactions.findAll({ where: { merchant_id: user.id }, order: [['id', 'DESC' ]] });
  return res.send({
    stat: true,
    products: products,
    transactions: transactions,
    user: user
  });
})


//Get information for merchant user view by non mertchant user
router.route("/viewmerchant").post( async(req, res) => {
  const username = req.body.username;
  var products = [];
  const user = await Merchants.findOne({ where: {username: username} });
  if(user){
    products = await Products.findAll({ where: {merchant_id: String(user.id)} });
  }

  return res.send({
    user: user,
    products: products,
  })
});



//Show api response
router.route('/payment').post( async(req, res) => {
  console.log("PAYMENT ROUTE REACHED");
  console.log(req.body);
  const { transaction_id, transaction_amount, transaction_status, error, message } = req.body;
  if(transaction_status === "SUCCESS"){
    console.log("Payment went through");
  }else{
    console.log("Payment Failed");
  }
})

module.exports = router;