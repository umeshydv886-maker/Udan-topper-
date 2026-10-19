import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2, Volume2, VolumeX, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBase64: string, durationSec: number) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAudioReady, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onAudioReady(base64String, recordingTime);
        };

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            // max 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setPermissionError('Microphone permission denied. Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current && audioUrl) {
      const player = new Audio(audioUrl);
      audioPlayerRef.current = player;
      player.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-amber-400/30 p-4 text-left shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
          <h4 className="text-sm font-bold text-slate-100 font-display">
            {isRecording ? 'Recording Voice Doubt...' : audioUrl ? 'Voice Note Ready' : 'Record Voice Note'}
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-amber-400">{formatSec(recordingTime)} / 2:00</span>
      </div>

      {permissionError && (
        <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl p-2.5 mb-3">
          {permissionError}
        </p>
      )}

      {/* Visualizer animation while recording */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1.5 py-4 bg-slate-950 rounded-xl border border-slate-800 mb-3">
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 65].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-amber-400 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${(i % 5) * 0.15}s`,
                minHeight: '8px',
                maxHeight: '36px',
              }}
            />
          ))}
        </div>
      )}

      {/* Audio controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
          >
            <Mic className="w-4 h-4" /> Start Speaking
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md animate-pulse"
          >
            <Square className="w-4 h-4" /> Stop & Attach Audio
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause Audio' : 'Listen Recording'}
            </button>
            <button
              type="button"
              onClick={resetRecording}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer transition"
              title="Record again"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Attached
            </span>
          </div>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// Text-to-Speech audio reader button for questions & solutions
export const AudioSpeakerBtn: React.FC<{ text: string; label?: string }> = ({ text, label = 'Listen' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
        isSpeaking
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/20'
      }`}
      title="Listen to this text aloud"
    >
      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isSpeaking ? 'Stop' : label}</span>
    </button>
  );
};
