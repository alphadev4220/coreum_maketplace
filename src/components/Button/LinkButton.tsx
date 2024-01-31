import React from "react";

export interface ButtonLinkProps {
  label?: string;
  href?: string;
  className?: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({
  label = "View all",
  href,
  className,
}) => {
  return (
    <a className={`green-link ${className}`} href={href}>
      {label}
    </a>
  );
};

export default ButtonLink;
