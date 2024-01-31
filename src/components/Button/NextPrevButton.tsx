export function SampleNextArrow(props) {
  const { onClick } = props;
  return (
    <img
      className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] right-[-19px] rounded-81xl w-[38px] h-[38px] overflow-hidden shrink-0 z-[4]"
      alt=""
      src="/assets/rightarrow.svg"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    />
  );
}

export function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <img
      className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] left-[-19px] rounded-81xl w-[38px] h-[38px] overflow-hidden shrink-0 z-[4]"
      alt=""
      src="/assets/leftarrow.svg"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    />
  );
}