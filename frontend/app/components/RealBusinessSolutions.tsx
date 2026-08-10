import { BOOKING_LINK } from "../constants";
  export default function RealBusinessSolutions() {
    return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-orange-500 uppercase tracking-widest font-semibold">
            Solutions
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Real Business Solutions
          </h2>

          <p className="text-gray-400 mt-6 text-lg">
            AI automation designed to solve real business challenges and help
            your team work smarter.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">

          {/* Card 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500">
            <div className="text-5xl mb-6">📞</div>

            <h3 className="text-2xl font-semibold text-white">
              AI Voice Receptionist
            </h3>

            <p className="text-gray-400 mt-4">
              Never miss customer calls with a 24/7 AI receptionist that answers,
              qualifies, and books appointments.
            </p>

            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 text-orange-500 font-semibold hover:text-orange-400"
            >
              Book Free Strategy Call →
            </a>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500">
            <div className="text-5xl mb-6">📈</div>

            <h3 className="text-2xl font-semibold text-white">
              Lead Capture Automation
            </h3>

            <p className="text-gray-400 mt-4">
              Capture, organize, and follow up with every lead automatically.
            </p>

            <a
              href="https://YOUR_BOOKING_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 text-orange-500 font-semibold hover:text-orange-400"
            >
              Book Free Strategy Call →
            </a>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500">
            <div className="text-5xl mb-6">⚡</div>

            <h3 className="text-2xl font-semibold text-white">
              Workflow Automation
            </h3>

            <p className="text-gray-400 mt-4">
              Automate repetitive processes so your team can focus on growth.
            </p>

            <a
              href="https://YOUR_BOOKING_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 text-orange-500 font-semibold hover:text-orange-400"
            >
              Book Free Strategy Call →
            </a>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">

          <a
            href="https://YOUR_BOOKING_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105"
          >
            Book Free Strategy Call →
          </a>

          <p className="mt-5 text-gray-500">
            Let's build AI automation that saves time and grows your business.
          </p>

        </div>

      </div>
    </section>
  );
}