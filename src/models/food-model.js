const mongoose = require('mongoose')
const validator = require('validator')

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                if(value < 0) {
                    throw new Error('Price must be positive!')
                }
            }
        }
    }
})

foodSchema.virtual('orderedFoods', {
    ref: 'User',
    localField: '_id',
    foreignField: 'orders.order'
})

const Food = mongoose.model('Food', foodSchema)

module.exports = Food