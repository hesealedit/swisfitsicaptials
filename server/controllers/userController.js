const User = require('../Model/User');
const Deposit = require('../Model/depositSchema');
const Depositdetails = require("../Model/depositDetails");
const Signal = require("../Model/loan");
const Verify = require("../Model/support");
const transferMoney = require("../Model/Transfer");
const Loan = require("../Model/loan");
const Ticket = require("../Model/support");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");


// Handle errors

// const handleErrors = (err) => {
//     console.log(err.message, err.code);
//     let errors = { email: '', password: '', firstname: '', lastname: '', tel: '', gender: '', Dob: '', address: '', postal: '', state: '', country: '', currency: '', account: '', pin: '' };
//     if (err.code === 11000) {
//         errors.email = 'That email is already registered';
//         return errors;
//     }
//     if (err.message.includes('user validation failed')) {
//         Object.values(err.errors).forEach(({ properties }) => {
//             errors[properties.path] = properties.message;
//         });
//     }
//     // Handle custom errors like approval
//     if (err.message === 'Your account is still ongoing an approval process try again later') {
//         errors.email = err.message;
//         return errors;
//     }
//     // For other login errors
//     if (err.message.includes('incorrect')) {
//         if (err.message.includes('email')) {
//             errors.email = 'Incorrect email';
//         } else if (err.message.includes('password')) {
//             errors.password = 'Incorrect password';
//         }
//         return errors;
//     }
//     return errors;
// };

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', firstname: '', lastname: '', tel: '', gender: '', Dob: '', address: '', postal: '', state: '', country: '', currency: '', account: '', pin: '' };
    if (err.code === 11000) {
        errors.email = 'That email is already registered';
        return errors;
    }
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    // Handle custom errors like approval
    if (err.message === 'Your account is still pending approval. Please try again later.') {
        errors.email = err.message;
        return errors;
    }
    // For other login errors
    if (err.message.includes('incorrect')) {
        if (err.message.includes('email')) {
            errors.email = 'Incorrect email';
        } else if (err.message.includes('password')) {
            errors.password = 'Incorrect password';
        }
        return errors;
    }
    return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'piuscandothis', { expiresIn: maxAge });
};


// OTP generation function
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// OTP sending function
// const sendOTP = async (user) => {
//     const otp = generateOTP();
//     const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
//     user.otp = otp;
//     user.otpExpires = expires;
//     await user.save();
//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 465,
//             auth: {
//                 user: 'swsiftfinance@gmail.com',
//                 pass: 'hhavuswygrtquxeq'
//             }
//         });
//         await transporter.sendMail({
//             from: 'admin@swsiftfinance.com',
//             to: user.email,
//             subject: 'Transfer Verification OTP',
//             html: `<p>Your OTP for transfer verification is: <strong>${otp}</strong><br>This OTP is valid for 10 minutes.</p>`
//         });
//         return true;
//     } catch (error) {
//         console.log(error);
//         return false;
//     }
// };

// Unchanged routes (homePage, aboutPage, etc.)
module.exports.homePage = (req, res) => { res.render("index"); };
module.exports.aboutPage = (req, res) => { res.render("about"); };
module.exports.contactPage = (req, res) => { res.render("contact"); };
module.exports.securityPage = (req, res) => { res.render("converter"); };
module.exports.licensesPage = (req, res) => { res.render("chart"); };
module.exports.alertsPage = (req, res) => { res.render("alerts"); };
module.exports.faqPage = (req, res) => { res.render("faq"); };
module.exports.privacyPage = (req, res) => { res.render("privacy-policy"); };
module.exports.termsPage = (req, res) => { res.render("terms-of-service"); };
module.exports.policyPage = (req, res) => { res.render("policy"); };
module.exports.termPage = (req, res) => { res.render("term"); };
module.exports.loginAdmin = (req, res) => { res.render('loginAdmin'); };
module.exports.registerPage = (req, res) => { res.render("register"); };
module.exports.loginPage = (req, res) => { res.render("login"); };


