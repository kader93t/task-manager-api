const request = require('supertest');
const { app } = require('../src/app');
const user_model = require('../src/models/user');
const { id, userObj, setupDb, clean } = require('./fixtures/database/db');

afterAll(clean);

beforeEach(setupDb);

test('Should signup', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'abdelakder',
      email: 'abaek93@gmail.com',
      password: 'pass!!word',
      age: 27,
    })
    .expect(201);
  const user = await user_model.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: 'abdelakder',
      email: 'abaek93@gmail.com',
      age: 27,
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe('pass!!word');
});

test('should login', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userObj.email,
      password: userObj.password,
    })
    .expect(200);
  const user = await user_model.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userObj.email,
      password: userObj.password,
    })
    .expect(200);
});

test('should get profile', async () => {
  await request(app)
    .get('/users/profile')
    .set('authorization', `Bearer ${userObj.tokens[0].token}`)
    .send()
    .expect(200);
});

test('should NOT get profile', async () => {
  await request(app).get('/users/profile').send().expect(401);
});

test('should delete the user', async () => {
  await request(app)
    .delete('/users/me')
    .set('authorization', `Bearer ${userObj.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await user_model.findById(userObj._id);
  expect(user).toBeNull();
});

test('should not delete the user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('should add pic to user', async () => {
  await request(app)
    .post('/users/me/pic')
    .set('Authorization', `Bearer ${userObj.tokens[0].token}`)
    .attach('pic', 'tests/fixtures/images/img.jpg')
    .expect(200);
  const user = await user_model.findById(id);
  expect(user.pic).toEqual(expect.any(Buffer));
});

test('should update the user', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userObj.tokens[0].token}`)
    .send({
      name: 'boubou',
    })
    .expect(200);
  const user = await user_model.findById(id);
  expect(user).not.toBeNull();
  expect(user.name).toBe('boubou');
});

test('should not update user', async () => {
  const response = request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userObj.tokens[0].token}`)
    .send({
      dob: '12345',
    })
    .expect(400);
  const user = user_model.findById(id);
  expect(user).not.toBeNull();
  expect(user.dob).toBe(undefined);
});
