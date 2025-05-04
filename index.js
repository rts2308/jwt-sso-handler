import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;
const FRESHDESK_DOMAIN = process.env.FRESHDESK_DOMAIN; // e.g. support.medicaldefensesociety.com
const PRIVATE_KEY_PATH = "/etc/secrets/private.key"; // Render secret path

// Load private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

app.get("/freshdesk-login", (req, res) => {
  const { email, name } = req.query;

  if (!email) return res.status(400).send("❌ Missing email query parameter");

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const payload = {
    email,
    name: name || "",
    iat,
    exp,
  };

  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

  const redirectURL = `https://${FRESHDESK_DOMAIN}/login/sso?token=${token}`;

  // Diagnostic output instead of immediate redirect
  res.send(`
    <h1>🔐 Diagnostic JWT SSO</h1>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Name:</strong> ${name || "(none)"}</p>
    <p><strong>iat:</strong> ${iat} (${new Date(iat * 1000).toUTCString()})</p>
    <p><strong>exp:</strong> ${exp} (${new Date(exp * 1000).toUTCString()})</p>
    <p><strong>JWT Token:</strong><br><code style="word-break:break-all;">${token}</code></p>
    <p><strong>Redirect URL:</strong><br><a href="${redirectURL}">${redirectURL}</a></p>
    <hr>
    <p>👆 Click the link above to test login manually.</p>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ SSO service running at http://localhost:${PORT}`);
});