// Register and login routes (unchanged)

module.exports.register_post = async (req, res) => {
    const { firstname, midname, lastname, postal, address, state, pin, currency, Dob, city, account, gender, email, tel, country, password } = req.body;
    const account_no = Math.floor(10000000000 + Math.random() * 900000).toString();
    
    // Manual validation for required fields
    const errors = {};
    if (!firstname || firstname.trim() === '') errors.firstname = 'First name is required';
    if (!lastname || lastname.trim() === '') errors.lastname = 'Last name is required';
    if (!email || email.trim() === '') errors.email = 'Email is required';
    if (!tel || tel.trim() === '') errors.tel = 'Phone number is required';
    if (!gender || gender.trim() === '') errors.gender = 'Gender is required';
    if (!Dob || Dob.trim() === '') errors.Dob = 'Date of birth is required';
    if (!address || address.trim() === '') errors.address = 'Address is required';
    if (!postal || postal.trim() === '') errors.postal = 'Postal code is required';
    if (!state || state.trim() === '') errors.state = 'State is required';
    if (!country || country.trim() === '') errors.country = 'Country is required';
    if (!currency || currency.trim() === '') errors.currency = 'Currency is required';
    if (!account || account.trim() === '') errors.account = 'Account type is required';
    if (!password || password.trim() === '') errors.password = 'Password is required';
    if (!pin || pin.trim() === '' || pin.length !== 4 || !/^\d{4}$/.test(pin)) errors.pin = 'PIN must be a 4-digit number';
    
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors, success: false });
    }
    
    try {
        const user = await User.create({ 
            firstname: firstname.trim(), 
            midname: midname ? midname.trim() : '', 
            lastname: lastname.trim(), 
            postal: postal.trim(), 
            address: address.trim(), 
            pin: pin.trim(), 
            state: state.trim(), 
            currency: currency.trim(), 
            Dob: Dob, 
            city: city ? city.trim() : 'your city', 
            account: account.trim(), 
            gender: gender.trim(), 
            email: email.trim().toLowerCase(), 
            tel: tel.trim(), 
            country: country.trim(), 
            password, 
            account_no,
            approved: false,
            withApprove: false
        });
        req.flash('infoSubmit', 'Account created successfully. Please wait for approval.');
        res.status(201).json({ success: true, redirect: '/login' });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors, success: false });
    }
};

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        if (!user.approved) {
            req.flash('infoErrors', 'Your account is still pending approval. Please try again later.');
            throw new Error('Your account is still pending approval. Please try again later.');
        }
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        req.flash('infoSubmit', 'Login successful. Welcome back!');
        res.status(200).json({ user: user._id, success: true, redirect: '/dashboard', message: 'Login successful. Welcome back!' });
    } catch (err) {
        const errors = handleErrors(err);
        req.flash('infoErrors', errors.email || errors.password || 'An error occurred during login.');
        res.status(400).json({ errors, success: false, message: errors.email || errors.password || 'An error occurred during login.' });
    }
};

// Updated localtransferPage_post
// Updated localtransferPage_post
module.exports.localtransferPage_post = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        // Check withApprove
        if (!user.withApprove) {
            req.flash('infoErrors', "There's still an ongoing process. You can't withdraw or transfer right now. Try again later.");
            return res.redirect('/localtransfer');
        }

        // Check balance
        if (user.balance === 0) {
            req.flash('infoErrors', 'Insufficient funds, kindly fund your account');
            return res.redirect('/localtransfer');
        }

        // Validate sufficient balance
        const transferAmount = parseFloat(req.body.amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            req.flash('infoErrors', 'Invalid transfer amount.');
            return res.redirect('/localtransfer');
        }

        if (user.balance < transferAmount) {
            req.flash('infoErrors', 'Insufficient balance for this transfer.');
            return res.redirect('/localtransfer');
        }

        // Store transfer data in session
        req.session.transferData = req.body;
        req.session.transferType = 'local';

        // Check if OTP is suspended
        if (user.otpSuspended) {
            req.flash('infoErrors', 'OTP verification is suspended. Please contact admin for CTO code.');
        } else {
            // Generate and send OTP
            const otpSent = await sendOTP(user);
            if (!otpSent) {
                req.flash('infoErrors', 'Failed to send OTP. Please try again.');
                return res.redirect('/localtransfer');
            }
            req.flash('infoSubmit', 'OTP sent to your email. Please verify to complete the transfer.');
        }

        // Render OTP verification page
        return res.render('otp-verification', {
            user,
            transferType: 'local',
            infoErrorsObj: req.flash('infoErrors'),
            infoSubmitObj: req.flash('infoSubmit'),
        });
    } catch (error) {
        req.flash('infoErrors', error.message || 'An error occurred during the transfer process.');
        res.redirect('/localtransfer');
    }
};

