"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/admin");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-2">OA.</h1>
                    <p className="text-white/50">Admin Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
