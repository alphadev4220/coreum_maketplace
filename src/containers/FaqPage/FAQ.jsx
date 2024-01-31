import { useCallback, useEffect, useState } from "react";
import "./FaqAccrodianstyles.scss";
import faqTitle from "images/letters_faq.png";
import backgroundImg from "images/faq_background.png";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { selectFAQKeyword } from "app/reducers/search.reducers";
import { isEmpty } from "app/methods";
import { FAQ_SCRIPT } from "data/FaqData";

const PageFAQ = () => {
  const keyword = useSelector(selectFAQKeyword);
  const [searchedFAQs, setSearchedFAQs] = useState(FAQ_SCRIPT);
  const [selId, setSelId] = useState(-1);
  const [showAllAnswer, setShowAllAnswer] = useState({});
  const clickItem = useCallback(
    (index) => {
      if (selId === index) {
        setSelId(-1);
      } else {
        setSelId(index);
      }
    },
    [selId]
  );

  useEffect(() => {
    let showAnswers = [];
    if (isEmpty(keyword) === false) {
      let filteredFAQs = FAQ_SCRIPT.filter(
        (item) =>
          item?.q?.toString()?.toLowerCase()?.includes(keyword?.toString()) ===
          true
      );
      for (let idx = 0; idx < filteredFAQs.length; idx++) {
        if (filteredFAQs[idx]?.a?.toString().length > 200) {
          showAnswers = { ...showAnswers, [filteredFAQs[idx].q]: false };
        } else {
          showAnswers = { ...showAnswers, [filteredFAQs[idx].q]: null };
        }
      }
      setSearchedFAQs(filteredFAQs);
    } else {
      let faqs = FAQ_SCRIPT;
      for (let idx = 0; idx < FAQ_SCRIPT.length; idx++) {
        if (faqs[idx]?.a?.toString().length > 200) {
          showAnswers = { ...showAnswers, [faqs[idx].q]: false };
        } else {
          showAnswers = { ...showAnswers, [faqs[idx].q]: null };
        }
      }
      setSearchedFAQs(faqs);
    }
    setShowAllAnswer(showAnswers);
  }, [keyword]);

  const handleClickShowMore = (query) => {
    let flag = showAllAnswer[query];
    let newFlags = { ...showAllAnswer, [query]: !flag };
    setShowAllAnswer(newFlags);
  };

  return (
    <div
      className="relative w-full h-full"
      style={{ background: `url(${backgroundImg})` }}
    >
      <div className="w-full h-full z-2">
        <div className="flex justify-center flex-col items-center text-8xl py-10 mb-5 ">
          <img
            src={faqTitle}
            className="w-[200px] md:w-[300px] lg:w-[400px] "
            alt=""
          />
        </div>
        <div className="container section-faq__content pb-20">
          {searchedFAQs &&
            searchedFAQs.length > 0 &&
            searchedFAQs.map((item, index) => (
              <div className="accordion-wrapper" key={index}>
                <div
                  className={
                    selId === index
                      ? "accordion active"
                      : "accordion rounded-2xl"
                  }
                  onClick={() => {
                    clickItem(index);
                  }}
                >
                  <span className=" text-black text-xl flex pl-3 pt-0">
                    <span className="mr-2">Q:</span>
                    <span>{item?.q}</span>
                  </span>
                </div>
                <div className="panel  ">
                  {parse(
                    showAllAnswer[item?.q] === false
                      ? item?.a?.toString().substring(0, 200) + "..."
                      : item?.a
                  )}
                  {showAllAnswer[item?.q] === false ? (
                    <span
                      className="ml-1 inline text-[rgb(255,171,64)] cursor-pointer z-5"
                      onClick={() => handleClickShowMore(item?.q)}
                    >
                      Show more
                    </span>
                  ) : showAllAnswer[item?.q] === true ? (
                    <span
                      className="ml-1 inline text-[rgb(255,171,64)] cursor-pointer z-5"
                      onClick={() => handleClickShowMore(item?.q)}
                    >
                      Show less
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PageFAQ;