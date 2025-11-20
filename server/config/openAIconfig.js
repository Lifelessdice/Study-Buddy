const {configuration, openai} = require('openai');
require('dotenv').config();

const configuration = new configuration({
    apiKey: process.env.OPEN_AI_KEY
});

const openai = new openai(configuration);

module.exports = openai;