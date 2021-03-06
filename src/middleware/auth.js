const User_Model = require('../models/user');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('bson');
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const filter = {
      _id: ObjectID(decoded.id),
      'tokens.token': token,
    };
    const user = await User_Model.findOne(filter);
    if (user) {
      req.token = token;
      req.user = user;
      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    res.status(401).send({ error: 'Not autenticated' });
  }
};

module.exports = auth;
