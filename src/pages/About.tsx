import React from "react";
import p4 from "../assets/p4.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";

const About: React.FC = () => {
  return (
    <section className="py-5 d-flex justify-content-center" style={{ backgroundColor: "#f6f6e9" }}>
      <div
        className="row align-items-center shadow rounded-3 mx-2 w-100 position-relative"
        style={{ backgroundColor: "#2d6a4f", maxWidth: "1100px" }}
      >
        {/* Desktop/Tablet Image (floating left) */}
        <div className="d-none d-md-flex col-md-4 justify-content-center">
          <div
            className="shadow-lg overflow-hidden position-absolute"
            style={{
              borderRadius: "15px",
              top: "-25px",
              width: "200px",
              height: "350px",
              zIndex: "2",
            }}
          >
            <img
              src={p4}
              alt="About BookMyTurf"
              className="img-fluid h-100 w-100"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Mobile Image (stacked on top, same size) */}
        <div className="d-block d-md-none text-center mb-3">
          <div
            className="shadow-lg overflow-hidden mx-auto"
            style={{
              borderRadius: "15px",
              width: "200px",
              height: "350px",
            }}
          >
            <img
              src={p4}
              alt="About BookMyTurf"
              className="img-fluid h-100 w-100"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="col-md-8 offset-md-4 text-md-start text-center p-4">
          <h2
            className="fw-bold mb-3"
            style={{ color: "#f1faee", textTransform: "uppercase", fontSize: "25px" }}
          >
            About Us
          </h2>
          <p className="lh-lg text-light" style={{ fontSize: "14px" }}>
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor
            Incididunt Ut Labore Et Dolore Magna Aliqua. Ut Enim Ad Minim Veniam, Quis Nostrud
            Exercitation Ullamco Laboris Nisi Ut Aliquip Ex Ea Commodo Consequat. Duis Aute Irure
            Dolor In Reprehenderit In Voluptate Velit Esse Cillum Dolore Eu Fugiat Nulla Pariatur.
            Excepteur Sint Occaecat Cupidatat Non Proident, Sunt In Culpa Qui Officia Deserunt
            Mollit Anim Id Est Laborum.
          </p>
          <button
            className="btn fw-bold shadow-sm px-4 py-2 mt-3"
            style={{
              backgroundColor: "#f6f6e9",
              color: "#2d6a4f",
              borderRadius: "8px",
            }}
          >
            Join Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
