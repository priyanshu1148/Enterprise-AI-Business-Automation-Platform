import { BOOKING_LINK } from "../constants";
  export default function HowWeHelp() {
    return (
    <section id="how-we-help" className="py-24 bg-[#0B0B0B]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-orange-500 font-semibold tracking-wider uppercase">
            How We Help
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            How We Help Businesses Grow
          </h2>

          <p className="text-gray-400 mt-6 text-lg">
            We solve common business challenges with custom AI automation
            that saves time, improves efficiency, and helps businesses scale.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-orange-500 transition-all duration-300">
            <div className="text-5xl mb-6">📞</div>

            <h3 className="text-2xl font-semibold text-white">
              Losing Valuable Leads?
            </h3>

            <p className="text-gray-400 mt-4 leading-7">
              Capture every lead instantly and never miss another business
              opportunity.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-orange-500 transition-all duration-300">
            <div className="text-5xl mb-6">⚙️</div>

            <h3 className="text-2xl font-semibold text-white">
              Too Much Manual Work?
            </h3>

            <p className="text-gray-400 mt-4 leading-7">
              Automate repetitive tasks so your team can focus on growth instead
              of routine work.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-orange-500 transition-all duration-300">
            <div className="text-5xl mb-6">⚡</div>

            <h3 className="text-2xl font-semibold text-white">
              Slow Customer Response?
            </h3>

            <p className="text-gray-400 mt-4 leading-7">
              Respond faster with AI-powered systems that work 24/7 across your
              business.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">

          <a
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105"
          >
            Book Free Strategy Call → 
          </a>

          <p className="mt-5 text-gray-500">
            Discover how AI automation can save time and grow your business.
          </p>

        </div>

      </div>
    </section>
  );
}