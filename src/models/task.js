const { Schema } = require('mongoose');
const mongoose = require('../db/mongoose');
const task_schema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Task_Model = mongoose.model('Task', task_schema);

// const task_1 = new Task_Model({
//   description: 'task_2',
// });

// task_1
//   .save()
//   .then(() => {
//     console.log(task_1);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = Task_Model;
