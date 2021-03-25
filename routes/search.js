const router = require('express').Router();
const { read } = require('fs');
const db = require('./../models');
const Op = require('sequelize').Op;

const Merchants = db.merchant;
const products = db.products;
const myUser =  db.user;

router.route('/').post(async(req,res)=>{
        if(!req.body.search){
            res.status(400).send({
                message: "there is no search item"
              });
              console.log("no search item");
              return;
        }
        const search = req.body.search;
        //const found = [];
        var condition = search ? {fullname: { [Op.iLike]: `%${search}%` } } : null;
        var condition2 = search ? {name: { [Op.iLike]: `%${search}%` } } : null;
        var category_condition = search ? {category: {[Op.contains]: [search]} } : null;

        //users found
        try{
            const users_found = await Merchants.findAll({where: condition});
            const products_found = await products.findAll({where: condition2, order: db.sequelize.random() });
            const found_by_category = await products.findAll({where: category_condition });
            products_found.concat(found_by_category);
            res.send({
                product: products_found,
                users: users_found,
            });
        }catch(err){
            res.status(500).send({
                error: err || "something happened try again"
            });
        }
        
});

router.route('/home').get(async(req,res)=>{
    try{
        const ourmerchants = await Merchants.findAll({ limit: 12, order: [['id', 'DESC']], offset: 4 });
        const ourproducts = await products.findAll({ limit: 12});
        const prod = await Promise.all(ourproducts.map(async i => {
          const yam = await Merchants.findOne({ where: {id: i.merchant_id }})
          return { p: i, m: yam}
        }))
        res.send({
            products: prod,
            sellers: ourmerchants
        })
    }catch(err){
        res.status(500).send(
            {error : err || "something went wrong"}
        )
    }
});

router.route('/scroll').post(async(req,res) => {
    try {
        const off = req.body.data;
        const ourmerchants = await Merchants.findAll({ limit: 12, order: [['id', 'DESC']], offset: 4 });
        const ourproducts = await products.findAll({ limit: 12});
        const prod = await Promise.all(ourproducts.map(async i => {
          const yam = await Merchants.findOne({ where: {id: i.merchant_id }})
          return { p: i, m: yam}
        }))
        res.send({
            products: prod,
            sellers: ourmerchants
        })
    } catch (err) {
        res.status(500).send({
            message: err || "something terrible occured"
        })
    }
})

module.exports = router;