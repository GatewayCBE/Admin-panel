import React from "react";

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, image, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      {image && <img src={image} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
      </div>
    </div>
  );
};

export default Card;
