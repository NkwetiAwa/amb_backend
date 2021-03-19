const db = require('./../../models');
const Op = require('Sequelize').Op;
const Merchants = db.merchant;


const Disactivator = async() => {
  const merchants = await Merchants.findAll({ where: { active: true } });
  await Promise.all(merchants.map(async i => {
    var valid;
    valid = monthChecker(new Date(i.payment_date), new Date(Date.now()));
    if(valid >= 1){
      await Merchants.update({ active: false }, { where: {id: i.id}});
    }
  }))
}

function monthChecker(dateFrom, dateTo) {
  return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
}


module.exports = { Disactivator };