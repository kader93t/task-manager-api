const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('../db/mongoose');
const Task_Model = require('./task');

const user_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    age: {
      type: Number,
      validate(age) {
        if (age < 18) throw new Error('the min age is 18');
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate() {
        if (!validator.default.isEmail)
          throw new Error('you should enter a valid email !');
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      trim: true,
      validate(pass) {
        if (pass.includes('password'))
          throw new Error('This is a very weak password');
      },
    },
    pic: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

user_schema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

user_schema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

user_schema.pre('remove', async function (next) {
  await Task_Model.deleteMany({
    owner: this._id,
  });
  next();
});

user_schema.statics.findByCredential = async (email, pass) => {
  try {
    const user = await User_model.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(pass, user.password);
      if (isValid) return user;
      else return false;
    } else return false;
  } catch (err) {
    console.log('hakahakha');
    throw err;
  }
};

user_schema.methods.generateToken = async function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

user_schema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.pic;
  return userObject;
};

const User_model = mongoose.model('User', user_schema);

module.exports = User_model;
