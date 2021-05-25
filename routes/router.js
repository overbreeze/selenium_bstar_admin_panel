const express = require('express');
const kue = require('kue');
const router = express.Router();

const swaggerUi = require('swagger-ui-express')
    , swaggerDocument = require(__base + 'swagger.json')
    , options = { explorer: true }
    ;


module.exports = router;
