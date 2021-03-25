const router = require('express').Router();
const db = require('./../models');
const bcrypt = require('bcrypt');
const Op = require('sequelize').Op;
const formidable = require('formidable');
const fs = require('fs');
//const { json } = require('sequelize/types');

const myUser =  db.user;

router.route('/signup').post(async(req,res) => {
    if (!req.body.fname) {
        res.status(400).send({
          message: "details are empty"
        });
        console.log("there is nothing to show");
        return;
      }
        const data = req.body;
        const firstname = data.fname;
        const lastname = data.lname;
        const fullname = firstname + " " + lastname;

        const newUser = {fullname: fullname,email: data.email, password: bcrypt.hashSync(data.pass, bcrypt.genSaltSync(8), null)};
        const finish = await myUser.create(newUser);

        if(finish){
            return res.send({
                success: "user added",
                finish: finish
            });
        }else{
            return res.send({
                error: "nothing happened"
            });
        }

        
});

router.route('/users').get(async(req,res) =>{
        const yam = await myUser.findAll();
        return res.send({
            all: yam
        })
});

router.route('/users/:email').get(async(req,res) =>{
    // if (!req.params.title) {
    //     res.status(400).send({
    //       message: "details are empty"
    //     });
    //     return;
    //   }
    const email = req.params.email;
    var condition = email ? { email: { [Op.iLike]: `%${email}%` } } : null;
    const yam = await myUser.findOne({where: condition});
    return res.send({
        all: yam
    })
});

//login 
router.route('/login').post( async(req, res) => {
  if (!req.body.email) {
    res.status(400).send({
      message: "details are empty"
    });
    console.log("there is nothing to show");
    return;
  }
    const mail = req.body.email.toLowerCase();
    const pass = req.body.password;
    var stat = 0, userid, uname;
  
    const user = await myUser.findOne({  where: {email: mail} });
    if(user){
      const password = user.password;
      if(bcrypt.compareSync(password, pass)){
        stat = 1;
        userid = user.id;
        uname = user.fullname;
      }
    }else{
      stat = -1;
    }

    return res.send({ 
      stat: stat,
      userid: user.id,
      type: 0,
      uname: user.fullname
    })
  });

  router.route('/updateuser').post(async(req,res)=>{
    if (!req.body.email) {
      res.status(400).send({
        message: "details are empty"
      });
      console.log("there is nothing to show");
      return;
    }
    const details = req.body;
    const id = details.id;
    const fields = {
            fullname: details.fullname,
            email: details.email
            };
    const condition = {where: {id : id}};
    const newdetails = await myUser.update(fields, condition);
    if(newdetails){
      const user_details = await myUser.findOne({  where: {id: id} });
      res.send({ user_details });
    }else{
      res.status(500).send({message: "an error occured"});
    }
  });


  router.route('/contactupdate').post(async(req,res)=>{
    if (!req.body.contact) {
      res.status(400).send({
        message: "details are empty"
      });
      console.log("there is nothing to show");
      return;
    }
    const details = req.body;
    const id = details.id;
    const fields = {
            contact: details.contact,
            country: details.country,
            state: details.state
            };
    const condition = {where: {id : id}};
    const newdetails = await myUser.update(fields, condition);
    if(newdetails){
      const user_details = await myUser.findOne({  where: {id: id} });
      res.send({ user_details });
    }else{
      res.status(500).send({message: "an error occured"});
    }
  });

  router.route('/addpicture').post( async(req, res) => {
    const formData = new formidable.IncomingForm();
    formData.multiples = false;
    formData.uploadDir = "./profiles/user";
    formData.keepExtensions = true;
    formData.maxFieldSize = 5 * 1024 * 1024;
    formData.parse(req, async function(error, fields, files){//arrow function can also be used here without the function key word
      // var pic, stat = false;
      const { id, name } = fields;
      // if(files.picture){
      //   var picExtension = files.picture.name.substr(files.picture.name.lastIndexOf("."));
      //   const time = Date.now();
      //   var newPath = "profiles/user/" + name + "_" + time + picExtension;
      //   fs.rename(files.picture.path, newPath, (err) => {
      //     return;
      //   });
        // pic = "profiles/user/"+ name + "_" + time + picExtension;
      //   updates = { picture: pic };
      //   const saver = await myUser.update( updates, { where: { id: id }});
      //   if(saver){
      //     stat = true;
      //   }
      // }else{
      //  res.status(500).send({message: "there was anerror saving the file"});
      // }
      var arrayOfFiles = files[""];
      const pic = arrayOfFiles.path.split("\\").join("/");
      const updates = { picture: pic };
      const saver = await myUser.update( updates, { where: { id: id }});
      if(saver){
        res.status(200).send({message:"successfull", stat: 0});
      }else{
        res.status(500).send({message:"failed", stat: 9});
      }
      
    });
  
  });

  router.route('/getdetails').post(async(req,res) =>{
    const user_details = await myUser.findOne({  where: {email: req.body.remail} });
      res.send(user_details);
  });

  router.route('/delete').get( async(req,res)=>{
    const del = await myUser.destroy({
      where:{},
      trucate:false
    })

    if(del){
      res.send({result: 'deleted'});
    }else{
      res.status.send(500).send({
        result: 'bad'
      });
    }

  });


  router.route('/navbar').post( async(req, res) => {
    const userid = req.body.userid;
    const user = await myUser.findOne({ where: { id: userid }});
    return res.send({
      picture: user.picture,
      fullname: user.fullname
    })
  })
  
  
module.exports = router;