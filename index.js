const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const { initializeCronJobs } = require('./utils/scheduledTasks');
const keepAlive = require('./server');

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

initializeCronJobs();

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Bot is ready!');
    client.guilds.cache.forEach(guild => {
        guild.commands.set(client.commands.map(command => command.data));
    });
});

// Listens to incoming messages and checks if it has a certain word and react to it with an emoji
client.on('messageCreate', async message => {
    if (message.content.includes('cat')) {
        message.react('🐱');
    }

    if (message.content.includes('meow')) {
        message.reply('Meow!');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
keepAlive();