const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { category } = require('./adoptCat');

// Initialize an object to keep track of intervals by channel ID
const activeIntervals = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat_behaviour')
        .setDescription('Simulate a cat walking over the keyboard.')
        .addIntegerOption(option =>
            option.setName('interval')
            .setDescription('Interval time in minutes')
            .setRequired(false))
        .addBooleanOption(option =>
            option.setName('stop')
            .setDescription('Stop the loop')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    category: 'util',
    async execute(interaction) {
        const intervalTime = interaction.options.getInteger('interval');
        const channel = interaction.channel;
        const stop = interaction.options.getBoolean('stop');

        if (stop) {
            // If stop option is used, check if a loop is running
            if (!activeIntervals[interaction.channel.id]) {
                await interaction.reply({ content: 'No loop is currently running in this channel.', ephemeral: true });
                return;
            }

            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('confirm_stop')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId('cancel_stop')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
                );

            await interaction.reply({
                content: 'Are you sure you want to stop the loop?',
                components: [row],
                ephemeral: true
            });

            // Button interaction handling logic goes here
            const filter = i => i.customId === 'confirm_stop' || i.customId === 'cancel_stop';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm_stop') {
                    clearInterval(activeIntervals[channel.id]);
                    delete activeIntervals[channel.id];
                    await i.update({ content: 'Loop stopped.', components: [] });
                } else if (i.customId === 'cancel_stop') {
                    await i.update({ content: 'Loop not stopped.', components: [] });
                }
            });
        }

        // Check if an interval is already running for this channel
        if (activeIntervals[channel.id] && !stop) {
            await interaction.reply({ content: 'A loop is already running in this channel.', ephemeral: true });
            return;
        }

        // Start the loop
        if (!stop && !activeIntervals[channel.id]) {
            if (!intervalTime) {
                await interaction.reply({ content: 'Please provide an interval time.', ephemeral: true });
                return;
            }


            await interaction.reply({ content: `Starting the loop with an interval of ${intervalTime} minute(s)...`, ephemeral: true });

            const interval = setInterval(async() => {
                console.log('Sending a random message');
                const randomMessage = generateRandomString(100);

                await channel.send(randomMessage);
            }, intervalTime * 60 * 1000);

            // Store the interval ID using the channel ID as the key
            activeIntervals[channel.id] = interval;

            // Listen for a command to stop the loop
            interaction.client.on('interactionStop', (stoppedInteraction) => {
                if (stoppedInteraction.commandName === 'loop' && activeIntervals[channel.id]) {
                    console.log('Stopping the loop');
                    clearInterval(activeIntervals[channel.id]);
                    delete activeIntervals[channel.id];
                }
            });
        }
    },
};

// Function to generate a random string of a given length
function generateRandomString(length) {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,./;'[]` +-/*";
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}