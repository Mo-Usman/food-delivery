const express = require('express')
const Food = require('../models/food-model')
const auth = require('../middleware/auth')
const User = require('../models/user-model')

const router = new express.Router()

// Router for inserting food
router.post('/food', async (req, res) => {
    const food = new Food(req.body)

    try {
        await food.save()
        res.send(food)
    } catch (e) {
        res.send(400)
    }
})

// Route handler for getting all the food items
router.get('/food/read', auth, async (req, res) => {


    try {
        const user = await User.findById(req.user._id)

        await user.populate('orders.order')

        res.send(user.orders)
    } catch (e) {
        res.send(400)
    }
})


module.exports = router