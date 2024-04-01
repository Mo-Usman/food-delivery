const express = require('express')
const User = require('../models/user-model')
const auth = require('../middleware/auth')
const Food = require('../models/food-model')


const router = new express.Router()


// Route handler to sign up a user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.send(400)
    }
})

// Route handler to sign in users
router.post('/users/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Route handler for logging out of a single session
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

// Route handler for logging out of all sessions
router.post('/users/logoutALL', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

// Route handler for deleting a user using uid
router.delete('/users/me', auth, async (req, res) => {
    const id = req.user._id

    try {
        await User.findByIdAndDelete(id)
        res.send(req.user)
    } catch (e) {
        res.send(500)
    }
})

// Route handler for getting the user profile
router.get('/users/me', auth, async (req, res) => {
    return res.send(req.user)
})

// Route handler for updating a user
router.patch('/users/me', auth, async (req, res) => {
    const id = req.params.id
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'email', 'password', 'address', 'orders']
    const isValid = updates.every((item) => validUpdates.includes(item))

    if (!isValid) {
        res.status(400).send({ error: 'Invalid Updates!' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.sendStatus(400)
    }

})

// Route handler for ordering food
router.post('/food/order/:id', auth, async (req, res) => {

    const user = req.user
    const order = req.params.id

    try {

        user.orders = user.orders.concat({ order: order })

        await user.save()
        res.sendStatus(201).send(user)
    } catch (e) {
        res.sendStatus(400).send(e)
    }
})

module.exports = router