// Unchanged internationaltransferPage
module.exports.internationaltransferPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("internationaltransfer", { infoErrorsObj, infoSubmitObj });
};

// Updated internationaltransferPage_post
// Updated internationaltransferPage_post
module.exports.internationaltransferPage_post = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        // Check withApprove
        if (!user.withApprove) {
            req.flash('infoErrors', "There's still an ongoing process. You can't withdraw or transfer right now. Try again later.");
            return res.redirect('/internationaltransfer');
        }

        // Check balance
        if (user.balance === 0) {
            req.flash('infoErrors', 'Insufficient funds, kindly fund your account');
            return res.redirect('/internationaltransfer');
        }

        // Validate sufficient balance
        const transferAmount = parseFloat(req.body.amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            req.flash('infoErrors', 'Invalid transfer amount.');
            return res.redirect('/internationaltransfer');
        }

        if (user.balance < transferAmount) {
            req.flash('infoErrors', 'Insufficient balance for this transfer.');
            return res.redirect('/internationaltransfer');
        }

        // Store transfer data in session
        req.session.transferData = req.body;
        req.session.transferType = 'international';

        // Check if OTP is suspended
        if (user.otpSuspended) {
            req.flash('infoErrors', 'OTP verification is suspended. Please contact admin for CTO code.');
        } else {
            // Generate and send OTP
            const otpSent = await sendOTP(user);
            if (!otpSent) {
                req.flash('infoErrors', 'Failed to send OTP. Please try again.');
                return res.redirect('/internationaltransfer');
            }
            req.flash('infoSubmit', 'OTP sent to your email. Please verify to complete the transfer.');
        }

        // Render OTP verification page
        return res.render('otp-verification', {
            user,
            transferType: 'international',
            infoErrorsObj: req.flash('infoErrors'),
            infoSubmitObj: req.flash('infoSubmit'),
        });
    } catch (error) {
        req.flash('infoErrors', error.message || 'An error occurred during the transfer process.');
        res.redirect('/internationaltransfer');
    }
};

