const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');


const urlEncodedParser = bodyParser.urlencoded({
    extended: true,
 });


const reviewController = require('../controllers/reviewController');

//posting a new review
router.post('/comment', urlEncodedParser, reviewController.addNewReview);

router.get('/comment', reviewController.getReview);


module.exports = router;