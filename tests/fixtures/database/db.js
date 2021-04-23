const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Task_Model = require('../../../src/models/task');
const user_model = require('../../../src/models/user');

const id = mongoose.Types.ObjectId();
const userObj = {
  _id: id,
  name: 'kader',
  email: 'kader93kadrei@gmail.com',
  password: 'kader9393',
  tokens: [
    {
      token: jwt.sign({ id: id }, process.env.JWT_SECRET),
    },
  ],
};

userObj2_id = mongoose.Types.ObjectId();
const userObj2 = {
  _id: userObj2_id,
  name: 'abdo',
  email: 'abdokadrei@gmail.com',
  password: 'kader9393',
  tokens: [
    {
      token: jwt.sign({ id: userObj2_id }, process.env.JWT_SECRET),
    },
  ],
};

const task_1 = {
  _id: mongoose.Types.ObjectId(),
  description: 'task 1',
  compoleted: true,
  owner: id,
};

const task_2 = {
  _id: mongoose.Types.ObjectId(),
  description: 'task 2',
  compoleted: true,
  owner: id,
};

const task_3 = {
  _id: mongoose.Types.ObjectId(),
  description: 'task 3',
  compoleted: true,
  owner: userObj2._id,
};

const setupDb = async () => {
  await user_model.deleteMany();
  await Task_Model.deleteMany();
  await new user_model(userObj).save();
  await new user_model(userObj2).save();
  await new Task_Model(task_1).save();
  await new Task_Model(task_2).save();
  await new Task_Model(task_3).save();
};

const clean = async () => {
  await new Promise((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
};

module.exports = {
  id,
  userObj,
  setupDb,
  clean,
  task_1,
  userObj2,
};
