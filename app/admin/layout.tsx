"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, LogOut, Settings, Image as ImageIcon } from "lucide-react";

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
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="text-2xl font-black text-white">
                        OA<span className="text-accent">.</span>
                    </Link>
                    <p className="text-xs text-white/40 mt-1 font-mono">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
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
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
