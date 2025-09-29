import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button"; // your existing Button component

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // go back to previous page
  };

  return <Button text="Back" variant="secondary" onClick={handleBack} />;
};

export default BackButton;
