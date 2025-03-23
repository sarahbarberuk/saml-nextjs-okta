const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const session = require("express-session");
require("dotenv").config({ path: ".env.local" });

// Debugging: Check if OKTA_CERT is loaded
console.log(
  "Loaded OKTA_CERT:",
  process.env.OKTA_CERT ? "✅ Exists" : "❌ Missing"
);

// Print first few characters to verify
if (process.env.OKTA_CERT) {
  console.log(
    "OKTA_CERT Preview:",
    process.env.OKTA_CERT.substring(0, 50) + "..."
  );
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new SamlStrategy(
    {
      entryPoint: process.env.OKTA_ENTRY_POINT,
      issuer: process.env.OKTA_ISSUER,
      callbackUrl: process.env.SAML_CALLBACK_URL,
      cert: process.env.OKTA_CERT?.replace(/\\n/g, "\n"),
    },
    (profile, done) => {
      console.log("✅ SAML login successful:", profile);
      return done(null, profile);
    }
  )
);

app.use(
  session({ secret: "supersecret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Add home route to avoid 404 on redirect
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>✅ Logged in as ${req.user.nameID}</h1>
      <p><a href="/profile">View Profile</a></p>
      <p><a href="/logout">Log out</a></p>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <p><a href="/login">Login with SAML</a></p>
    `);
  }
});

app.get("/login", passport.authenticate("saml"));

app.post(
  "/login/callback",
  passport.authenticate("saml", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.user);
});

app.listen(4000, () =>
  console.log("Auth server running on http://localhost:4000")
);
