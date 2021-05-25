
import crypto from 'crypto';
import qrcode from 'qrcode';

export const asyncQrCode = (url?: string): Promise<string> => {
  if (!url) {
    return Promise.reject(new Error(`Can't generate qr code without a url `))
  }
  return new Promise((resolve, reject) => {
    qrcode.toString(url, { type: 'terminal', width: 4 }, (err, url) => {
      if (err) {
        reject(err)
      } else {
        resolve(url)
      }
    })
  })
};

export const hash = (p: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex")
    crypto.scrypt(p, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err)
      } else {
        resolve(salt + ':' + derivedKey.toString('hex'))
      }
    })
  })
};

export const verify = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString('hex'))
    });
  });
};
