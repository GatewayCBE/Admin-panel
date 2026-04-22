import "bootstrap/dist/css/bootstrap.min.css";

const FooterInfo = () => {
  return (
    <footer
      className="text-white"
      style={{
        background: "linear-gradient(135deg,#0f8a43,#0b6d35)",
        padding: "16px 0 16px",
      }}
    >
      <div className="container-fluid px-4 px-lg-5">

        {/* MAIN FOOTER — 3 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 0.9fr",
            gap: "0 40px",
            alignItems: "start",
          }}
        >

          {/* COL 1 — ABOUT + QUICK LINKS */}
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
              BookYourTurf
            </h2>

            <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "18px", opacity: 0.92 }}>
              BookYourTurf is a complete digital platform designed to simplify turf management
              and player booking with real-time availability, seamless payments and automation.
            </p>

            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.4px" }}>
              Quick Links
            </h3>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13.5px" }}>
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Admin Panel", href: "/dashboard" },
                { label: "Login", href: "/auth" },
              ].map(({ label, href }) => (
                <li key={label} style={{ lineHeight: "1.9" }}>
                  <a href={href} style={{ color: "#fff", textDecoration: "none", opacity: 0.88 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 2 — CONTACT */}
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "14px" }}>
              Contact
            </h2>

            {/* two sub-columns inside Contact */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>

              {/* Emails */}
              <div>
                <h5 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email
                </h5>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", lineHeight: "1.85" }}>
                  <li>nottaminfotech@gmail.com</li>
                  <li>bookyourturfindia@gmail.com</li>
                  <li>bookyourturfmdu@gmail.com</li>
                </ul>
              </div>

              {/* Phone + email pairs */}
              <div style={{ fontSize: "14px" }}>
                {[
                  { label: "Customer Care", phone: "+91 9940663099", email: "contact@bookyourturf.net" },
                  { label: "Support",       phone: "+91 9566001173", email: "support@bookyourturf.net" },
                  { label: "Admin",         phone: "+91 9940990688", email: "accounts@bookyourturf.net" },
                ].map(({ label, phone, email }) => (
                  <div key={label} style={{ marginBottom: "10px", lineHeight: "1.6" }}>
                    <strong style={{ display: "block" }}>{label}</strong>
                    {phone}
                    <br />
                    <a href={`mailto:${email}`} style={{ color: "#fff", textDecoration: "none", opacity: 0.88 }}>
                      {email}
                    </a>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* COL 3 — OFFICES */}
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "14px" }}>
              Offices
            </h2>

            <div style={{ fontSize: "14px", lineHeight: "1.75" }}>
              <p style={{ marginBottom: "14px" }}>
                <strong>Head office Chennai</strong><br />
                Old No 57/62, New No 111,<br />
                1st Floor, Above KFC,<br />
                Wallahjah Rd, Ellis Puram,<br />
                Anna Salai, Triplicane,<br />
                Chennai, Tamil Nadu - 600002
              </p>

              <p style={{ marginBottom: 0 }}>
                <strong>Corporate Office Madurai</strong><br />
                Plot no: 200 Old LIG Colony<br />
                KK Nagar, Madurai<br />
                Tamil Nadu - 625020
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default FooterInfo;