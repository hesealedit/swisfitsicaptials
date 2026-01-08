const mongoose = require('mongoose');
const validator = require('validator');
// const bcrypt = require('bcrypt'); // Not needed for plain text comparison

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'First name is required']
    },
    midname: {
        type: String,
    },
    lastname: {
        type: String,
        required: [true, 'Last name is required']
    },
    tel: {
        type: String,
        required: [true, 'Phone number is required']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'Please enter an email'],
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    limit: {
        type: String,
        default: "500,000,00"
    },
    country: {
        type: String,
        required: [true, 'Country is required']
    },
    ref_no: {
        type: String,
        default: "1234567890"
    },
    postal: {
        type: String,
        required: [true, 'Postal code is required'],
        default: "postal code"
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        default: "your address"
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        default: "your state"
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: "$"
    },
    Dob: {
        type: String,
        required: [true, 'Date of birth is required']
    },
    city: {
        type: String,
        default: "your city"
    },
    account: {
        type: String,
        required: [true, 'Account type is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    image: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0
    },
    total_deposit: {
        type: String,
        default: "0.00"
    },
    gender: {
        type: String,
        required: [true, 'Gender is required']
    },
    bank_name: {
        type: String,
        default: "your bank name"
    },
    account_name: {
        type: String,
        default: "your account name"
    },
    fees: {
        type: String,
        default: "0.00"
    },
    account_no: {
        type: String,
        default: "your account number"
    },
    sortcode: {
        type: String,
        default: "388130"
    },
    deacc_no: {
        type: Number,
        default: "99388383"
    },
    deacc_bank: {
        type: String,
        default: "Mining Bank"
    },
    deacc_swift: {
        type: String,
        default: "3222ASD"
    },
    deacc_name: {
        type: String,
        default: "Miller lauren"
    },
    pending: {
        type: String,
        default: "0.00"
    },
    de_wallet: {
        type: String,
        default: "bc1qkspwvk9ge7rfl7374t96s95es64vc4fysk2nu5"
    },
    pin: {
        type: String,
        required: [true, 'PIN is required']
    },
    cardBal: {
        type: String,
        default: "0.00"
    },
    cardNumb: {
        type: String,
        default: "xxxxxxxxxxxx"
    },
    card_cvv: {
        type: String,
        default: "xxxx"
    },
    card_exp: {
        type: String,
        default: "xxxxxxxxxxxxxx"
    },
    card_status: {
        type: String,
        default: "Not Active"
    },
    card_type: {
        type: String,
        default: "xxxxxxxxxxxx"
    },
    Depositdetails: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'details'
    },
    transfers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'transferMoney'
    },
    cards: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'card'
    },
    loans: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'loan'
    },
    tickets: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'ticket'
    },
    deposits: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'deposit'
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    otpSuspended: {
        type: Boolean,
        default: false
    },
    role: {
        type: Number,
        default: 0
    },
    approved: {
        type: Boolean,
        default: false
    },
    withApprove: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email: email.toLowerCase() });
    if (user) {
        // Plain text password comparison (no bcrypt)
        if (password === user.password) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;