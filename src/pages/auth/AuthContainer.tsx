// src/pages/auth/AuthContainer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LogoImg from "../../assets/LogoImg.png";
import BgImg from "../../assets/BgImg.jpeg";
import BgImg1 from "../../assets/BgImg1.jpg";


const AuthContainer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      // style={{
      //   backgroundImage: `url(${BgImg1})`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   backgroundRepeat: 'no-repeat'
      // }}
    >
      {/* Overlay for better readability */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          zIndex: 1
        }}
      />

      {/* Content Card */}
      <div className="position-relative" style={{ zIndex: 2 }}>
        <div 
          className="card shadow-lg border-0 p-4"
          style={{
            maxWidth: '450px',
            width: '90vw',
            borderRadius: '30px',
        backgroundImage: `url(${BgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Logo */}
          <div className="text-center mb-4">
        
            
              <img 
                src={LogoImg}
                alt="Book Your Turf Logo" 
                className="img-fluid"
                style={{ maxWidth: '220px', width: '100%' }}
              />
            </div>
        

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-3 px-3">
            <button
              className="btn btn-lg d-flex align-items-center justify-content-center gap-3 shadow"
              style={{
                backgroundColor: 'rgba(14, 13, 13, 0.52)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate("/login", { state: { role: "user" } })}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(14, 13, 13, 0.52)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 13, 13, 0.52)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(14, 13, 13, 0.52)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <i className="bi bi-person-circle" style={{ fontSize: '24px' }}></i>
              <span>I'm a User</span>
            </button>

            <button
              className="btn btn-lg d-flex align-items-center justify-content-center gap-3 shadow"
              style={{
                backgroundColor: 'rgba(14, 13, 13, 0.52)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate("/login", { state: { role: "owner" } })}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(14, 13, 13, 0.52)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 13, 13, 0.52)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(14, 13, 13, 0.52)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <i className="far fa-futbol" style={{ fontSize: '24px' }}></i>
              <span>I'm a Channel Partner</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <p 
              className="mb-1" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontStyle: 'italic'
              }}
            >
              Powered by
            </p>
            <p 
              className="mb-0 fw-bold" 
              style={{ 
                color: 'white',
                fontSize: '15px',
                fontStyle: 'italic'
              }}
            >
              NOTTAM INFOTECH PRIVATE LIMITED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;