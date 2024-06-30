// AdoptionCollection for the adoption collection in mongodb
const mongoose = require("../utils/database");

const adoptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    catName: {
        type: String,
        required: true,
    },
    catPicture: {
        type: String,
        required: true,
    },
    adoptionDate: {
        type: Date,
        required: true,
    },
    lastFed: {
        type: Date,
        required: false,
    },
    lastPetted: {
        type: Date,
        required: false,
    },
    happiness: {
        type: Number,
        required: true,
    },
    hunger: {
        type: Number,
        required: true,
    },
});

const AdoptionCollection = mongoose.model('adoption', adoptionSchema);

module.exports = { AdoptionCollection };