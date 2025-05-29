
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
              alt="Scratch & Script Logo" 
              className="h-8 mr-3"
            />
            { /* <span className="text-lg font-bold">Scratch & Script</span> */ }
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-300">
              © {new Date().getFullYear()} Scratch & Script. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
