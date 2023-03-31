require('dotenv').config();
const configEnv = {
    APPLICATION_ID: process.env.APPLICATION_ID ,
    API_KEY:process.env.API_KEY
};

module.exports = {configEnv};
