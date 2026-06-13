export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-black/5 dark:border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#6e6e73]">
          © {new Date().getFullYear()} full-job-quitter. Built for dreamers with a plan.
        </p>
        <div className="flex items-center gap-6 text-sm text-[#6e6e73]">
          <span className="hover:text-[#0066cc] transition-colors cursor-pointer">
            Privacy
          </span>
          <span className="hover:text-[#0066cc] transition-colors cursor-pointer">
            Terms
          </span>
        </div>
      </div>
    </footer>
  )
}
