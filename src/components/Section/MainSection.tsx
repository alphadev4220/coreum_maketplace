import { Helmet } from "react-helmet";

export interface MainSectionProps {
  title?: string;
  children?;
  className?: string;
}
const MainSection = ({ title, children, className }: MainSectionProps) => {
  return (
    <>
      <Helmet>
        <title>{title} || Rize2Day</title>
      </Helmet>
      <div className={`mt-4 ${className}`}>{children}</div>
    </>
  );
};

export default MainSection;
