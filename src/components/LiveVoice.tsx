import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MCQQuestion, EXPANDED_QUESTION_BANK } from '../data/questionBank';

interface LiveVoiceProps {
  currentUserName: string;
  userAgPoints: number;
  onAnswerQuestion?: (isCorrect: boolean) => void;
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ currentUserName, userAgPoints, onAnswerQuestion }) => {
  const [inRoom, setInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubject, setActiveSubject] = useState<'Science' | 'Math' | 'English' | 'GK'>('Science');
  const [aiVoicePlaying, setAiVoicePlaying] = useState(false);
  const [currentAiQuestion, setCurrentAiQuestion] = useState<MCQQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(14);
  const [speakingUser, setSpeakingUser] = useState<string>('Niraj Yadav (Director)');

  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Rotate speaking mock indicator every 6 seconds to simulate active audio room
  useEffect(() => {
    if (!inRoom) return;
    const speakers = [
      'Niraj Yadav (Director)',
      'Aayush Sharma (St. Xavier Aspirant)',
      'Pooja Thapa (Budhanilkantha Aspirant)',
      currentUserName || 'You',
    ];
    const interval = window.setInterval(() => {
      const idx = Math.floor(Math.random() * speakers.length);
      setSpeakingUser(speakers[idx]);
    }, 5000);
    return () => clearInterval(interval);
  }, [inRoom, currentUserName]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleJoinLeave = () => {
    if (inRoom) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setInRoom(false);
      setAiVoicePlaying(false);
      setCurrentAiQuestion(null);
    } else {
      setInRoom(true);
      setParticipantsCount((prev) => prev + 1);
    }
  };

  const handleNextAiQuestion = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setRevealed(false);
    setSelectedOption(null);

    const matched = EXPANDED_QUESTION_BANK.filter((q) =>
      q.subject.toLowerCase().includes(activeSubject.toLowerCase())
    );
    const questions = matched.length > 0 ? matched : EXPANDED_QUESTION_BANK;
    if (questions.length === 0) return;
    const randQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrentAiQuestion(randQ);

    // Speak question aloud
    if ('speechSynthesis' in window) {
      const speechText = `Question: ${randQ.question}. Option A: ${randQ.options[0]}. Option B: ${randQ.options[1]}. Option C: ${randQ.options[2]}. Option D: ${randQ.options[3]}. What is your answer?`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onstart = () => setAiVoicePlaying(true);
      utterance.onend = () => setAiVoicePlaying(false);
      utterance.onerror = () => setAiVoicePlaying(false);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (revealed || !currentAiQuestion) return;
    setSelectedOption(idx);
    setRevealed(true);
    const isCorrect = idx === currentAiQuestion.correctIndex;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const feedbackText = isCorrect
        ? `Correct! Well done ${currentUserName}! The explanation is: ${currentAiQuestion.explanation}`
        : `Incorrect. The correct answer is option ${String.fromCharCode(65 + currentAiQuestion.correctIndex)}. ${currentAiQuestion.explanation}`;
      const utterance = new SpeechSynthesisUtterance(feedbackText);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    if (onAnswerQuestion) {
      onAnswerQuestion(isCorrect);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border-2 border-amber-400/40 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              <span>Live Audio Hub · Steppin Real-Time Voice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Live Voice & Audio Study Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Collaborate live with fellow Class 10 CDC Nepal entrance toppers or activate the AI Voice Tutor to
              speak entrance questions aloud with automatic feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={handleJoinLeave}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition shadow-xl cursor-pointer ${
              inRoom
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950'
            }`}
          >
            {inRoom ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Leave Audio Room</span>
              </>
            ) : (
              <>
                <Headphones className="w-4 h-4" />
                <span>Join Live Audio Room</span>
              </>
            )}
          </button>
        </div>

        {/* Room Status Indicator */}
        {inRoom && (
          <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                Connected to Channel: <strong>Class 10 CDC Entrance Nepal Audio Hub</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-amber-400" /> {participantsCount} Students Active
              </span>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isMuted
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                }`}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isMuted ? 'Muted' : 'Mic Active'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Active Speaker & AI Voice Tutor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1-col: Active Audio Floor */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Active Audio Floor</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
              LIVE
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-amber-500 mx-auto flex items-center justify-center shadow-lg ring-4 ring-amber-400/30">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Currently Speaking:</p>
              <h4 className="text-sm font-bold text-amber-300 font-display mt-0.5">{speakingUser}</h4>
            </div>

            {/* Speaking wave simulation */}
            <div className="flex items-center justify-center gap-1 py-2">
              {[20, 60, 40, 80, 50, 100, 70, 30, 90, 45, 65, 35].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${inRoom ? h : 8}%`,
                    animationDelay: `${(i % 4) * 0.15}s`,
                    minHeight: '6px',
                    maxHeight: '28px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Online Voice Peered:</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-200 font-medium">👑 Niraj Yadav (Director)</span>
                <span className="text-[10px] text-amber-400 font-mono">Host</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-200 font-medium">🎯 {currentUserName || 'You (Student)'}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{userAgPoints} AG</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-200 font-medium">🌟 Aayush Sharma (Chitwan)</span>
                <span className="text-[10px] text-slate-400 font-mono">Listening</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-200 font-medium">🌟 Pooja Thapa (Kathmandu)</span>
                <span className="text-[10px] text-slate-400 font-mono">Listening</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2-col: AI Voice Tutor Rapid Fire */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>AI Voice Entrance Tutor</span>
              </h3>
              <p className="text-xs text-slate-400">
                Listen to entrance questions spoken aloud and practice rapid-fire recall
              </p>
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['Science', 'Math', 'English', 'GK'] as const).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setActiveSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeSubject === sub
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* AI Voice Question Card */}
          {currentAiQuestion ? (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-400/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  {currentAiQuestion.subject} · {currentAiQuestion.chapter}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  {aiVoicePlaying ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Speaking now...
                    </span>
                  ) : (
                    <span>Ready for your answer</span>
                  )}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-semibold text-slate-100 font-sans leading-relaxed">
                {currentAiQuestion.question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currentAiQuestion.options.map((opt, idx) => {
                  const isCorrect = idx === currentAiQuestion.correctIndex;
                  const isSelected = selectedOption === idx;

                  let btnStyle = 'bg-slate-900 border-slate-800 hover:border-amber-400/40 text-slate-200';
                  if (revealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={revealed}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-3 ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300">Explanation:</p>
                  <p>{currentAiQuestion.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-3">
              <Headphones className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Ready for AI Audio Rapid Fire
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click below to have the AI Voice Tutor speak a high-yield {activeSubject} entrance question.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleNextAiQuestion}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>{currentAiQuestion ? 'Next Spoken Question' : 'Start AI Voice Tutor'}</span>
            </button>

            {currentAiQuestion && (
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setAiVoicePlaying(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" /> Stop Voice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
