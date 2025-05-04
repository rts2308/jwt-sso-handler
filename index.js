import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;
const FRESHDESK_DOMAIN = process.env.FRESHDESK_DOMAIN; // e.g. support.medicaldefensesociety.com
const PRIVATE_KEY_PATH = "/etc/secrets/private.key";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const privateKey = fs.readFileSync(path.join(__dirname, PRIVATE_KEY_PATH), "utf8");

app.get("/freshdesk-login", (req, res) => {
  const { email, name } = req.query;

  if (!email) return res.status(400).send("Missing email");

  const payload = {
    email,
    name: name || "",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  };

  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  const redirectURL = `https://${FRESHDESK_DOMAIN}/login/sso?token=${token}`;

  console.log("✅ Token created for:", email);
  console.log("🔁 Redirecting to:", redirectURL);

  res.redirect(redirectURL);
});

app.listen(PORT, () => {
  console.log(`✅ SSO service running at http://localhost:${PORT}`);
});
