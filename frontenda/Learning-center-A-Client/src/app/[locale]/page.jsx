"use client";
import "reactflow/dist/style.css";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import Swipr from "@/components/home/Swipr";
import WhyUs from "@/components/home/WhyUs";
import Partners from "@/components/home/Partners";
import Testimonials from "@/components/home/Testimonials";
import Courses from "@/components/home/Courses";
import ImagesGallery from "@/components/home/ImagesGallery";
import Consultatsiya from "@/components/home/Consultatsiya";
import AboutState from "@/components/aboutState";
import { useTranslations } from "next-intl";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import logo from "@/assets/layout/images/logo.jpg";
import Image from "next/image";
import { useGetSwiperQuery } from "@/store/slices/home";

const Home = () => {
  const { data: meProfile } = useGetMeProfileQuery();
  const { data, isLoading, isError } = useGetSwiperQuery();

  const isAdmin = meProfile?.role === "superadmin";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("homePage");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) return <Loading />;

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans min-h-screen transition-all duration-500`}
    >
      <div className="lg:max-w-7xl py-5 mx-5 lg:mx-auto space-y-8">
        <div className="fade-in-up">
          <Swipr isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <WhyUs isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
          <AboutState isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Partners isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Testimonials isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
          <ImagesGallery isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Courses isAdmin={isAdmin} />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.7s' }}>
          <Consultatsiya isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
};

export default Home;
