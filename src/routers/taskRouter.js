const express = require('express');
const { ObjectID } = require('bson');
const Task_Model = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  try {
    const task = await Task_Model.create({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.send(task);
  } catch (err) {
    res.result(400).send();
  }
});

router.get('/tasks', auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy.split(':');
      sort[sortBy[0]] = sortBy[1] === 'desc' ? -1 : 1;
    }
    console.log(sort);
    const user = req.user;
    await user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(user.tasks);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task_Model.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    } else res.send(task);
  } catch (err) {
    res.status(404).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (isAllowed) {
    try {
      const task = await Task_Model.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      if (task) {
        updates.forEach((update) => {
          task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
      } else {
        res.status(404).send();
      }
    } catch (err) {
      console.log(err);
      res.status(400).send();
    }
  } else res.status(404).send({ error: 'Not valid update' });
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    ObjectID(req.params.id);
  } catch (err) {
    res.send(404).send();
  }
  try {
    const task = await Task_Model.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (task) {
      task.remove();
      res.send(task);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
