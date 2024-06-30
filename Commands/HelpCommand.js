const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('Specific command to get more information about')),
    async execute(interaction) {
        const command = interaction.options.getString('command');
        const commands = interaction.client.commands;

        if (!command) {
            const categories = {};

            // Group commands by category
            commands.forEach(cmd => {
                const category = cmd.category || 'General';
                if (category === 'util') return;

                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(cmd);
            });
            const colorDecimal = parseInt('FF69B4', 16);

            const embed = new EmbedBuilder()
                .setTitle('📚 Available Commands 📚')
                .setColor(colorDecimal)
                .setDescription('Here is a list of all available commands grouped by category.')
                .setFooter({ text: 'Use /help <command> to get more information on a specific command.' })
                .setTimestamp();

            // Add fields for each category
            for (const category in categories) {
                embed.addFields({ name: `**${category}**`, value: categories[category].map(cmd => cmd.data.name).join(', ') });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const cmd = commands.get(command);

            if (!cmd) {
                await interaction.reply({ content: 'That command does not exist.', ephemeral: true });
                return;
            }
            const colorDecimal = parseInt('FF69B4', 16);
            const embed = new EmbedBuilder()
                .setTitle(`📚 Command: ${cmd.data.name} 📚`)
                .setColor(colorDecimal)
                .setDescription(cmd.data.description)
                .addFields({ name: 'Options', value: cmd.data.options ? cmd.data.options.map(option => option.name).join(', ') : 'None' })
                .setFooter({ text: 'Use /help to see all available commands.' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};