if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
  port: 3000 || process.env.PORT
};

