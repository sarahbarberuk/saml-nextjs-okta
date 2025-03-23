"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to the Next.js SAML App</h1>

      {user ? (
        <>
          <p>
            🎉 You are logged in as <strong>{user.nameID}</strong>
          </p>
          <a href="http://localhost:4000/logout">Logout</a>
        </>
      ) : (
        <>
          <p>You're not logged in.</p>
          <a
            href="http://localhost:4000/login"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Login with SAML
          </a>
        </>
      )}
    </main>
  );
}
