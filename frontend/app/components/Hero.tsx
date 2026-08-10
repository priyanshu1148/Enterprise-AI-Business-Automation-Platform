"use client";

import {
  BrainCircuit,
  Mic,
  Users,
  Database,
} from "lucide-react";

import { BOOKING_LINK } from "../constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#030712] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16">

        {/* Top Bar */}
        <div className="mb-12 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
              <BrainCircuit className="h-8 w-8 text-blue-500" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              AI Automation Lab
            </h2>

          </div>

          <div className="hidden md:flex items-center gap-3 rounded-full border border-blue-500/30 bg-[#111827] px-5 py-3">

            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>

            <span className="text-sm text-slate-300">
              AI Systems Working 24/7
            </span>

          </div>

        </div>

        {/* Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* LEFT */}
          <div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Less Manual
              <br />
              Work.
              <br />
              More{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Business Growth.
              </span>
            </h1>

            <div className="mt-6 h-1 w-16 rounded-full bg-blue-500"></div>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
              Custom AI systems that automate your business,
              save hours every week, and work 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <a
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105"
              >
                Book Free Strategy Call →
              </a>

              <a
                href="#how-we-help"
                className="inline-flex items-center justify-center rounded-full border border-blue-500/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-blue-500 hover:bg-white/5"
              >
                Learn More
              </a>

            </div>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-3 gap-4">

  {/* AI Voice */}
  <div className="rounded-2xl border border-blue-500/20 bg-[#111827] p-4 transition-all duration-300 hover:border-blue-500">

    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
      <Mic className="h-6 w-6 text-blue-400" />
    </div>

    <h3 className="text-base font-semibold">
      AI Voice
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-400">
      Answer calls automatically.
    </p>

  </div>

  {/* Lead Automation */}
  <div className="rounded-2xl border border-blue-500/20 bg-[#111827] p-4 transition-all duration-300 hover:border-blue-500">

    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
      <Users className="h-6 w-6 text-blue-400" />
    </div>

    <h3 className="text-base font-semibold">
      Lead Automation
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-400">
      Capture and qualify customers automatically.
    </p>

  </div>

  {/* CRM */}
  <div className="rounded-2xl border border-blue-500/20 bg-[#111827] p-4 transition-all duration-300 hover:border-blue-500">

    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
      <Database className="h-6 w-6 text-blue-400" />
    </div>

    <h3 className="text-base font-semibold">
      CRM Integration
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-400">
      Keep every lead and customer in one place.
    </p>

  </div>

</div>

{/* Trust Section */}
<div className="mt-10 flex items-center gap-4">

  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-[#111827] text-2xl">
    🛡️
  </div>

  <div>

    <h3 className="text-2xl font-semibold">
      Trusted Automation Partner
    </h3>

    <p className="mt-1 text-blue-400">
      for Growing Businesses
    </p>

  </div>

</div>

</div>

{/* RIGHT */}
<div>

  <div className="rounded-[28px] border border-blue-500/20 bg-[#111827] p-6 shadow-[0_0_60px_rgba(37,99,235,.15)]">

    <div className="mb-6 flex items-center justify-between">

      <h2 className="text-3xl font-bold">
        AI Dashboard
      </h2>

      <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
        ● Live
      </span>

    </div>

    {/* Leads */}
    <div className="mb-4 rounded-2xl border border-blue-500/20 bg-[#0B1220] p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-400">
            Leads Captured
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            +420
          </h3>
        </div>

        <div className="rounded-xl bg-blue-500/10 px-3 py-2 text-blue-400">
          +24%
        </div>

      </div>

    </div>

    {/* Sales */}
    <div className="mb-4 rounded-2xl border border-blue-500/20 bg-[#0B1220] p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-400">
            Sales Increased
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            +35%
          </h3>
        </div>

        <div className="rounded-xl bg-green-500/10 px-3 py-2 text-green-400">
          +18%
        </div>

      </div>

    </div>

    {/* Meetings */}
    <div className="rounded-2xl border border-blue-500/20 bg-[#0B1220] p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-400">
            Meetings Booked
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            +18
          </h3>
        </div>

        <div className="rounded-xl bg-purple-500/10 px-3 py-2 text-purple-400">
          +12%
        </div>

      </div>

    </div>

  </div>

</div>

</div>

</div>

</section>
);
}