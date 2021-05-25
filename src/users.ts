import { hash, verify } from './password';
import speakeasy, { GeneratedSecret } from 'speakeasy';
import fs from 'fs';
import os from 'os';
import path from 'path';

let users: app.User[] = [];
const tmpfile = path.join(os.tmpdir(), "users.json")

const save = (users: app.User[]) => {
  const json = JSON.stringify(users);
  fs.writeFileSync(tmpfile, json)
};

(() => {
  try {
    const json = fs.readFileSync(tmpfile)
    users = JSON.parse(json.toString());
    console.log("loaded users");
  } catch (err) {
    console.error(err.message)
  }
})();

export const create = async (user: app.User): Promise<GeneratedSecret> => {
  if (find(user.username)) {
    return Promise.reject(
      new Error('user already exists.'))
  }
  user.password = await hash(user.password)
  const secret = speakeasy.generateSecret();
  user.twofa_tmp_secret = secret.base32;
  user.twofa_enabled = true;
  users.push(user)
  save(users);
  secret.otpauth_url = secret.otpauth_url?.replace(/SecretKey/, "Capra Auth")
  return Promise.resolve(secret);
}

/**
 * find user by username
 * @param username
 * @returns user
 */
export const find = (username: string): app.User | undefined => {
  return users.find(u => u.username === username)
}

/**
 * validate by username and password
 * @param username
 * @param password
 * @returns User promise
 */
export const validate = async (
  username: string,
  password: string,
  code: string
): Promise<app.User> => {
  const user = find(username);
  if (!user) {
    return Promise.reject(
      new Error(`User: ${username} not found`))
  }
  const verified = await verify(password, user.password)
  if (!verified) {
    return Promise.reject(
      new Error(`User '${username}' can't be validated.`));
  }
  var tokenValidates = speakeasy.totp.verify({
    secret: user.twofa_tmp_secret,
    encoding: 'base32',
    token: code
  });
  console.log(
    `${tokenValidates}, ${user.twofa_tmp_secret}, ${code}`)
  if (!tokenValidates) {
    return Promise.reject(
      new Error(`Code '${code}' can't be validated.`));
  }
  return Promise.resolve(user);
}