import MarqueeSlider from "components/StyleComponent/MarqueeSlider/imageMarquee";
import { useMediaQuery } from "react-responsive";
import img1 from "images/marquee/Capture1.PNG";
import img2 from "images/marquee/Capture2.PNG";
import img3 from "images/marquee/Capture3.PNG";
import img4 from "images/marquee/Capture4.PNG";
import img5 from "images/marquee/Capture5.PNG";
import img6 from "images/marquee/Capture6.PNG";
import img7 from "images/marquee/Capture8.PNG";
import img8 from "images/marquee/Capture9.PNG";
import img9 from "images/marquee/Capture10.PNG";
import img10 from "images/marquee/Capture11.PNG";
import img11 from "images/marquee/Capture12.PNG";
import img12 from "images/marquee/Capture13.PNG";
import img13 from "images/marquee/Capture14.PNG";
import img14 from "images/marquee/Capture15.PNG";
import img15 from "images/marquee/Capture16.PNG";
import img16 from "images/marquee/Capture17.PNG";
import img17 from "images/marquee/Capture18.PNG";
import img18 from "images/marquee/Capture19.PNG";
import img19 from "images/marquee/Capture20.PNG";
import img20 from "images/marquee/Capture21.PNG";
import img21 from "images/marquee/Capture7.png";
import img22 from "images/marquee/Capture22.png";
import img23 from "images/marquee/Capture23.png";
import img24 from "images/marquee/Capture24.png";
import img25 from "images/marquee/Capture (1).png";
import img26 from "images/marquee/Capture (2).png";
import img27 from "images/marquee/Capture (3).png";
import img28 from "images/marquee/Capture (4).png";
import img29 from "images/marquee/Capture (5).png";
import img30 from "images/marquee/Capture (6).png";
import img31 from "images/marquee/Capture (7).png";
import img32 from "images/marquee/Capture (8).png";
import img33 from "images/marquee/Capture (9).png";
import img34 from "images/marquee/Capture (10).png";
import img35 from "images/marquee/Capture (11).png";
import img36 from "images/marquee/Capture (12).png";
import img37 from "images/marquee/Capture (13).png";
import img38 from "images/marquee/Capture (14).png";
import img39 from "images/marquee/Capture (15).png";
import img40 from "images/marquee/Capture (16).png";
import img41 from "images/marquee/Capture (17).png";

const MARQUE_IMAGES = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
  img14,
  img15,
  img16,
  img17,
  img18,
  img19,
  img20,
];

const MARQUE_IMAGES_2 = [
  img21,
  img22,
  img23,
  img24,
  img25,
  img25,
  img26,
  img27,
  img28,
  img29,
  img30,
  img31,
  img32,
  img33,
];

const MARQUE_IMAGES_3 = [
  img34,
  img35,
  img36,
  img37,
  img38,
  img39,
  img40,
  img41,
];

const Marquee3D = () => {
  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isBigScreen = useMediaQuery({ query: "(min-width: 1824px)" });

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
      <div className={"absolute top-0 bottom-0 flex items-center w-full"}>
        <MarqueeSlider
          items={MARQUE_IMAGES}
          speed={9 * 10 ** 5}
          delay={7}
          width={isBigScreen ? 300 : isDesktopOrLaptop ? 200 : 200}
        />
      </div>
      <div className={"absolute top-0 bottom-0 flex items-start w-full"}>
        <MarqueeSlider
          items={MARQUE_IMAGES_2}
          speed={4 * 10 ** 5}
          delay={3}
          width={isBigScreen ? 400 : isDesktopOrLaptop ? 300 : 250}
        />
      </div>
      <div className={"absolute top-0 bottom-0 flex items-end w-full"}>
        <MarqueeSlider
          items={MARQUE_IMAGES_3}
          speed={2 * 10 ** 5}
          delay={1}
          width={isBigScreen ? 500 : isDesktopOrLaptop ? 400 : 300}
        />
      </div>
    </div>
  );
};

export default Marquee3D;
