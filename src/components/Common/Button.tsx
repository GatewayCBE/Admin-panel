import React from "react";

export interface ButtonProps {
  text: string;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset"; 
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, variant = "primary", type = "button", onClick }) => {
  return (
    <button className={`btn btn-${variant}`} type={type} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
