"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/components/about/Cn";

const FAQAccordion = ({ faqs }) => {
  const Accordion = AccordionPrimitive.Root;

  const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        "bg-[#00C3FF] text-white rounded-[20px] px-4 sm:px-6 py-4 sm:py-6 shadow-md transition-all",
        "hover:shadow-lg hover:scale-[1.01]",
        className
      )}
      {...props}
    />
  ));
  AccordionItem.displayName = "AccordionItem";

  const AccordionTrigger = React.forwardRef(
    ({ className, children, isOpen, ...props }, ref) => (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between cursor-pointer transition-all duration-300",
            className
          )}
          {...props}
        >
          <div className="flex-1">
            {children}
          </div>
          <button
            className={cn(
              "bg-white/30 hover:bg-white/40 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300",
              isOpen ? "rotate-45" : "rotate-0"
            )}
            aria-hidden="true"
          >
            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
          </button>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    )
  );
  AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

  const AccordionContent = React.forwardRef(
    ({ className, children, isOpen, ...props }, ref) => (
      <AccordionPrimitive.Content
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "mt-4 text-sm sm:text-base opacity-90 transition-opacity duration-500",
            isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {children}
        </div>
      </AccordionPrimitive.Content>
    )
  );
  AccordionContent.displayName = AccordionPrimitive.Content.displayName;

  // Управление открытым элементом для + / -
  const [openItem, setOpenItem] = useState(null);
  const toggleItem = (value) => {
    setOpenItem(openItem === value ? null : value);
  };

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-6 w-full lg:w-[50%]">
      {faqs.map((category, catIdx) =>
        category.items.map((item, itemIdx) => {
          const value = `item-${catIdx}-${itemIdx}`;
          const isOpen = openItem === value;
          return (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger isOpen={isOpen} onClick={() => toggleItem(value)}>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold">{item.question}</h3>
                  <p className="text-sm sm:text-base opacity-80">{item.answer}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent isOpen={isOpen}>
                <p>
                  Дополнительная информация: <b>{item.question}</b>. Здесь можно добавить
                  пояснения, темы и примеры.
                </p>
              </AccordionContent>
            </AccordionItem>
          );
        })
      )}
    </Accordion>
  );
};

export default FAQAccordion;
