"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Lightbulb, LogOut, FolderKanban } from "lucide-react";
import { Session } from "next-auth";
import { signOut, signIn } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Meetings", href: "/meetings", icon: Video },
    { name: "Insights", href: "/insights", icon: Lightbulb },
    { name: "Roadmap", href: "/opportunities", icon: FolderKanban },
];

export function Sidebar({ session }: { session: Session }) {
    const user = session.user;
    const isJiraConnected = !!session.jiraAccessToken;
    const pathname = usePathname();

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col h-screen sticky top-0">
            <div className="flex items-center gap-2 px-2 py-4 mb-4">
                <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    KodaSync
                </h1>
            </div>

            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            }`}
                        >
                            <item.icon className="h-4.5 w-4.5 shrink-0" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {user && (
                <div className="mt-auto pt-4 border-t border-sidebar-border">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 text-left transition-colors cursor-pointer outline-hidden">
                            <Avatar className="h-9 w-9 border border-sidebar-border">
                                {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sidebar-foreground truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-sidebar-foreground/50 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mb-2">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center justify-between py-2">
                                <span className="text-sm">Jira Integration</span>
                                {isJiraConnected ? (
                                    <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs bg-indigo-600 text-white hover:bg-indigo-700 border-none"
                                        onClick={() => signIn("atlassian")}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut()}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </aside>
    );
}

