import { BOOKING_LINK } from "../constants";
  export default function FAQ() {
    const faqs = [
      {
      question: "What types of businesses do you work with?",
      answer:
        "We primarily help service-based businesses like solar companies, marketing agencies, and other growing businesses automate their operations with AI.",
    },
    {
      question: "How does the automation process work?",
      answer:
        "We first understand your business workflow, identify repetitive tasks, and then build a custom AI automation system tailored to your needs.",
    },
    {
      question: "How long does it take to build an automation?",
      answer:
        "Most automation projects are completed within 2–4 weeks, depending on the complexity and business requirements.",
    },
    {
      question: "Do you provide support after deployment?",
      answer:
        "Yes. We provide ongoing support, optimization, and updates to ensure your AI automation continues running smoothly.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply book a free strategy call. We'll discuss your business, identify automation opportunities, and recommend the best solution.",
    },
  ];

  return (
    <section className="bg-gray-950 py-24 text-white">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center">
          <span className="text-orange-500 uppercase tracking-widest font-semibold">
            FAQ
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Frequently Asked Questions
          </h2>

          <p className="mt-6 text-lg text-gray-400">
            Everything you need to know before starting your AI automation journey.
          </p>
        </div>

        <div className="mt-16 space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-orange-500"
            >
              <h3 className="text-xl font-semibold text-white">
                {faq.question}
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105"
          >
            Book Free Strategy Call →
          </a>
        </div>

      </div>
    </section>
  );
}