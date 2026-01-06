"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/about/Cn";

// Основной контейнер аккордеона
export const Accordion = AccordionPrimitive.Root;

// Элемент аккордеона с hover эффектами
export const AccordionItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        "border-b border-gray-200 rounded-lg transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.01] transform",
        "[&[data-state=open]]:shadow-xl",
        className
      )}
      {...props}
    />
  )
);
AccordionItem.displayName = "AccordionItem";

// Заголовок аккордеона с анимацией при открытии
export const AccordionTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-6 text-left text-lg font-semibold transition-all duration-300",
          "text-gray-900 px-4 rounded-lg group",
          "hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:via-white hover:to-blue-50",
          "[&[data-state=open]]:bg-blue-50 [&[data-state=open]]:text-blue-700 [&[data-state=open]]:rounded-t-lg [&[data-state=open]]:rounded-b-none",
          // Анимация текста при открытии
          "transition-all ease-out duration-500",
          "[&[data-state=open]]:translate-y-[-2px] [&[data-state=open]]:text-blue-700",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ease-out group-hover:text-blue-600 [&[data-state=open]]:text-blue-600" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// Контент с плавным появлением и градиентом
export const AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pb-6 pt-2 px-4 text-gray-700 leading-relaxed bg-linear-to-r from-blue-50 via-white to-blue-50 rounded-b-lg border-t border-blue-100",
          "transition-all duration-500 ease-out",
          "data-[state=open]:animate-fade-in data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export default {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
