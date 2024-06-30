const { SlashCommandBuilder } = require('@discordjs/builders');
const { AdoptionCollection } = require("../Collections/adoptionCollection");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adopt')
        .setDescription('Adopt a virtual cat')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('Name of the cat')
            .setRequired(true)),
    category: 'Cat',
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const userId = interaction.user.id;

        try {
            const existingAdoption = await AdoptionCollection.findOne({ userId: userId });

            if (existingAdoption) {
                await interaction.reply({ content: 'You have already adopted a cat.', ephemeral: true });
                return;
            }

            const picturesDir = path.join(__dirname, '../assets/cat_pictures');
            const pictures = await fs.readdir(picturesDir);
            const randomPicture = pictures[Math.floor(Math.random() * pictures.length)];

            const imageUrl = path.join(picturesDir, randomPicture);
            const attachment = new AttachmentBuilder(imageUrl, { name: randomPicture });

            const happiness = 100;
            const hunger = 50;

            const adoptionRecord = new AdoptionCollection({
                userId: userId,
                catName: name,
                catPicture: randomPicture,
                adoptionDate: new Date(),
                lastFed: null,
                lastPetted: null,
                happiness: happiness,
                hunger: hunger,
            });

            const isAdded = await adoptionRecord.save();

            if (isAdded) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 New cat adopted! 🐱')
                    .setDescription(`Congratulations, ${interaction.user.username}! You've successfully adopted a cat named **${name}**.`)
                    .setColor('#FF69B4')
                    .addFields({ name: 'Cat Name', value: name, inline: true }, { name: 'Adoption Date', value: new Date().toLocaleDateString(), inline: true }, { name: 'Happiness', value: `${happiness}`, inline: true }, { name: 'Hunger', value: `${hunger}`, inline: true })
                    .setImage(`attachment://${randomPicture}`, { size: 256 })
                    .setFooter({ text: 'Use /view_cat to see all your adopted cats.' })
                    .setTimestamp();

                await interaction.reply({ content: '🎉 You have successfully adopted a cat! 🎉', embeds: [embed], files: [attachment], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to adopt a cat.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to adopt a cat.', ephemeral: true });
        }
    }
};