// Updated verifyOTP
module.exports.verifyOTP = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp } = req.body;
        const user = await User.findById(id);
        const transferData = req.session.transferData;
        const transferType = req.session.transferType;

        if (!transferData || !transferType) {
            req.flash("infoErrors", "Transfer session expired. Please try again.");
            return res.redirect(`/${transferType}transfer`);
        }

        // If OTP is suspended and no OTP exists, show message and stay on OTP page
        if (user.otpSuspended && (!user.otp || !user.otpExpires)) {
            req.flash("infoErrors", "OTP verification is suspended. Please contact admin for CTO code.");
            return res.render("otp-verification", { user, transferType });
        }

        // Check if OTP exists and is not expired
        if (!user.otp || !user.otpExpires) {
            req.flash("infoErrors", "No OTP found. Please request a new one.");
            return res.render("otp-verification", { user, transferType });
        }

        if (new Date() > user.otpExpires) {
            req.flash("infoErrors", "OTP has expired. Please request a new one.");
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.render("otp-verification", { user, transferType });
        }

        // Validate OTP
        if (user.otp !== otp) {
            req.flash("infoErrors", "Invalid OTP. Please try again.");
            return res.render("otp-verification", { user, transferType });
        }

        // Validate sufficient balance
        const transferAmount = parseFloat(transferData.amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            req.flash("infoErrors", "Invalid transfer amount.");
            return res.redirect(`/${transferType}transfer`);
        }

        if (user.balance < transferAmount) {
            req.flash("infoErrors", "Insufficient balance for this transfer.");
            return res.redirect(`/${transferType}transfer`);
        }

        // OTP is valid, process the transfer
        const transMonie = new transferMoney({
            Bank: transferData.Bank,
            amount: transferAmount,
            Bamount: user.balance.toFixed(2),
            Afamount: (user.balance - transferAmount).toFixed(2),
            bank_iban: transferData.bank_iban,
            bank_Address: transferData.bank_Address,
            accNo: transferData.accNo,
            accName: transferData.accName,
            type: transferData.type,
            pin: transferData.pin,
            swiftCode: transferData.swiftCode,
            country: transferData.country,
            note: transferData.note,
            status: transferData.status,
            owner: user._id,
        });

        await transMonie.save();
        user.transfers.push(transMonie);
        user.balance -= transferAmount;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        req.session.transferData = null;
        req.session.transferType = null;

        req.flash("infoSubmit", "Wire transfer successful waiting for approval.");
        res.render("transfer-History", { user });
    } catch (error) {
        req.flash("infoErrors", error.message);
        res.redirect(`/${req.session.transferType}transfer`);
    }
};

// Unchanged routes (dashboardPage, bitPayPage, etc.)
module.exports.dashboardPage = async (req, res) => {
    res.render('dashboard');
};

module.exports.LoadBalancePage = async (req, res) => {
   try {
    const userId = req.query.userId;
    const user = await User.findById(userId).select('balance currency');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ balance: user.balance, currency: user.currency });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.bitPayPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('bi-payment', { infoErrorsObj, infoSubmitObj });
};

module.exports.baPayPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('ba-payment', { infoErrorsObj, infoSubmitObj });
};

