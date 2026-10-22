"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Squares2X2Icon as LayoutDashboard,
    VideoCameraIcon as Video,
    LightBulbIcon as Lightbulb,
    ArrowRightStartOnRectangleIcon as LogOut,
    FolderIcon as FolderKanban
} from "@heroicons/react/24/outline";
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
    DropdownMenuGroup,
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
                <img src="/KodaSync_Logo_1.png?v=3" alt="KodaSync" width={150} height={150} className="logo-light" />
                <img src="/KodaSync_Logo_1_Dark.png" alt="KodaSync" width={150} height={150} className="logo-dark" />
            </div>

            <nav className="space-y-1.5 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                    ? "bg-foreground text-background shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Jira Connection Status Pill */}
            <div className="mb-3 px-2 py-2 rounded-lg bg-muted/50 border border-border/60 text-[11px] flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isJiraConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                    Jira Cloud
                </span>
                <span className={`font-semibold ${isJiraConnected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {isJiraConnected ? "Connected" : "Disconnected"}
                </span>
            </div>

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
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
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

