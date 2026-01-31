"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, LogOut, Settings, Image as ImageIcon, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Don't wrap login page with admin layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden p-4 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-40">
                <Link href="/" className="text-xl font-black text-white">
                    OA<span className="text-accent">.</span>
                    <span className="text-xs text-white/40 font-mono ml-2 font-normal">Admin</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 flex flex-col transition-transform duration-300 transform lg:transform-none lg:static lg:inset-auto",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6 border-b border-white/10 hidden lg:block">
                    <Link href="/" className="text-2xl font-black text-white">
                        OA<span className="text-accent">.</span>
                    </Link>
                    <p className="text-xs text-white/40 mt-1 font-mono">Admin Panel</p>
                </div>

                {/* Mobile Sidebar Header */}
                <div className="p-4 border-b border-white/10 lg:hidden flex justify-between items-center">
                    <div>
                        <span className="text-xl font-black text-white">OA<span className="text-accent">.</span></span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-white/60 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-accent text-black"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto min-h-[calc(100vh-65px)] lg:min-h-screen">
                {children}
            </main>
        </div>
    );
}
