"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-500">
          AI Automation Lab
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden items-center gap-8 text-gray-300 md:flex">
          <li>
            <a href="#" className="hover:text-blue-400 transition">
              Home
            </a>
          </li>
          <li>
            <a href="#services" className="hover:text-blue-400 transition">
              Services
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-blue-400 transition">
              About
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-blue-400 transition">
              Contact
            </a>
          </li>
        </ul>

        {/* Desktop Button */}
        <button className="hidden rounded-lg bg-blue-600 px-5 py-2 font-semibold transition hover:bg-blue-700 md:block">
          Get Started
        </button>

        {/* Mobile Menu Button */}
        <button
          className="text-3xl text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-gray-800 bg-black md:hidden">
          <ul className="flex flex-col gap-4 p-6 text-gray-300">
            <li>
              <a href="#" onClick={() => setIsOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="#services" onClick={() => setIsOpen(false)}>
                Services
              </a>
            </li>
            <li>
              <a href="#about" onClick={() => setIsOpen(false)}>
                About
              </a>
            </li>
            <li>
              <a href="#contact" onClick={() => setIsOpen(false)}>
                Contact
              </a>
            </li>

            <button className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold transition hover:bg-blue-700">
              Get Started
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
}