const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User_model = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcom, sendCnacelation } = require('../emails/account');
const router = new express.Router();
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
      return cb(new Error('File extension non suported'));
    }
    cb(undefined, true);
  },
});

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User_model.findByCredential(email, password);
    if (user) {
      const token = await user.generateToken();
      res.send({ user, token });
    } else {
      res.status(404).send({ error: 'Unable to login' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  console.log('lll');
  try {
    const user = req.user;
    user.tokens = user.tokens.filter(({ token }) => {
      return req.token != token;
    });
    await user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});
router.post('/users', async (req, res) => {
  try {
    const user = await User_model.create(req.body);
    await user.save();
    const token = await user.generateToken();
    sendWelcom(user.email, user.name);
    res.send({ user, token });
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
});

router.get('/users/profile', auth, async (req, res) => {
  res.send(req.user);
});

// router.get('/users/:id', auth, async (req, res) => {
//   let id = '';
//   try {
//     id = ObjectID(req.params.id);
//   } catch (err) {
//     return res.status(404).send(err);
//   }
//   try {
//     const user = await User_model.findById(id);
//     if (!user) {
//       res.status(404).send();
//     } else res.send(user);
//   } catch (err) {
//     res.status(404).send();
//   }
// });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'age', 'email', 'password'];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (isAllowed) {
    try {
      const user = await User_model.findById(req.user._id);
      if (user) {
        updates.forEach((update) => {
          user[update] = req.body[update];
        });
        await user.save();
        res.send(user);
      } else res.status(404).send();
    } catch (err) {
      res.send(400).send();
    }
  } else {
    res.status(404).send({ error: 'Not valid updates' });
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCnacelation(req.user.email, req.user.name);
    res.send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post(
  '/users/me/pic',
  auth,
  upload.single('pic'),
  async (req, res) => {
    req.user.pic = sharp(req.file.buffer).png().toBuffer();
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);
router.delete('/users/me/pic', auth, async (req, res) => {
  req.user.pic = undefined;
  await req.user.save();
  res.status(200).send();
});

router.get('/users/:id/pic', async (req, res) => {
  let id = '';
  try {
    id = ObjectID(req.params.id);
  } catch (err) {
    return res.status(404).send(err);
  }
  const user = await User_model.findById(id);
  if (!user || !user.pic) {
    return res.status(404).send();
  }
  res.set('Content-Type', 'image/jpg');
  res.send(user.pic);
});
module.exports = router;
