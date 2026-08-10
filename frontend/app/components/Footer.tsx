import { BOOKING_LINK } from "../constants";
  export default function Footer() {
    return (
    <footer className="bg-[#030712] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid gap-12 md:grid-cols-3">

          {/* Company */}
          <div>
            <h2 className="text-3xl font-bold text-orange-500">
              AI Automation Lab
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              We help businesses automate repetitive work with custom AI
              solutions that save time, improve efficiency, and drive growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-gray-400">

              <li>
                <a href="#" className="hover:text-orange-500 transition">
                  Home
                </a>
              </li>

              <li>
                <a href="#how-we-help" className="hover:text-orange-500 transition">
                  How We Help
                </a>
              </li>

              <li>
                <a href="#faq" className="hover:text-orange-500 transition">
                  FAQ
                </a>
              </li>

            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold">
              Contact
            </h3>

            <p className="mt-5 text-gray-400">
              📧 priyanshu.automation.lab@gmail.com
            </p>

            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center mt-8 rounded-full bg-orange-500 px-7 py-3 font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105"
            >
              Book Free Strategy Call →
            </a>

          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-gray-500">
          © 2026 AI Automation Lab. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}