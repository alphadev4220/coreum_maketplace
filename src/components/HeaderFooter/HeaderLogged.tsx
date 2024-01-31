import React from "react";
import MainNavLogged from "./MainNavLogged";

const HeaderLogged = (props: any) => {
  const { collections, items, users } = props;
  return (
    <div className="nc-HeaderLogged relative w-full z-40 ">
      {/* NAV */}
      <MainNavLogged collections={collections} items={items} users={users} />
    </div>
  );
};

export default HeaderLogged;
