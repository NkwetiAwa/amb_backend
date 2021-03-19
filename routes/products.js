const router = require('express').Router();
const db = require('./../models');
const fs = require('fs');
const formidable = require('formidable');
const Op = require('Sequelize').Op;

const Merchants = db.merchant;
const Products = db.products;


router.route("/").post((req, res, next) => {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = "./products";
  form.keepExtensions = true;
  form.maxFieldsSize = 100 * 1024 * 1024 // 100MB
  form.parse(req, async function(err, fields, files){
    var images = [], video, userid;
    const { username, name, price, color, quantity, description } = fields;
    const category = JSON.parse(fields.categories);
    var stat = false;
    
    var arrayOfFiles = files[""];
    if(arrayOfFiles.length > 0){
      arrayOfFiles.forEach((eachFile) => {
        if(eachFile.type === "video/mp4"){
          video = eachFile.path.split("\\").join('/');
        }else if(eachFile.type === "image/jpeg"){
          images.push(eachFile.path.split("\\").join('/'));
        }
      });
    }

    const user = await Merchants.findOne({ where: { username: username }});
    if(user){
      userid = user.id;

      const newProduct = { merchant_id: userid, name: name, price: price, color: color, quantity: quantity, description: description, images: images, video: video, category: category };
      const save = await Products.create(newProduct);
      if(save){
        return res.json({
          stat: true,
          product: save
        });
      }else{
        return res.json({
          stat: false
        });
      }
    }
  })
});



//Get a single product
router.route("/one").post( async(req, res) => {
  const { id, username } = req.body;
  var userid = 0;
  if(username !== 0){
    const user = await Merchants.findOne({ where: { username: username }});
    userid = user.id;
  }
  const product = await Products.findOne({ where: { id: id }});
  if(product){
    const merchantid = product.merchant_id;
    if(merchantid != userid){
      await Products.increment({clicks: 1}, {where: {id: id}});
    }
    const merchant = await Merchants.findOne({ where: { id: merchantid }});

    return res.send({
      stat: true,
      product: product,
      merchant: merchant,
    })
  }else{
    return res.send({
      stat: false
    });
  }
})


//Delete a product
router.route("/delete").post( async(req, res) => {
  const { id, username } = req.body;
  const user = await Merchants.findOne({ where: { username: username }});
  const product = await Products.findOne({ where: { id: id, merchant_id: String(user.id) }});
  if(product){
    await Products.destroy({ where: { id: id }});
  }
  return res.send({
    stat: true
  })
})



//Get products similar to the current product to suggest to viewer
router.route("/suggest").post( async(req, res) => {
  const id = req.body.id;
  var response = [], ids = [id];
  const product = await Products.findOne({ where: { id: id }});
  const cats = product.category;

  await Promise.all(
    cats.map(async(cat) =>{
      const yam = await Products.findOne({
        where: {
          category: {
            [Op.contains]: [cat]
          }
        }, order: db.sequelize.random()
      })
      if(yam.id != id && !response.find(i => i.id === yam.id)){
        response.push(yam);
        ids.push(yam.id);
      }
    })
  )

  const rem = response.length;
  if(rem<7){
    const m = 7 - rem;
    const yelp = await Products.findAll({ where: { merchant_id: product.merchant_id,
      id: {
        [Op.notIn]: ids
      } }, order: db.sequelize.random(), limit: m })
    response = [...response, ...yelp];
  }


  return res.send({
    response: response
  })
})



//Promote a product
router.route("/promotion").post( async(req, res) => {
  const product = req.body.product;
  const newprice = req.body.newprice;
  var status = false, yam = [];

  yam = await Products.update({ newprice: newprice }, { where: {id: product}});
  if(yam){
    status = true;
    yam = await Products.findOne({ where: {id: product }});
  }

  return res.send({
    status: status,
    product: yam,
  });
})

module.exports = router;