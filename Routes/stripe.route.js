const express = require('express')
const router = express.Router();
const {payment} = require('../Controllers/stripe.controller')

router.post('/createpayment',payment);
module.exports = router;