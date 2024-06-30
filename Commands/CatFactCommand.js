// slash command that sends a random cat fact from the following endpoint: https://catfact.ninja/fact

const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catfact')
        .setDescription('Sends a random cat fact!'),
    async execute(interaction) {
        const response = await fetch('https://catfact.ninja/fact');
        const json = await response.json();
        await interaction.reply(json.fact);
    },
};