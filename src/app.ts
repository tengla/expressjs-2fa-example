import express from 'express';
import jwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { body, validationResult } from 'express-validator';
import { asyncQrCode } from './password'
import {
  create as createUser,
  validate as validateUser,
  find as findUser
} from './users';

const jwtOptions = {
  secret: 'UYLN9gS4E31cRTjs9G5tlSeiGjQoH5oFByaQOifAKjQ=',
  algorithms: ['HS256']
};

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  const msg = { msg: 'Open Hello World' };
  res.send(msg);
});

app.post(
  '/authenticate',
  body('username').isEmail(),
  body('password').isLength({ min: 5 }),
  body('code').isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    try {
      const user = await validateUser(
        req.body.username,
        req.body.password,
        req.body.code
      );
      const token = jsonwebtoken.sign({
        username: user.username
      }, jwtOptions.secret, {
        algorithm: 'HS256'
      })
      res.send(token)
    } catch (err) {
      res.status(400).send(err.message)
    }
  }
);

app.post(
  '/verify-code',
  body('username').isEmail(),
  body('code').isNumeric(),
  (req, res) => {
    const user = findUser(req.body.username);
    if (!user) {
      return res.status(401).send({
        statusCode: 401,
        error: 'Unauthorized'
      })
    }
    var tokenValidates = speakeasy.totp.verify({
      secret: user.twofa_tmp_secret,
      encoding: 'base32',
      token: req.body.code
    });
    res.send({ tokenValidates });
  }
);

app.get('/hello',
  jwt(jwtOptions),
  (req, res) => {
    const user = findUser((req.user as app.User).username)
    if (!user) {
      return res.status(401).send({
        statusCode: 401,
        error: 'Unauthorized'
      })
    }
    const msg = {
      msg: `Hello ${user?.username}`
    };
    res.send(msg)
  }
);

app.post(
  '/create-user',
  body('username').isEmail().matches(/@capraconsulting.no$/),
  body('password').isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const secret = await createUser(req.body);
      console.log(secret);
      const qc = await asyncQrCode(secret.otpauth_url);
      res.status(200).send(qc)
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
