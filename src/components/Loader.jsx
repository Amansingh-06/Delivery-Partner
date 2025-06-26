import React from 'react';

const Loader = ({text = "Loading"}) => {
  return (
    <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 overflow-hidden z-60">
      <style>{`
        @keyframes cupFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes handleShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }

        @keyframes waterLevel {
          0%, 100% { height: 65%; }
          50% { height: 70%; }
        }

        @keyframes bubbleRise {
          0% {
            bottom: 5px;
            opacity: 0;
            transform: translateX(0) scale(0.5);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            bottom: 60px;
            opacity: 0;
            transform: translateX(20px) scale(1.2);
          }
        }

          @keyframes steamRise {
          0% {
            opacity: 0;
            transform: translateY(0) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes textFade {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes dotFlicker {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .cup-float {
          animation: cupFloat 3s ease-in-out infinite;
        }

        .handle-shake {
          animation: handleShake 2s ease-in-out infinite;
        }

        .water-level {
          animation: waterLevel 4s ease-in-out infinite;
        }

        .bubble {
          animation: bubbleRise 1.5s infinite ease-out;
        }

        .bubble-1 {
          animation-delay: 0s;
          animation-duration: 1.2s;
        }

        .bubble-2 {
          animation-delay: 0.3s;
          animation-duration: 1.5s;
        }

        .bubble-3 {
          animation-delay: 0.6s;
          animation-duration: 1.1s;
        }

        .bubble-4 {
          animation-delay: 0.9s;
          animation-duration: 1.4s;
        }

        .bubble-5 {
          animation-delay: 1.2s;
          animation-duration: 1.3s;
        }

        .steam-line {
          animation: steamRise 2s infinite ease-out;
        }

        .steam-1 { animation-delay: 0s; }
        .steam-2 { animation-delay: 0.3s; }
        .steam-3 { animation-delay: 0.6s; }
        .steam-4 { animation-delay: 0.9s; }
        .steam-5 { animation-delay: 1.2s; }
        .steam-6 { animation-delay: 1.5s; }

        .text-fade {
          animation: textFade 2s ease-in-out infinite;
        }

        .dot-flicker {
          animation: dotFlicker 1.5s infinite ease-in-out;
        }

        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.2s; }
        .dot-3 { animation-delay: 0.4s; }

        .cup-gradient {
          background: linear-gradient(145deg, #ff8c42, #ff7629);
          box-shadow: 
            0 8px 20px rgba(255, 118, 41, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .cup-rim {
          background: linear-gradient(145deg, #ff9c52, #ff8c42);
          box-shadow: 
            0 -2px 8px rgba(255, 118, 41, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.4);
        }

       .water-gradient {
          background: linear-gradient(180deg, 
            rgba(255, 213, 179, 0.4) 0%, 
            rgba(255, 178, 102, 0.95) 100%);
        }

        .steam-gradient {
          background: linear-gradient(to top, 
            rgba(255, 255, 255, 1), 
            rgba(255, 255, 255, 0));
        }
      `}</style>
      
      <div className="text-center relative">
        {/* Cup Container */}
        <div className="relative w-24 h-24 sm:w-30 sm:h-30 mx-auto -mb-14 sm:-mb-8">
          {/* Steam */}
          <div className="absolute -top-6 sm:-top-10 left-1/2 transform -translate-x-1/2 w-12 sm:w-15 h-8 sm:h-10">
            <div className="steam-line steam-1 absolute left-3 sm:left-5 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
            <div className="steam-line steam-2 absolute left-4 sm:left-7 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
            <div className="steam-line steam-3 absolute left-5 sm:left-9 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
            <div className="steam-line steam-4 absolute left-1 sm:left-2 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
            <div className="steam-line steam-5 absolute left-6 sm:left-12 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
            <div className="steam-line steam-6 absolute left-7 sm:left-14 w-0.5 sm:w-1 h-6 sm:h-8 steam-gradient rounded-full"></div>
          </div>

          {/* Cup */}
          <div className="cup-float relative w-10 h-8 sm:w-20 sm:h-16 cup-gradient mx-auto rounded-b-full" 
               >
            
            {/* Cup Rim */}
            <div className="absolute -top-1 sm:-top-2 -left-1 -right-1 h-1 sm:h-3 cup-rim" 
                 style={{ borderRadius: '50px' }}></div>
            
            {/* Cup Handle */}
            <div className="handle-shake absolute -right-2 sm:-right-3.5 top-1 sm:top-1.5 w-3 rotate-12 sm:rotate-6 sm:w-5 h-6 sm:h-10 border-4 sm:border-7 border-orange-400 rounded-r-2xl"
                 style={{ borderLeft: 'none' }}></div>
            
            {/* Water */}
            <div className="water-level absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 h-12 sm:h-15 water-gradient overflow-hidden rounded-b-full"
                 >
              
              {/* Bubbles */}
              <div className="bubble bubble-1 absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white bg-opacity-70 rounded-full"
                   style={{ left: '20%' }}></div>
              <div className="bubble bubble-2 absolute w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white bg-opacity-70 rounded-full"
                   style={{ left: '50%' }}></div>
              <div className="bubble bubble-3 absolute w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white bg-opacity-70 rounded-full"
                   style={{ left: '70%' }}></div>
              <div className="bubble bubble-4 absolute w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white bg-opacity-70 rounded-full"
                   style={{ left: '35%' }}></div>
              <div className="bubble bubble-5 absolute w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white bg-opacity-70 rounded-full"
                   style={{ left: '80%' }}></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-fade text-orange-600 text-xs sm:text-base font-light opacity-70 mb-3 sm:mb-4 tracking-wide -mt-4">
          {text}
        </div>

        {/* Flickering Dots */}
        <div className="flex justify-center gap-1.5 sm:gap-2">
          <div className="dot-flicker dot-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
          <div className="dot-flicker dot-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
          <div className="dot-flicker dot-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;