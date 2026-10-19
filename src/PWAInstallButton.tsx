import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" /> App Installed
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-amber-400/60 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <img src="/icon.svg" alt="Steppin Logo" className="w-12 h-12 rounded-xl border border-amber-400/50" />
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Download & Install Steppin App
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  You destination · Created by 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿 · Downloadable for Everyone
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Android Phone:
                </p>
                <p className="text-slate-300">1. Tap <strong>⋮ (3 dots)</strong> in Chrome.</p>
                <p className="text-slate-300">2. Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                <p className="text-slate-300">3. Tap <strong>Install</strong> to get the Steppin app icon.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-amber-300 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> iPhone / iPad:
                </p>
                <p className="text-slate-300">1. Open Safari and tap the <strong>Share</strong> button (bottom).</p>
                <p className="text-slate-300">2. Scroll & tap <strong>Add to Home Screen</strong>.</p>
                <p className="text-slate-300">3. Tap <strong>Add</strong> — works offline anytime!</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-sky-400 flex items-center gap-1">
                  💻 PC & Laptop:
                </p>
                <p className="text-slate-300">1. Look at the URL address bar in Chrome or Edge.</p>
                <p className="text-slate-300">2. Click the <strong>Install Steppin (icon with arrow)</strong>.</p>
                <p className="text-slate-300">3. Launch from your desktop or start menu.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Official Web Portal: <strong className="text-amber-300">www.steppin.com</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      Offline Mode — Using cached Steppin study data
    </div>
  );
};
