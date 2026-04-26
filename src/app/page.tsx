import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <main className="flex flex-1 w-full flex-col items-center justify-center py-20 px-12">
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-tight text-[#171717]">
            Note Taker
          </h1>
          <p className="text-lg leading-relaxed text-center text-[#6b7280] max-w-xl">
            Capture your thoughts, organize your ideas, and collaborate seamlessly — all in one place.
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#383838]"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e5e7eb] px-5 py-2.5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#f3f4f6]"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="flex gap-8 mt-20 max-w-4xl">
          {/* Feature 1 */}
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg border border-[#e5e7eb] shadow-sm w-80">
            <h3 className="text-sm font-semibold text-[#171717]">Simple & intuitive</h3>
            <p className="text-sm text-[#6b7280]">Clean and minimal note-taking that feels natural.</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg border border-[#e5e7eb] shadow-sm w-80">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#171717]">Always accessible</h3>
            <p className="text-sm text-[#6b7280]">Last updated just now</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg border border-[#e5e7eb] shadow-sm w-80">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#171717]">Lightning fast</h3>
            <p className="text-sm text-[#6b7280]">Real-time sync across all your devices</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-8 border-t border-[#e5e7eb]">
        <p className="text-sm text-[#9ca3af]">© 2024 Note Taker</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-sm text-[#9ca3af] hover:text-[#6b7280]">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-[#9ca3af] hover:text-[#6b7280]">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}