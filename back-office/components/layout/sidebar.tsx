"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tag,
  Dumbbell,
  Calendar,
  BookOpen,
  Coffee,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Colors } from "@/lib/constants";

const sidebarLinks = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/dashboard",
    color: Colors.brandBlue[0],
  },
  {
    title: "Utilisateurs",
    icon: <Users size={20} />,
    href: "/dashboard/users",
    color: Colors.info,
  },
  {
    title: "Tags",
    icon: <Tag size={20} />,
    href: "/dashboard/tags",
    color: Colors.success,
  },
  {
    title: "Exercices",
    icon: <Dumbbell size={20} />,
    href: "/dashboard/exercises",
    color: Colors.plan.athlete.primary,
  },
  {
    title: "Séances",
    icon: <Calendar size={20} />,
    href: "/dashboard/sessions",
    color: Colors.plan.cardio.primary,
  },
  {
    title: "Programmes",
    icon: <BookOpen size={20} />,
    href: "/dashboard/programs",
    color: Colors.plan.muscle.primary,
  },
  {
    title: "Aliments",
    icon: <Coffee size={20} />,
    href: "/dashboard/foods",
    color: Colors.plan.durable.primary,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r transition-all duration-300 fixed top-0 left-0",
        collapsed ? "w-[80px]" : "w-[250px]",
        className
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-xl font-bold text-brand-gradient">
              HealthyCore
            </span>
            <span className="ml-1 text-xl font-bold">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                  "hover:bg-gray-100 group",
                  pathname === link.href ? "bg-gray-100" : "transparent"
                )}
              >
                <div
                  className="mr-3"
                  style={{
                    color:
                      pathname === link.href ? link.color : Colors.gray.medium,
                  }}
                >
                  {link.icon}
                </div>
                {!collapsed && (
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-black font-semibold"
                        : "text-gray-600 group-hover:text-gray-900"
                    )}
                  >
                    {link.title}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut size={20} className="mr-2" />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}
