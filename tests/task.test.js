const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../src/app');
const Task_model = require('../src/models/task');
const {
  id,
  userObj,
  setupDb,
  clean,
  userObj2,
  task_1,
} = require('./fixtures/database/db');

const task_id = mongoose.Types.ObjectId();
const taskObj = {
  _id: task_id,
  description: 'test task',
};
beforeEach(setupDb);
afterAll(clean);
test('should add new task', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userObj.tokens[0].token}`)
    .send(taskObj)
    .expect(200);
  const task = await Task_model.findById(task_id);
  expect(task).not.toBeNull();
  expect(task).toMatchObject(taskObj);
  expect(task.owner).toEqual(id);
});

test('should get all the tasks of user one ', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userObj.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toBe(2);
});

test('should not delete task', async () => {
  const response = await request(app)
    .delete(`/tasks/${task_1._id}`)
    .set('Authorization', `Bearer ${userObj2.tokens[0].token}`)
    .send()
    .expect(404);
  const task = await Task_model.findById(task_1._id);
  expect(task).not.toBeNull();
});
