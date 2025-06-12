
import React from 'react';
import { Heart, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-background to-muted/30 border-t border-border/50 mt-auto">
      <div className="container-enhanced py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
                alt="Scratch & Script Logo" 
                className="h-10 logo-animation"
              />
              <div>
                <h3 className="font-bold text-lg gradient-text">Scratch & Script</h3>
                <p className="text-xs text-muted-foreground">Professional Certificates</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-md">
              Empowering professionals with beautiful, secure, and reliable certificate management solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center space-y-3">
            <h4 className="font-semibold text-foreground mb-2">Quick Links</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                Website
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                Support
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" />
              <span>for professionals</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Scratch & Script. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
