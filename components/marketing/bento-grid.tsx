"use client"

import { motion, type Variants } from "framer-motion"
import { Calculator, Route, BarChart3, Shield } from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Freedom Calculator",
    description:
      "Input expenses, savings, and monthly contributions to discover exactly how much runway you need before handing in your notice.",
    className: "md:col-span-2",
  },
  {
    icon: Route,
    title: "Milestone Tracker",
    description:
      "Break your exit into clear phases — from financial cushion to final conversation — and track progress as you go.",
    className: "md:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize your savings rate, projected quit date, and milestone completion in one clean overview.",
    className: "md:col-span-1",
  },
  {
    icon: Shield,
    title: "Private by design",
    description:
      "Your financial data belongs to you. Row Level Security in Supabase ensures only you can read or write your goals.",
    className: "md:col-span-2",
  },
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function BentoGrid() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
            Everything you need to escape.
          </h2>
          <p className="text-lg text-[#8a8a8a] max-w-2xl mx-auto">
            A focused toolkit for the most important career decision you&apos;ll make.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={`group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 ${feature.className}`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#f5c542]/20 flex items-center justify-center mb-6">
                <feature.icon
                  size={24}
                  strokeWidth={1.75}
                  className="text-[#1d1d1f]"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#8a8a8a] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
