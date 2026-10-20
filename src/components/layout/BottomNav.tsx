"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Pill, AlertTriangle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on splash, camera scan, and analyzing screens for full immersion
  if (pathname === "/" || pathname === "/scan" || pathname === "/analyzing") {
    return null;
  }

  const navItems = [
    {
      label: "Beranda",
      href: "/beranda",
      icon: Home,
      isActive: pathname === "/beranda"
    },
    {
      label: "Obat",
      href: "/drugs",
      icon: Pill,
      isActive: pathname.startsWith("/drugs")
    },
    {
      label: "Pindai",
      href: "/scan",
      icon: Camera,
      isCenter: true,
      isActive: pathname === "/scan"
    },
    {
      label: "Pantangan",
      href: "/restrictions",
      icon: AlertTriangle,
      isActive: pathname === "/restrictions"
    },
    {
      label: "Profil",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile"
    }
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-md border-t border-slate-200/75 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-4 flex flex-col items-center"
              >
                <div className="w-13 h-13 rounded-full btn-primary-grad flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 border-3 border-white">
                  <Icon className="w-6 h-6 text-white stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-0.5 tracking-tight">
                  Pindai
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                item.isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className="text-[10.5px] tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 -mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
