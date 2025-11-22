export function SuccessPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/gifs/officeDesk.gif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Credits container */}
      <div className="relative z-10 flex items-end justify-center min-h-screen py-20 ">
        <div className="credits-scroll text-center space-y-8 px-8 max-w-2xl">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-wider font-pixel">
              COMPLIANCE ACHIEVED
            </h1>
            <p className="text-2xl text-gray-300 uppercase tracking-[0.3em]">
              ChronoLog Directive
            </p>
          </div>

          <div className="space-y-6 pt-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white tracking-wide font-pixel">
                TIME LOGGED
              </h2>
              <p className="text-xl text-gray-300">
                Your 7.5 hours have been recorded
              </p>
            </div>

            <div className="space-y-2 pt-8">
              <h2 className="text-2xl font-semibold text-white tracking-wide font-pixel">
                CREATED BY
              </h2>
              <p className="text-xl text-gray-300">
                The ChronoLog Development Team
              </p>
            </div>

            <div className="space-y-2 pt-8">
              <h2 className="text-2xl font-semibold text-white tracking-wide font-pixel">
                SPECIAL THANKS
              </h2>
              <p className="text-xl text-gray-300">
                Victor - Compliance Officer
              </p>
              <p className="text-xl text-gray-300">
                Section 12.4 of the Time Compliance Policy
              </p>
            </div>

            <div className="space-y-2 pt-8">
              <p className="text-lg text-gray-400 italic">
                Thank you for your punctual cooperation
              </p>
              <p className="text-lg text-gray-400">
                You are now authorized to temporarily detach from your workstation
              </p>
              <p className="text-lg text-gray-400">
                Enjoy your limited personal time responsibly
              </p>
            </div>

            <div className="pt-12 pb-20">
              <p className="text-base text-gray-500">
                You will be reminded to repeat this ceremony tomorrow.
              </p>
            </div>

            <div className="pt-8 text-sm text-gray-600 space-y-1">
              <p>© 2024 ChronoLog Systems</p>
              <p>All rights reserved. All times monitored.</p>
            </div>
          </div>

          {/* Add some space at the end */}
          <div className="h-96" />
        </div>
      </div>

      <style>{`
        @keyframes scroll-up {
          from {
            transform: translateY(100vh);
          }
          to {
            transform: translateY(-100%);
          }
        }

        .credits-scroll {
          animation: scroll-up 30s linear forwards;
        }

        /* Hide scrollbar */
        body {
          overflow: hidden;
        }

        /* For webkit browsers (Chrome, Safari) */
        ::-webkit-scrollbar {
          display: none;
        }

        /* For Firefox */
        * {
          scrollbar-width: none;
        }

        /* For IE and Edge */
        * {
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}
