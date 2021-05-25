if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
require('body-parser-xml-json')(bodyParser);
const webServerConfig = require(__base + 'config/web-server.js');
const router = require(__base + 'routes/router.js');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const kue = require('kue');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const port = require(__base + 'config/web-server.js');
var cors = require('cors');
const timeout = require('connect-timeout');
const helmet = require("helmet");

let httpServer;

function initialize() {    
    return new Promise((resolve, reject) => {
        const app = express();
        httpServer = http.createServer(app);
        httpServer.timeout = parseInt(process.env.APP_TIMEOUT);
        app.use(helmet());
        app.use(timeout(parseInt(process.env.APP_TIMEOUT)));
        const swaggerOption = getSwaggerOption();        

        const accessLogStream = rfs('access.log', { interval: '1d', path: path.join(__dirname, '../logs') });
        const swaggerDocs = swaggerJsDoc(swaggerOption);
        if (process.env.NODE_ENV !== 'production') {
            app.use('/api/v1/bliartinc/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
        }		
        app.use(morgan('combined', { stream: accessLogStream }));
        app.use(bodyParser.urlencoded({ extended: false }));
        
        var corsOptionsDelegate = function (req, callback) {
            var corsOptions;
            corsOptions = { origin: true };
            callback(null, corsOptions); // callback expects two parameters: error and options
        }
        app.use(cors(corsOptionsDelegate));
        
        //app.use(bodyParser.json());
        //app.use(kue.app);
        app.use(bodyParser.xml({
            xmlParseOptions: {
              compact: true 
            }
          }));
        
        app.use('/api/v1', router);
    
        httpServer.listen(webServerConfig.port)
            .on('listening', () => {
                logger.info(`Web server listening on localhost:${webServerConfig.port}`);

                resolve();
            })
            .on('error', err => {
                logger.error(err);
                reject(err);
            });
    });
}

function getSwaggerOption(){
    const swaggerOption = {
        swaggerDefinition: {
            info: {
                title: 'Customer API Documentation for BLI Incoming from Arta jasa',
                version: '1.0.0',
                description: 'Customer API Information',
                contact: {
                    email: 'andi.sugito@bhinnekalife.com'
                },
                servers: [`localhost:${port}`]
            },
            tags: [
                {
                    name: 'BLIARTINC',
                    description: 'BLI API INCOMING REQUEST'
                },
                
            ],
            //host: `localhost:3000`,
            basePath: '/api/v1'
        },
        //['../routes/*.js']
        apis: [__base + "routes/*.js"],
        schemes : [ 'http','https' ]
    } 
    return swaggerOption;
}

function getCorsOptions(){
    var allowedOrigins = ['http://localhost.com:8182','http://yourapp.com'];

    var options = {
    origin: function(origin, callback){    // allow requests with no origin 
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);    
        
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }    
        return callback(null, true);
        }
    }
    return options;
}

module.exports.initialize = initialize;

function close() {
    return new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) {
                logger.error(err);
                reject(err);
                return;
            }

            resolve();
        });
    });
}

module.exports.close = close;

const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function reviveJson(key, value) {
    // revive ISO 8601 date strings to instances of Date
    if (typeof value === 'string' && iso8601RegExp.test(value)) {
        return new Date(value);
    } else {
        return value;
    }
}