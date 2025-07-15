/* eslint-disable no-unused-vars */
import React from "react";

// eslint-disable-next-line react/prop-types
function HeaderItem({ name, Icon }) {
  return (
    <div className="text-white flex items-center gap-3 text-[15px] font-semibold cursor-pointer mb-2">
      <Icon />
      <h2 className="">{name}</h2>
    </div>
  );
}

export default HeaderItem;
