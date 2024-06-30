// Feed command for the virtual cat needs to check if the user has adopted a cat and then update the lastFed field in the database. The command will also check if the user has already fed the cat in the last 4 hours
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AdoptionCollection } = require("../Collections/adoptionCollection");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feed')
        .setDescription('Feed your adopted cat'),
    category: 'Cat',
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const hasAdopted = await AdoptionCollection.findOne({ userId: userId });

            if (!hasAdopted) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Feed Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('You have not adopted any cats yet.')
                    .setFooter({ text: 'Use /adopt_cat to adopt a new cat.' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const lastFed = new Date(hasAdopted.lastFed);
            const currentTime = new Date();

            // Check if the user has already fed the cat in the last 4 hours
            if (currentTime - lastFed < 4 * 60 * 60 * 1000) {
                const timeUntilNextFeeding = 4 * 60 * 60 * 1000 - (currentTime - lastFed);

                // Convert timeUntilNextFeeding from milliseconds to hours and minutes
                const hours = Math.floor(timeUntilNextFeeding / (1000 * 60 * 60));
                const minutes = Math.floor((timeUntilNextFeeding % (1000 * 60 * 60)) / (1000 * 60));

                const countdownMessage = `You can feed your cat again in ${hours} hours and ${minutes} minutes.`;

                const embed = new EmbedBuilder()
                    .setTitle('🐱 Feed Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('You have already fed your cat in the last 4 hours.')
                    .setFooter({ text: countdownMessage })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            } else if (hasAdopted.hunger >= 100) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Feed Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('Your cat is already full. 😺')
                    .setFooter({ text: 'No need to feed your cat right "meow".' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const isUpdated = await AdoptionCollection.updateOne({ userId: userId }, { lastFed: currentTime, $inc: { hunger: 25 } });

            if (isUpdated.matchedCount > 0) {
                const nextFeedingTime = new Date(currentTime);
                nextFeedingTime.setHours(nextFeedingTime.getHours() + 4);

                const embed = new EmbedBuilder()
                    .setTitle('🐱 Feed Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('You have successfully fed your cat.')
                    .setFooter({ text: `Next feeding time: ${nextFeedingTime.toLocaleTimeString()}` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to feed your cat.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to feed your cat.', ephemeral: true });
        }
    }
};