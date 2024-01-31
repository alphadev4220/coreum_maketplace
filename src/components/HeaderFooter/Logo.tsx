import React from "react";
import { Link } from "react-router-dom";
import logoImg from "images/RizeLogo.png";
import logoLightImg from "images/RizeLogo.png";

export interface LogoProps {
  img?: string;
  imgLight?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  img = logoImg,
  imgLight = logoLightImg,
  className = "",
}) => {
  return (
    <Link
      to="/"
      className={`ttnc-logo inline-block text-primary-6000 ${className}`}
    >
      {/* THIS USE FOR MY CLIENT */}
      {/* PLEASE UN COMMENT BELLOW CODE AND USE IT */}
      {img ? (
        <img
          className={`block ${imgLight ? "dark:hidden" : ""}`}
          src={img}
          width={110}
          style={{ maxWidth: "150px" }}
          alt="Logo"
        />
      ) : (
        "Logo Here"
      )}
      {imgLight && (
        <img
          className="hidden dark:block"
          src={imgLight}
          width={110}
          style={{ maxWidth: "150px" }}
          alt="Logo-Light"
        />
      )}
    </Link>
  );
};

export default Logo;
