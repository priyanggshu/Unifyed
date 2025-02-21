import crypto from "crypto";

const algorithm = "aes-256-cbc";

const secretKey = process.env.ENCRYPTION_KEY;
const key = crypto.scryptSync(secretKey, "hex"); // makes sure that the key is exactly 32 bytes


export const encryptMessage = (message) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { encryptedData: encrypted, iv: iv.toString("hex") };
};

export const decryptMessage = (encryptedData, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
};