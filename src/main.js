const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user-router')
const foodRouter = require('./routers/food-router')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(foodRouter)

app.listen(3000, () => {
    console.log('Server is up on port 3000')
})