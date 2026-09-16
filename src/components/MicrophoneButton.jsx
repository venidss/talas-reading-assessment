/**
 * Clean, direct microphone button for starting reading assessment.
 * 100% genuine microphone recognition — no simulation/demo mode.
 */
export default function MicrophoneButton({
  isListening,
  isSupported,
  readingStarted,
  onStart,
  onStop,
}) {
  // Before reading starts
  if (!readingStarted) {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto animate-fade-in-up">
        {isSupported ? (
          <button
            type="button"
            onClick={onStart}
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-8 rounded-2xl
                       bg-gradient-to-r from-talas-500 to-talas-600
                       text-white font-bold text-lg
                       shadow-lg shadow-talas-500/25
                       hover:shadow-xl hover:shadow-talas-500/35
                       hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200"
          >
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Magsimulang Magbasa
          </button>
        ) : (
          <div className="w-full text-center p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
            Ang speech recognition ay nangangailangan ng mikropono sa Google Chrome o Edge browser.
          </div>
        )}
      </div>
    );
  }

  // During reading
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto px-6 py-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <button
            type="button"
            onClick={isListening ? onStop : onStart}
            className={`
              relative z-10 flex items-center justify-center w-12 h-12 rounded-full
              transition-all duration-300
              ${isListening
                ? 'bg-talas-500 text-white shadow-lg shadow-talas-500/30 hover:bg-talas-600'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }
            `}
            title={isListening ? 'Itigil ang pakikinig' : 'Simulang makinig'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Pulsing ring while listening */}
          {isListening && (
            <div className="absolute inset-0 text-talas-400">
              <span className="mic-ring" />
              <span className="mic-ring" />
              <span className="mic-ring" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className={`text-sm font-bold ${isListening ? 'text-talas-700' : 'text-gray-400'}`}>
            {isListening ? 'Nakikinig ang mikropono...' : 'Naka-off ang mikropono'}
          </span>
          <span className="text-xs text-gray-500">
            Basahin ang kwento nang may tamang hinto sa mga bantas.
          </span>
        </div>
      </div>
    </div>
  );
}
