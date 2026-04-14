const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const register = async ({fullname, email,password}) => {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw {status: 409, message: ("User already exists")};
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({fullname, email, password: hashedPassword});
    await Wallet.create(user.id);
    return user;
    
}
const login = async ({email,password}) => {
    const user = await User.findByEmail(email);
    if(!user){
        throw {status: 404, message: ("User does not exist")};
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        throw {status: 401, message: ("Invalid credentials")};
    }
    const token = jwt.sign(
        {
            id:user.id, email:user.email, role:user.role, fullname:user.fullname
        },
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    )
    return {token, user:{id:user.id, fullname:user.fullname, email:user.email, role:user.role}};

}

module.exports = {
    register,
    login
}
    
