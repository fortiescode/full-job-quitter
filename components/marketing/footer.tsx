export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#e8e0cc]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#8a8a8a]">
          © {new Date().getFullYear()} full-jog-quitter. Built for dreamers with a plan.
        </p>
        <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
          <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">
            Privacy
          </span>
          <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">
            Terms
          </span>
        </div>
      </div>
    </footer>
  )
}
