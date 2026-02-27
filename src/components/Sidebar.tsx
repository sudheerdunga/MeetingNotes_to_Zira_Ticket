"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Lightbulb, User, LogOut } from "lucide-react";
import { Session } from "next-auth";
import { signOut, signIn } from "next-auth/react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Meetings", href: "/meetings", icon: Video },
    { name: "Insights", href: "/insights", icon: Lightbulb },
];

export function Sidebar({ session }: { session: Session }) {
    const user = session.user;
    const isJiraConnected = !!session.jiraAccessToken;
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <h1>KodaSync</h1>
            <nav className="nav-links">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${isActive ? "active" : ""}`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {user && (
                <div className="user-section" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="user-avatar"
                            />
                        ) : (
                            <div className="user-avatar">
                                <User size={16} />
                            </div>
                        )}
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: '0.9rem' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--secondary-foreground)", opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '0 12px' }}>
                        {isJiraConnected ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52c41a', fontSize: '0.8rem', padding: '4px 0' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }} />
                                Jira Connected
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("atlassian")}
                                className="btn btn-primary"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '6px 12px',
                                    backgroundColor: '#0052CC',
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginBottom: '4px'
                                }}
                            >
                                Connect Jira
                            </button>
                        )
                        }
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="nav-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', width: '100%', justifyContent: 'flex-start', color: '#ff4d4f' }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </aside>
    );
}
