import React from "react";
import "./Style/About.css";
import p4 from "../assets/p4.jpeg";

const About: React.FC = () => {
  return (
    <section className="about-wrapper">
      <div className="about-card">
        {/* Left: Image */}
        <div className="about-image">
          <img src={p4} alt="About BookMyTurf" />
        </div>

        {/* Right: Content */}
        <div className="about-content">
          <h2>ABOUT US</h2>
          <p>
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do
            Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua. Ut Enim
            Ad Minim Veniam, Quis Nostrud Exercitation Ullamco Laboris Nisi Ut
            Aliquip Ex Ea Commodo Consequat. Duis Aute Irure Dolor In
            Reprehenderit In Voluptate Velit Esse Cillum Dolore Eu Fugiat Nulla
            Pariatur. Excepteur Sint Occaecat Cupidatat Non Proident, Sunt In
            Culpa Qui Officia Deserunt Mollit Anim Id Est Laborum.
          </p>
          <button className="about-btn">Join Now</button>
        </div>
      </div>
    </section>
  );
};

export default About;
