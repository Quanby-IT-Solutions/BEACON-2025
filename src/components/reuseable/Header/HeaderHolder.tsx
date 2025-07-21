"use client";

import { ModeToggle } from "../page-components/ModeToggle";

const HeaderHolder = () => {
  return (
    <div className="bg-4 h-[10dvh]">
      <div className="w-full h-full max-w-[80dvw] mx-auto flex items-center justify-between">
        <ModeToggle />
      </div>
    </div>
  );
};

export default HeaderHolder;
