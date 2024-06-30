// Schedule cron job for decreasing the hunger of all cats every 1 hour. Never let the hunger value go below 0.
const { AdoptionCollection } = require("../Collections/adoptionCollection");
const cron = require('node-cron');

function initializeCronJobs() {
    cron.schedule('0 * * * *', async() => {
        console.log('Running cron job to decrease hunger of all cats');
        try {
            // decrease hunger of all cats by 5
            const updatedCats = await AdoptionCollection.updateMany({ hunger: { $gt: 0 } }, { $inc: { hunger: -5 } });
            console.log(`Decreased hunger of ${updatedCats.modifiedCount} cats`);
        } catch (error) {
            console.error(error);
        }
    });

    // Schedule cron job for decreasing happiness of all cats every 30 minutes. Never let the happiness value go below 0.
    cron.schedule('*/30 * * * *', async() => {
        console.log('Running cron job to decrease happiness of all cats');
        try {
            const updatedCats = await AdoptionCollection.updateMany({ happiness: { $gt: 0 } }, { $inc: { happiness: -5 } });
            console.log(`Decreased happiness of ${updatedCats.modifiedCount} cats`);
        } catch (error) {
            console.error(error);
        }
    });
}

module.exports = { initializeCronJobs };