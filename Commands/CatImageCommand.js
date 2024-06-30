// Slash command that sends a random cat picture from TheCatAPI
// using the following endpoint: https://api.thecatapi.com/v1/images/search

const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Sends a random cat image!'),
    async execute(interaction) {
        const response = await fetch('https://api.thecatapi.com/v1/images/search', {
            headers: {
                'x-api-key': process.env.API_KEY,
            }
        });
        const json = await response.json();
        await interaction.reply(json[0].url);
    },
};