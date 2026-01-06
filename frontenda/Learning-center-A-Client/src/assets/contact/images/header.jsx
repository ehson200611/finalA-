"use Client";

import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <header>
      <section className=" flex items-center justify-center gap-5 bg-[#34D3D6] p-4 h-[10vh] ">
        <p className="text-white font-bold text-[20px]">Бесплатный урок</p>
        <button className="bg-white py-1 px-4 rounded-full font-semibold text-sm">
          Зарегистрировать
        </button>
      </section>

      <nav className="sticky">
        <Image
          src={"../../../assets/"}
          width={500}
          height={500}
          priority
        />
      </nav>
    </header>
  );
};

export default Header;
