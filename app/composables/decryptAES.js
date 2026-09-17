import CryptoJS from "crypto-js";

export default (str, secretKey) => {
  return decryptAES(str, secretKey);
};

const decryptAES = (encryptedBase64, secretKey) => {
  secretKey ??= "appconfig168";

  if (isEmpty(encryptedBase64)) return "";

  const keys = getKey(secretKey);
  const decrypted = CryptoJS.AES.decrypt(
    encryptedBase64,
    keys.key,
    keys.options
  );

  if (decrypted) {
    try {
      const str = decrypted.toString(CryptoJS.enc.Utf8);
      if (str.length > 0) {
        return str;
      } else {
        return "";
      }
    } catch (e) {
      return "";
    }
  }
  return "";
};

const getKey = (secretKey) => {
  const _secretKey =
    secretKey.length > 32 ? secretKey.substring(0, 32) : secretKey;
  const key = CryptoJS.enc.Utf8.parse(_secretKey.trim().padEnd(32, "*"));

  return {
    key,
    options: {
      iv: CryptoJS.enc.Utf8.parse("".padEnd(16, "*")),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  };
};
