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
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-amber-400/60 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <img src="/icon.svg" alt="UDAN Logo" className="w-12 h-12 rounded-xl border border-amber-400/50" />
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Download & Install UDAN App
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Created by 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿 · Works on Android, iPhone & PC
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-xs sm:text-sm text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Install on iPhone / iPad (Safari):
                </p>
                <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> — the UDAN App icon will appear on your phone!</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Install on Android / Chrome:
                </p>
                <p>1. Tap the <strong>⋮ (3 dots menu)</strong> in the top-right corner of Chrome.</p>
                <p>2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                <p>3. Confirm <strong>Install</strong> — the UDAN App with custom logo will be installed on your phone!</p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
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
      Offline Mode — Using cached UDAN study data
    </div>
  );
};
