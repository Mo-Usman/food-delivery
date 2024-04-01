const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: (value) => {
                if(!validator.isEmail(value)) {
                    throw new Error('Invalid Email!')
                }
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                if(value.length < 6) {
                    throw new Error('Password must be grater than 6 characters!')
                } else if (value.toLowerCase().includes('password')) {
                    throw new Error("Password must not contain the word 'password'")
                }
            }
        }
    },
    address: {
        type: String,
        required: true,
        default: 'Islamabad'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    orders: [{
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        }
    }]
})

// Function to generate authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewtoken')

    user.tokens = user.tokens.concat({ token: token })
    await user.save()

    return token
}

// Function to return public profile of a user
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// Function to hash password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Function to login users
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('No users found with the matching email!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Wrong Password!')
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User