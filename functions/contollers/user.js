const validator = require('../utils/validator');
const getError = require('../utils/getError');
const User = require('../models/users.model');
const sendEmail = require('../utils/mailer');
const bcrypt = require('bcrypt');
const jwtUtil = require('../utils/jwt');

const HASH_ROUNDS = 15;

const register = async (req, res, next) => {
  try {
    if (
      req.body &&
      req.body.email &&
      req.body.password &&
      req.body.confirmPassword
    ) {
      const { email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        throw getError(400, 'Passwords do not match');
      }
      validator(req.body);
      const targetRecord = await User.findOne({ email });
      if (targetRecord) {
        throw getError(409, 'Email already exists');
      }
      const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);
      if (!passwordHash) {
        throw getError(500, 'Error in password hashing');
      }
      const user = new User({
        email,
        password: passwordHash,
      });

      user
        .save()
        .then((doc) => {
          console.log(doc);
          res.status(201);
          res.json({ message: 'User added', success: true });
        })
        .catch((err) => {
          next(err);
        });
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (req.body && req.body.email && req.body.password) {
      const targetRecord = await User.findOne({
        email,
      });

      if (targetRecord) {
        const token = await jwtUtil.generateJWT('1h', targetRecord);
        if (await bcrypt.compare(password, targetRecord.password)) {
          res.json({
            message: 'Login successful',
            success: true,
            token,
            email,
          });
        } else {
          throw getError(401, 'Invalid credentials');
        }
      } else {
        throw getError(404, 'User not found');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (req.body && req.body.email) {
      const code = Math.floor(100000 + Math.random() * 900000);

      await sendEmail(
        email,
        `CultureNet - Password Reset Code - ${code}`,
        'Enter the code below to reset the password:' + '\n' + code,
      );

      var user = await User.findOneAndUpdate(
        { email },
        { code, codeExpiry: Number(new Date()) },
        {
          new: true,
        },
      );
      if (user) {
        res.json({
          message: 'Email sent',
          success: true,
        });
      } else {
        throw getError(404, 'User not found');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    if (req.body && req.body.code && req.body.email) {
      const { email, code } = req.body;

      const targetRecord = await User.findOne({
        email,
        code,
      });

      if (
        targetRecord &&
        Date.now() - Number(targetRecord.codeExpiry) < 600000
      ) {
        const token = await jwtUtil.generateJWT('10m', targetRecord);
        res.json({
          message: 'Code valid',
          success: true,
          token,
        });
      } else {
        throw getError(401, 'Invalid or expired reset code');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    if (req.body.email && req.body.password && req.body.confirmPassword) {
      let token = req.header('authorization');
      if (!token) {
        throw getError(401, 'User unauthorized');
      }
      token = token.split(' ')[1];
      const isVerified = await jwtUtil.verifyJWT(token);
      if (!isVerified.verify) {
        throw getError(401, 'User unauthorized');
      }
      const { email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        throw getError(400, 'Passwords do not match');
      }
      validator(req.body);
      const targetRecord = await User.findOne({ email });
      if (!targetRecord) {
        throw getError(404, 'User not found');
      }
      const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);
      if (!passwordHash) {
        throw getError(500, 'Error in password hashing');
      }
      var user = await User.findOneAndUpdate(
        { email },
        { password: passwordHash },
        {
          new: true,
        },
      );
      if (user) {
        res.json({
          message: 'User updated',
          success: true,
          user,
        });
      } else {
        throw getError(404, 'User not found');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    if (req.body && req.body.email) {
      let token = req.header('authorization');
      token = token.split(' ')[1];
      const isVerified = await jwtUtil.verifyJWT(token);
      if (!isVerified.verify) {
        throw getError(401, 'User unauthorized');
      }
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        res.json({
          message: 'User found',
          success: true,
          user,
        });
      } else {
        throw getError(404, 'User not found');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    if (req.body) {
      const { email, firstName, lastName, bio, nsfw } = req.body;
      let token = req.header('authorization');
      if (!token) {
        throw getError(401, 'User unauthorized');
      }
      token = token.split(' ')[1];
      const isVerified = await jwtUtil.verifyJWT(token);
      if (!isVerified.verify) {
        throw getError(401, 'User unauthorized');
      }
      var user = await User.findOneAndUpdate(
        { email },
        { firstName, lastName, bio, nsfw },
        {
          new: true,
        },
      );
      if (user) {
        res.json({
          message: 'User updated',
          success: true,
          user,
        });
      } else {
        throw getError(404, 'User not found');
      }
    } else {
      throw getError(400, 'Invalid or missing body paramaters');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header('authorization');
    if (!token) {
      throw getError(401, 'User unauthorized');
    }
    token = token.split(' ')[1];
    const isVerified = await jwtUtil.verifyJWT(token);
    if (isVerified.verify) {
      res.json({
        message: 'Token Verified',
        success: true,
      });
    }
    throw getError(401, 'Token expired or invalid');
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  verifyToken,
  resetPassword,
};