module.exports.paymentPage_post = async (req, res) => {
    let theImage;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('no files to upload');
    } else {
        theImage = req.files.image;
        newImageName = theImage.name;
        uploadPath = require('path').resolve('./') + '/public/IMG_UPLOADS/' + newImageName;
        theImage.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        const deposit = new Depositdetails({
            type: req.body.type,
            amount: req.body.amount,
            status: req.body.status,
            image: newImageName
        });
        await deposit.save();
        const id = req.params.id;
        const user = await User.findById(id);
        user.deposits.push(deposit);
        await user.save();
        req.flash('infoSubmit', 'deposit successful awaiting approval');
        res.render("accounthistory", { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.depositPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("deposits", { infoErrorsObj, infoSubmitObj });
};

module.exports.accounHistoryPage = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).populate("deposits");
        res.render('accounthistory', { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.transferHistoryPage = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).populate("transfers");
        res.render('transfer-History', { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.localtransferPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('localtransfer', { infoErrorsObj, infoSubmitObj });
};

module.exports.buyPlanPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('buy-plan', { infoErrorsObj, infoSubmitObj });
};

module.exports.buyPlanPage_post = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            req.flash('infoSubmit', 'User not found!');
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.balance === 0) {
            req.flash('infoSubmit', 'Insufficient balance!');
            res.redirect('/buy-plan');
        } else {
            const signal = await Signal.create({
                plan: req.body.plan,
                Plan_Price: req.body.Plan_Price,
                Profit: req.body.Profit,
                Duration: req.body.Duration,
                Bonus: req.body.Bonus,
                status: req.body.status,
            });
            user.Signal.push(signal);
            await user.save();
            req.flash('infoSubmit', 'Your Plan is under review.');
            res.render("myplans", { user });
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports.myPlanPage = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).populate("Signal");
    try {
        res.render("myplans", { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.kycPage = async (req, res) => {
    res.render("kyc-form");
};

module.exports.verifyPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("verify-account", { infoErrorsObj, infoSubmitObj });
};

module.exports.verifyPage_post = async (req, res) => {
    let theImage;
    let uploadPath;
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('no files to upload');
    } else {
        theImage = req.files.image;
        newImageName = theImage.name;
        uploadPath = require('path').resolve('./') + '/public/IMG_UPLOADS/' + newImageName;
        theImage.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        const verification = await Verify.create({
            fullname: req.body.fullname,
            tel: req.body.tel,
            email: req.body.email,
            state: req.body.state,
            city: req.body.city,
            dateofBirth: req.body.dateofBirth,
            address: req.body.address,
            image: newImageName
        });
        await verification.save();
        const id = req.params.id;
        const user = await User.findById(id);
        user.verified.push(verification);
        await user.save();
        req.flash('infoSubmit', 'verification successful awaiting approval');
        res.redirect("/verify-account");
    } catch (error) {
        console.log(error);
    }
};

module.exports.supportPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("support", { infoErrorsObj, infoSubmitObj });
};

module.exports.supportPage_post = async (req, res) => {
    try {
        const withTicket = new Ticket({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,
            reply: req.body.reply,
            status: req.body.status,
        });
        await withTicket.save();
        const id = req.params.id;
        const user = await User.findById(id);
        user.tickets.push(withTicket);
        await user.save();
        req.flash('infoSubmit', 'Ticket submitted under review.');
        res.redirect('/support');
    } catch (error) {
        req.flash('infoErrors', error);
    }
};

module.exports.accountPage = async (req, res) => {
    res.render('account-settings');
};

module.exports.accountPage_post = async (req, res) => {
    let theImage;
    let uploadPath;
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('no files to upload');
    } else {
        theImage = req.files.image;
        newImageName = theImage.name;
        uploadPath = require('path').resolve('./') + '/public/IMG_UPLOADS/' + newImageName;
        theImage.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        await User.findByIdAndUpdate(req.params.id, {
            image: newImageName,
            updatedAt: Date.now()
        });
        req.flash('infoSubmit', 'profile updated successfully');
        await res.redirect("/dashboard");
        console.log("redirected");
    } catch (error) {
        req.flash('infoErrors', error);
    }
};

module.exports.depositPage_post = async (req, res) => {
    let theImage;
    let uploadPath;
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('no files to upload');
    } else {
        theImage = req.files.image;
        newImageName = theImage.name;
        uploadPath = require('path').resolve('./') + '/public/IMG_UPLOADS/' + newImageName;
        theImage.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        const deposit = new Deposit({
            type: req.body.type,
            amount: req.body.amount,
            status: req.body.status,
            image: newImageName
        });
        await deposit.save();
        const id = req.params.id;
        const user = await User.findById(id);
        user.deposits.push(deposit);
        await user.save();
        req.flash('infoSubmit', 'deposit successful undergoing approval');
        await res.render("accounthistory", { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.cardPage = async (req, res) => {
    res.render("card");
};

module.exports.loanPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("loan", { infoErrorsObj, infoSubmitObj });
};

module.exports.loanPage_post = async (req, res) => {
    try {
        const loaned = new Loan({
            loan_category: req.body.loan_category,
            loan_amount: req.body.loan_amount,
            loan_interest_percentage: req.body.loan_interest_percentage,
            loan_interest_amount: req.body.loan_interest_amount,
            loan_duration: req.body.loan_duration,
            status: req.body.status,
            loan_reason: req.body.loan_reason,
            loan_income: req.body.loan_income,
            payStatus: req.body.payStatus
        });
        await loaned.save();
        const { id } = req.params;
        const user = await User.findById(id);
        user.loans.push(loaned);
        await user.save();
        req.flash('infoSubmit', 'Loan under review waiting for approval.');
        res.render("viewloan", { user });
    } catch (error) {
        console.log(error);
    }
};

module.exports.viewloanPage = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).populate("loans");
    res.render("viewloan", { user });
};

module.exports.widthdrawPage = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("withdraw-funds", { infoErrorsObj, infoSubmitObj });
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};