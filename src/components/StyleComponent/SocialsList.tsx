import React, { FC } from "react";

import { FiFacebook, FiYoutube } from 'react-icons/fi';
import { TbBrandTelegram, TbBrandTwitter, TbBrandSpotify, TbBrandInstagram, TbBrandSoundcloud } from 'react-icons/tb';
import { FaBandcamp } from 'react-icons/fa'
import { RxDiscordLogo } from 'react-icons/rx';

export interface SocialsList1Props {
  className?: string;
  socials?: SocialType[];
}

export interface SocialType {
  name: string;
  icon: any;
  href: string;
}
const socialDemos: SocialType[] = [
  { name: "Facebook", icon: <FiFacebook color={'#33FF00'} />, href: "#" },
  { name: "Spotify", icon: <TbBrandSpotify color={'#33FF00'} />, href: "#" },
  { name: "Instagram", icon: <TbBrandInstagram color={'#33FF00'} />, href: "#" },
  { name: "Soundcloud", icon: <TbBrandSoundcloud color={'#33FF00'} />, href: "#" },
  { name: "Bandcamp", icon: <FaBandcamp color={'#33FF00'} />, href: "#" },
  { name: "Youtube", icon: <FiYoutube color={'#33FF00'} />, href: "#" },
  { name: "Twitter", icon: <TbBrandTwitter color={'#33FF00'} />, href: "#" },
  { name: "Telegram", icon: <TbBrandTelegram color={'#33FF00'} />, href: "#" },
  { name: "Discord", icon: <RxDiscordLogo color={'#33FF00'} />, href: "#" },
];

const SocialsList: FC<SocialsList1Props> = ({ className = "space-y-3", socials = socialDemos }) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        href={item.href}
        className="flex items-center opacity-70 text-2xl text-[#33FF00] leading-none space-x-2 group"
        key={index}
      >
        <div className="inline-flex items-center justify-center w-6 h-6 bg-transparent">
          {item.icon}
        </div>
      </a>
    );
  };

  return (
    <div className={`nc-SocialsList ${className}`} data-nc-id="SocialsList">
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsList;
