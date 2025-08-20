
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Chrome, Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-black">
              Grants Snap
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-black transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-black transition-colors font-medium">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-black transition-colors font-medium">
              Pricing
            </a>
            <a href="#faq" className="text-gray-700 hover:text-black transition-colors font-medium">
              FAQ
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 font-semibold">
              <Chrome className="mr-2 h-4 w-4" />
              Add to Chrome
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-black transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#features" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium"
                onClick={toggleMenu}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium"
                onClick={toggleMenu}
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium"
                onClick={toggleMenu}
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium"
                onClick={toggleMenu}
              >
                FAQ
              </a>
              <div className="px-3 py-2">
                <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold">
                  <Chrome className="mr-2 h-4 w-4" />
                  Add to Chrome
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
