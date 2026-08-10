import { BOOKING_LINK } from "../constants";
  export default function FinalCTA() {
    return ( 
    <section className="py-24 bg-[#0B0B0B]">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <span className="text-orange-500 font-semibold uppercase tracking-[0.2em]">
          Ready to Get Started?
        </span>

        <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Ready to Transform
          <br />
          Your Business with AI?
        </h2>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400 leading-8">
          Discover how custom AI automation can help your business save time,
          reduce manual work, and grow faster.
        </p>

        <a
          href={BOOKING_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center mt-10 rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105"
        >
          Book Free Strategy Call →
        </a>

        <p className="mt-6 text-sm text-gray-500">
          30-minute strategy call • No obligation • Personalized AI roadmap
        </p>

      </div>
    </section>
  );
}