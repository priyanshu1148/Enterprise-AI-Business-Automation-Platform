"use client";

import { BOOKING_LINK } from "../constants";

const systems = [
  {
    icon: "🤖",
    title: "AI Lead Generation",
    description:
      "Automatically capture and qualify high-quality leads 24/7.",
  },
  {
    icon: "📧",
    title: "WhatsApp & Email Automation",
    description:
      "Follow up with every lead automatically until they are ready to buy.",
  },
  {
    icon: "📞",
    title: "AI Voice Calling",
    description:
      "AI calls leads, answers common questions and books appointments.",
  },
  {
    icon: "📊",
    title: "CRM & Pipeline Automation",
    description:
      "Manage every lead in one place without missing opportunities.",
  },
  {
    icon: "📅",
    title: "Appointment Booking",
    description:
      "Let customers book meetings automatically with your calendar.",
  },
  {
    icon: "📈",
    title: "Business Dashboard",
    description:
      "Track leads, sales and automation performance in real time.",
  },
];

export default function AutomationSystems() {
  return (
    <section className="bg-[#081326] py-14 text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-2 rounded-full border border-blue-500 text-blue-400 text-sm uppercase tracking-wider">
            AI Automation Systems
          </span>

          <h2 className="mt-5 text-4xl md:text-5xl font-bold">
            What We'll Automate <br />
            <span className="text-blue-500">
              Inside Your Business
            </span>
          </h2>

          <p className="mt-4 max-w-3xl mx-auto text-gray-400">
            We build AI systems that save time, increase conversions
            and automate repetitive work so your business grows faster.
          </p>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {systems.slice(0, 2).map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-blue-800 bg-[#111827] p-5 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,.35)] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black border border-blue-700 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.title}</h3>

                  <p className="mt-2 text-gray-400 text-sm leading-6">
                    {item.description}
                  </p>
                </div>

                <span className="text-2xl text-blue-500 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Center Card */}
        <div className="flex justify-center my-5">
          <div className="w-full md:w-5/6">
            <div className="group rounded-3xl border border-blue-800 bg-[#111827] p-5 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,.35)] transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black border border-blue-700 flex items-center justify-center text-2xl">
                  {systems[2].icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {systems[2].title}
                  </h3>

                  <p className="mt-2 text-gray-400 text-sm leading-6">
                    {systems[2].description}
                  </p>
                </div>

                <span className="text-2xl text-blue-500 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {systems.slice(3, 5).map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-blue-800 bg-[#111827] p-5 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,.35)] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black border border-blue-700 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.title}</h3>

                  <p className="mt-2 text-gray-400 text-sm leading-6">
                    {item.description}
                  </p>
                </div>

                <span className="text-2xl text-blue-500 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
                {/* Last Center Card */}
        <div className="flex justify-center mt-5">
          <div className="w-full md:w-5/6">
            <div className="group rounded-3xl border border-blue-800 bg-[#111827] p-5 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,.35)] transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black border border-blue-700 flex items-center justify-center text-2xl">
                  {systems[5].icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {systems[5].title}
                  </h3>

                  <p className="mt-2 text-gray-400 text-sm leading-6">
                    {systems[5].description}
                  </p>
                </div>

                <span className="text-2xl text-blue-500 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-lg font-bold shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-400"
          >
            📅 Book Your Free Strategy Call
            <span className="text-xl">→</span>
          </a>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <span>🛡 No Obligation</span>
            <span>•</span>
            <span>100% Free</span>
            <span>•</span>
            <span>30 Min Call</span>
          </div>
        </div>

      </div>
    </section>
  );
}