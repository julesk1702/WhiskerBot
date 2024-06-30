// Pet cat command is a command that allows users to pet their adopted cat. The command will update the lastPetted field in the database and increase the cat's happiness by 10.
// It will simulate cat behaviour and randomly generate a response from the cat when petted. As well as give the chance for the cat to walk away if the user pets it too much, therefor not increasing the cat's happiness.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { AdoptionCollection } = require("../Collections/adoptionCollection");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Pet your adopted cat'),
    category: 'Cat',
    async execute(interaction) {
        const userId = interaction.user.id;

        const petResponses = [
            "purrs happily",
            "looks at you with big eyes",
            "nuzzles your hand",
            "rolls over for a belly rub",
            "licks your hand",
            "paws at your hand",
        ];

        const walkAwayChance = 0.2;

        try {
            const hasAdopted = await AdoptionCollection.findOne({ userId: userId });

            if (!hasAdopted) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Pet Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('You have not adopted any cats yet.')
                    .setFooter({ text: 'Use /adopt_cat to adopt a new cat.' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (Math.random() < walkAwayChance) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Pet Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('Your cat walks away from you. 😿')
                    .setFooter({ text: 'Your cat is not in the mood to be petted right now.' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            } else if (hasAdopted.happiness >= 100) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Pet Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription('Your cat is already purring with happiness! 😸')
                    .setFooter({ text: `No need to pet your cat right 'meow'.` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const randomResponse = petResponses[Math.floor(Math.random() * petResponses.length)];

            const isUpdated = await AdoptionCollection.updateOne({ userId: userId }, { lastPetted: new Date(), $inc: { happiness: 10 } });

            if (isUpdated.matchedCount > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🐱 Pet Your Cat 🐱')
                    .setColor('#FF69B4')
                    .setDescription(`You pet your cat. It ${randomResponse}.`)
                    .setFooter({ text: 'Your cat is happy!' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to pet your cat.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to pet your cat.', ephemeral: true });
        }
    },
};