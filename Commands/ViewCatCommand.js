// View cat command
// This command allows users to view all the cats they have adopted. It fetches the cat data from the database and sends an embed containing the cat information.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { AdoptionCollection } = require("../Collections/adoptionCollection");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view_cat')
        .setDescription('View all your adopted cats'),
    category: 'Cat',
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            let catImage = null;

            const hasAdopted = await AdoptionCollection.findOne({ userId: userId });

            if (!hasAdopted) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Your Adopted Cats 🐱')
                    .setColor('#FF69B4')
                    .setDescription('You have not adopted any cats yet.')
                    .setFooter({ text: 'Use /adopt_cat to adopt a new cat.' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            catImage = hasAdopted.catPicture;

            const embed = new EmbedBuilder()
                .setTitle('🐱 Your Adopted Cats 🐱')
                .setColor('#FF69B4')
                .setFooter({ text: 'Use /adopt_cat to adopt a new cat.' })
                .addFields({ name: 'Cat Name', value: hasAdopted.catName, inline: true }, { name: 'Adoption Date', value: hasAdopted.adoptionDate.toLocaleDateString(), inline: true }, { name: 'Happiness', value: `${hasAdopted.happiness}`, inline: true }, { name: 'Hunger', value: `${hasAdopted.hunger}`, inline: true })
                .setImage(`attachment://${hasAdopted.catPicture}`, { size: 256 })
                .setTimestamp();

            const attachment = new AttachmentBuilder(`./assets/cat_pictures/${catImage}`, { name: catImage });

            await interaction.reply({ embeds: [embed], files: [attachment], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch your cats.', ephemeral: true });
        }
    },
};