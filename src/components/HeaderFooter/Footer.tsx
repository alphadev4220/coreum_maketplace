import React, { useEffect, useState } from "react";
import Logo from "components/HeaderFooter/Logo";
import { Link } from "react-router-dom";
import SocialsList, { SocialType } from "components/StyleComponent/SocialsList";
import { CustomLink } from "data/types";
import Label from "components/StyleComponent/Label";
import Input from "components/StyleComponent/Input";
import ButtonPrimary from "components/Button/ButtonPrimary";
import { FiFacebook, FiYoutube } from "react-icons/fi";
import { TbBrandTelegram, TbBrandTwitter } from "react-icons/tb";
import { RxDiscordLogo } from "react-icons/rx";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  const socialLinks: SocialType[] = [
    {
      name: "Facebook",
      icon: <FiFacebook color={"#33FF00"} />,
      href: "https://facebook.com/rize2day",
    },
    {
      name: "Youtube",
      icon: <FiYoutube color={"#33FF00"} />,
      href: "https://youtube.com/rize2day",
    },
    {
      name: "Twitter",
      icon: <TbBrandTwitter color={"#33FF00"} />,
      href: "https://twitter.com/rize2day",
    },
    {
      name: "Telegram",
      icon: <TbBrandTelegram color={"#33FF00"} />,
      href: "https://t.me/rize2day",
    },
    {
      name: "Discord",
      icon: <RxDiscordLogo color={"#33FF00"} />,
      href: "https://discord.com/rize2day",
    },
  ];
  return (
    <div className="nc-Footer relative dark:bg-[#131313] pt-0 pb-4">
      <div className="px-4">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between pb-4 border-b border-neutral-200 dark:border-neutral-600">
          <div className="flex flex-col w-full">
            <div className="flex items-end pt-6 pb-4 gap-4">
              <Logo />
              <p className="text-gray-700 h-full">
                Gather&nbsp;&nbsp;Create&nbsp;&nbsp;Evolve
              </p>
            </div>

            <div className="flex">
              <Link
                to={"/"}
                className="inset-0 -ml-2 py-2 px-4 dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Dashboard
              </Link>
              <a
                target="_blank"
                href={"https://stake-coreum.rize2day.com/"}
                className="inset-0 py-2 px-4 dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                rel="noreferrer"
              >
                Stake Coreum
              </a>
            </div>
            <SocialsList
              socials={socialLinks}
              className="flex items-center gap-3 sm:gap-5 md:gap-8 lg:gap-8 pt-4 pb-4"
            />
          </div>
          <div className={`flex ${isMobile && "w-full"}`}>
            <div className="mt-2">
              <Label>Join our newsletter</Label>
              <div className="mt-1.5 flex gap-4">
                <Input
                  className="!border-[#33FF00]"
                  placeholder="Enter your Email"
                  sizeClass="h-11 px-4 h-[45px]"
                />
                <ButtonPrimary className="rounded-xl h-[45px]">
                  Send
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex justify-between py-2 items-center ${
            isMobile && "flex-col"
          }`}
        >
          <p className="mb-0">2023 Rize. All rights reserved</p>
          <div className="flex gap-2">
            <a
              target="_blank"
              href={
                "https://app.termly.io/document/terms-and-conditions/8654259c-7bb6-4800-bfad-813417b2c74c"
              }
              className="inset-0 py-2 px-4 dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg"
              rel="noreferrer"
            >
              Terms
            </a>
            <a
              target="_blank"
              href={
                "https://app.termly.io/document/privacy-policy/ba02f494-1ec5-4fde-a984-c32853f78c91"
              }
              className="inset-0 py-2 px-4 dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
