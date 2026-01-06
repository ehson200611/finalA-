import React from "react";

const SectionOne = ({ title, description }) => {
  return (
    <section className={`py-0 lg:py-16 text-center px-6 rounded-lg`}>
      <div className="max-w-3xl mx-auto relative">
        <div className="absolute inset-0 bg-linear-to-r from-[#34d3d6] via-[#216f6f] to-[#34d3d6] opacity-10 blur-3xl"></div>
        <div className="text-3xl lg:text-5xl font-extrabold mb-6 bg-linear-to-r from-[#34d3d6] via-[#216f6f] to-[#34d3d6] bg-clip-text text-transparent">
          {title}
        </div>
        <div className="text-xl lg:text-2xl mb-4">{description}</div>

        <div className="bg-gradient-to-r from-[#34d3d6] via-[#216f6f] to-[#34d3d6] w-1/8 h-[5px] rounded-2xl mx-auto "></div>
      </div>
    </section>
  );
};

export default SectionOne;
