"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-lg font-semibold text-[#171717]">
          Note Taker
        </Link>
        <Link href="/login" className="text-sm text-[#6b7280] hover:text-[#171717]">
          Log in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[#171717] mb-2">Create your account</h1>
          <p className="text-sm text-[#6b7280] mb-8">Start taking notes in seconds</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[#171717]">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Edmund Hee"
                required
                className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#171717]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#171717]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-md bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#383838] disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}