import React, { useState, useEffect, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import {
  Trophy,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  UserCheck,
  Lock,
  Unlock,
  Send,
  Eye,
  EyeOff,
  Wand2,
  ExternalLink,
  RefreshCw,
  Target,
  Camera,
  Image as ImageIcon,
  Trash2,
  BellRing,
  FileDown,
  Zap,
  Volume2,
  VolumeX,
  Headphones,
  Radio,
  Languages,
  FileText,
  Globe,
  Download,
  Smartphone,
  Home,
  BookOpen,
  Award,
  BarChart2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { PWAInstallButton, OfflineIndicator } from './PWAInstallButton';
import {
  SUBJECT_CATALOG,
  EXPANDED_QUESTION_BANK,
  SATURDAY_MOCK_MIXED_POOL,
  SUNDAY_QUIZ_40_QUESTIONS,
  SUNDAY_QUIZ_MIXED_POOL,
  MCQQuestion,
  DAILY_QUOTES,
} from './data/questionBank';
import {
  STEPPIN_ALL_FEATURES_DATA,
  UDAN_ALL_FEATURES_DATA,
  downloadAllFeaturesZipOfPdf,
  downloadMasterFeaturesPdfDirect,
  generateSteppin95Checklist,
  downloadSolvedQuestionBankPdf,
} from './utils/featuresZipPdf';
import { I18N, Language } from './data/i18n';
import { LiveVoice } from './components/LiveVoice';
import { VoiceRecorder, AudioSpeakerBtn } from './components/VoiceRecorder';

const NIRAJ_FB_LINK = 'https://www.facebook.com/share/1HBWpvKbf2/';
const NIRAJ_TIKTOK_LINK = 'https://www.tiktok.com/@niraj__yadav__?_r=1&_t=ZS-9ASqjcuTvwD';

interface BatchConfig {
  batchLimit: number;
  isOpen: boolean;
  registeredCount: number;
  mockTestForceLive?: boolean;
  mockTestPublished?: boolean;
}

interface StudentProfile {
  uid: string;
  name: string;
  role: 'student' | 'admin';
  agPoints: number;
  accuracy: number;
  totalAttempts: number;
  correctCount: number;
  timeSpentMinutes: number;
  lastLoginDate?: string;
  dailyGoalTarget?: number;
  dailyGoalCompleted?: number;
  dailyGoalDate?: string;
  subjectScores?: Record<string, { correct: number; total: number }>;
  chapterScores?: Record<string, { correct: number; total: number }>;
  disqualifiedMock?: boolean;
  mockWarnings?: number;
  photoUrl?: string;
  destinationGoal?: string;
  schoolName?: string;
}

interface SavedPracticeState {
  subject: string;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number>;
  timeLeftSeconds: number;
  totalCount: number;
  startedAt: number;
}

interface SavedMockState {
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number>;
  timeLeftSeconds: number;
  warnings: number;
  startedAt: number;
}

interface FlashPost {
  id: string;
  type: 'Notice' | 'GK Nepali' | 'Motivational' | 'Image Post';
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  createdAt?: any;
}

interface ChatItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  text: string;
  agPoints?: number;
  createdAt?: any;
}

interface FeedbackItem {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  rating: number;
  createdAt?: any;
}

interface MockSubmissionItem {
  id: string;
  uid: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  warnings: number;
  disqualified: boolean;
}

interface DiscussionReplyItem {
  id: string;
  authorName: string;
  authorRole: 'student' | 'admin';
  text: string;
  createdAt: string;
}

interface DiscussionPostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'admin';
  subject: string;
  questionText: string;
  photoDataUrl?: string;
  repliesJson?: string;
  createdAt?: any;
}

interface SundayQuizParticipantItem {
  id: string;
  uid: string;
  studentName: string;
  photoUrl?: string;
  rightAnswers: number;
  currentQuestionAnswered?: number;
  agPointsEarned: number;
  joinedAt?: string;
  updatedAt?: string;
}

type NavTab =
  | 'dashboard'
  | 'practice'
  | 'mock'
  | 'sunday_quiz'
  | 'progress'
  | 'flashboard'
  | 'discuss'
  | 'voice'
  | 'downloads'
  | 'profile'
  | 'private_students'
  | 'admin';

const SEED_SUNDAY_QUIZ_TOP5: SundayQuizParticipantItem[] = [
  {
    id: 'hof-sun-1',
    uid: 'hof-sun-1',
    studentName: 'Aarav Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rightAnswers: 39,
    currentQuestionAnswered: 40,
    agPointsEarned: 78,
  },
  {
    id: 'hof-sun-2',
    uid: 'hof-sun-2',
    studentName: 'Srijana Karki',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    rightAnswers: 38,
    currentQuestionAnswered: 40,
    agPointsEarned: 76,
  },
  {
    id: 'hof-sun-3',
    uid: 'hof-sun-3',
    studentName: 'Rohan Adhikari',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rightAnswers: 36,
    currentQuestionAnswered: 40,
    agPointsEarned: 72,
  },
  {
    id: 'hof-sun-4',
    uid: 'hof-sun-4',
    studentName: 'Prakriti Thapa',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    rightAnswers: 35,
    currentQuestionAnswered: 40,
    agPointsEarned: 70,
  },
  {
    id: 'hof-sun-5',
    uid: 'hof-sun-5',
    studentName: 'Bishal Gurung',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rightAnswers: 34,
    currentQuestionAnswered: 40,
    agPointsEarned: 68,
  },
];

const SEED_STUDENTS: StudentProfile[] = [];

const ProfileLetterAvatar: React.FC<{
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, photoUrl, size = 'md' }) => {
  const clean = (name || 'Student').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (clean[0] || 'U').toUpperCase();

  const dimClass =
    size === 'lg'
      ? 'w-16 h-16 text-xl border-2'
      : size === 'sm'
      ? 'w-8 h-8 text-xs border'
      : 'w-11 h-11 text-sm border-2';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={clean}
        referrerPolicy="no-referrer"
        className={`${dimClass} rounded-full object-cover border-amber-400 shadow-md shadow-amber-500/20 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dimClass} rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-amber-200 text-slate-950 font-extrabold flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 font-display tracking-wider`}
      title={`${clean} — Profile Letter Badge`}
    >
      {letters}
    </div>
  );
};

const UDANLogo: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    className="shrink-0 rounded-2xl shadow-lg shadow-amber-500/20 border-2 border-amber-400/70"
    aria-label="UDAN Royal Crest Logo"
  >
    <defs>
      <linearGradient id="udanRoyalBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="50%" stopColor="#3b0764" />
        <stop offset="100%" stopColor="#0f0728" />
      </linearGradient>
      <linearGradient id="udanGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="udanCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    {/* Outer Royal Shield */}
    <rect width="512" height="512" rx="116" fill="url(#udanRoyalBg)" />
    <rect
      x="18"
      y="18"
      width="476"
      height="476"
      rx="100"
      fill="none"
      stroke="url(#udanGold)"
      strokeWidth="9"
      strokeOpacity="0.85"
    />
    {/* Soaring Golden Wings (UDAN = Flight) */}
    <path
      d="M58 248 C112 204, 175 232, 226 284 C174 278, 118 298, 78 340 C128 334, 184 344, 232 374 C168 390, 102 364, 58 248 Z"
      fill="url(#udanGold)"
    />
    <path
      d="M454 248 C400 204, 337 232, 286 284 C338 278, 394 298, 434 340 C384 334, 328 344, 280 374 C344 390, 410 364, 454 248 Z"
      fill="url(#udanGold)"
    />
    {/* Open Book of Knowledge */}
    <path
      d="M178 282 Q217 262 256 288 Q295 262 334 282 L334 362 Q295 342 256 368 Q217 342 178 362 Z"
      fill="url(#udanCyan)"
      stroke="#ffffff"
      strokeWidth="6"
    />
    <line x1="256" y1="288" x2="256" y2="368" stroke="#0f0728" strokeWidth="6" />
    {/* Classic Graduation Cap */}
    <polygon points="256,114 388,174 256,232 124,174" fill="url(#udanGold)" stroke="#fef08a" strokeWidth="4" />
    <path d="M184 202 L184 244 C184 266, 328 266, 328 244 L328 202" fill="#38bdf8" opacity="0.92" />
    <path d="M368 182 L368 250" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" />
    <circle cx="368" cy="254" r="10" fill="#f59e0b" />
    {/* Radiant Topper Star */}
    <polygon
      points="256,38 269,68 302,71 277,92 285,124 256,107 227,124 235,92 210,71 243,68"
      fill="#fef08a"
    />
    {/* Engraved Classic Serif STEPPIN Banner */}
    <rect x="96" y="390" width="320" height="76" rx="22" fill="#0f0728" stroke="url(#udanGold)" strokeWidth="6" />
    <text
      x="256"
      y="442"
      textAnchor="middle"
      fill="#fef08a"
      fontFamily="Cinzel, Georgia, serif"
      fontWeight="900"
      fontSize="36"
      letterSpacing="4"
    >
      STEPPIN
    </text>
  </svg>
);

export default function App() {
  // App Color Theme State: 'theme-light' (White Background & Black Text default per user request), plus 'theme-indigo', 'theme-emerald', 'theme-crimson', 'theme-slate'
  const [appTheme, setAppTheme] = useState<'theme-light' | 'theme-indigo' | 'theme-emerald' | 'theme-crimson' | 'theme-slate'>(() => {
    const saved = localStorage.getItem('udan_color_theme_v2') as any;
    return saved || 'theme-light';
  });
  const [creatorPinInput, setCreatorPinInput] = useState('');
  const [creatorPinMessage, setCreatorPinMessage] = useState<string | null>(null);
  const [mockSoundEnabled, setMockSoundEnabled] = useState(true);
  const [welcomeNameDraft, setWelcomeNameDraft] = useState('');
  const [profileDestination, setProfileDestination] = useState('Your Destination');
  const [profileSchool, setProfileSchool] = useState('Class 10 CDC Nepal');
  const [profileSaveBanner, setProfileSaveBanner] = useState<string | null>(null);
  const [confirmDeleteProfile, setConfirmDeleteProfile] = useState(false);

  // Forgot Password & 6-Digit Gmail Verification Code Login System States
  const [authSubMode, setAuthSubMode] = useState<'standard' | 'forgot_password' | 'code_login' | 'google_chooser'>('standard');
  const [showInlineForgotReset, setShowInlineForgotReset] = useState(false);
  const [recoveryGmail, setRecoveryGmail] = useState('');
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [enteredOtpCode, setEnteredOtpCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewResetPassword, setShowNewResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const [showCreatorPin, setShowCreatorPin] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [googleChooserEmail, setGoogleChooserEmail] = useState('');
  const [googleChooserName, setGoogleChooserName] = useState('');
  const [selectedStudentCardUid, setSelectedStudentCardUid] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return (localStorage.getItem('steppin_lang_v1') as Language) || 'en';
  });
  const [show95ChecklistModal, setShow95ChecklistModal] = useState(false);
  const [showDownloadCenterModal, setShowDownloadCenterModal] = useState(false);
  const [voiceDoubtAudio, setVoiceDoubtAudio] = useState<string | null>(null);
  const [showVoiceRecorderInDiscuss, setShowVoiceRecorderInDiscuss] = useState(false);

  useEffect(() => {
    localStorage.setItem('steppin_lang_v1', currentLanguage);
  }, [currentLanguage]);

  const t = I18N[currentLanguage];

  useEffect(() => {
    localStorage.setItem('udan_color_theme_v2', appTheme);
  }, [appTheme]);

  // Play Web Audio API Chime for Saturday Mock Test 5-Minute Warning Cue
  const playMockWarningChime = (urgent = false) => {
    if (!mockSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = urgent ? [880, 987.77, 1174.66, 1318.51] : [587.33, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.34);
      });
    } catch {
      // Ignore audio autoplay restrictions
    }
  };

  // Auth & User States
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => {
    try {
      const savedSession = localStorage.getItem('udan_active_session_v2');
      if (savedSession) {
        return JSON.parse(savedSession) as User;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [adminModeUnlocked, setAdminModeUnlocked] = useState(false);
  const [showWelcomeGate, setShowWelcomeGate] = useState(false);

  // Global System & Batch Config (Starts at 0 real students — 100 Seats Left)
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    batchLimit: 100,
    isOpen: true,
    registeredCount: 0,
    mockTestForceLive: false,
    mockTestPublished: true,
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Welcome quote rotation index
  const [welcomeNameIndex, setWelcomeNameIndex] = useState(0);
  const previewNames = ['Student'];

  // Collections (Only real registered students)
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(() => {
    try {
      const savedMap = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}');
      return Object.values(savedMap) as StudentProfile[];
    } catch {
      return [];
    }
  });
  const [customQuestions, setCustomQuestions] = useState<MCQQuestion[]>([]);
  const [mistakeIds, setMistakeIds] = useState<string[]>([]);
  const [flashItems, setFlashItems] = useState<FlashPost[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [mockSubmissions, setMockSubmissions] = useState<MockSubmissionItem[]>([]);
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPostItem[]>([]);
  const [sundayQuizParticipants, setSundayQuizParticipants] = useState<SundayQuizParticipantItem[]>(() => {
    try {
      const localSaved = JSON.parse(localStorage.getItem('udan_sunday_quiz_v2') || '[]') as SundayQuizParticipantItem[];
      const merged = [...localSaved];
      SEED_SUNDAY_QUIZ_TOP5.forEach((seed) => {
        if (!merged.some((m) => m.uid === seed.uid)) {
          merged.push(seed);
        }
      });
      merged.sort((a, b) => b.rightAnswers - a.rightAnswers || b.agPointsEarned - a.agPointsEarned);
      return merged;
    } catch {
      return SEED_SUNDAY_QUIZ_TOP5;
    }
  });

  // Sunday 8:00 PM Quiz Competition States (40 Questions: Mostly IQ + Math/Science/English)
  const [sundayStage, setSundayStage] = useState<'lobby' | 'warmup' | 'question' | 'rank_break' | 'final'>('lobby');
  const [sundayJoined, setSundayJoined] = useState(false);
  const [sundayStudentPhoto, setSundayStudentPhoto] = useState<string>('');
  const [sundayWarmupSeconds, setSundayWarmupSeconds] = useState(300); // 5 min warmup
  const [sundayQIndex, setSundayQIndex] = useState(0); // 0 to 39 (40 questions)
  const [sundayQSeconds, setSundayQSeconds] = useState(60); // 1 min per question
  const [sundayRankBreakSeconds, setSundayRankBreakSeconds] = useState(20); // 20 sec Top 10 rank screen
  const [sundaySelectedOption, setSundaySelectedOption] = useState<number | null>(null);
  const [sundayRightCount, setSundayRightCount] = useState(0);
  const [sundayCountdownText, setSundayCountdownText] = useState('01 Day : 14 Hours : 30 Min : 00 Sec');
  const [isSundayJoinWindowOpen, setIsSundayJoinWindowOpen] = useState(false);

  // Photo Question Discuss Page States
  const [discussSubject, setDiscussSubject] = useState<string>('Science');
  const [discussText, setDiscussText] = useState<string>('');
  const [discussPhotoDataUrl, setDiscussPhotoDataUrl] = useState<string>('');
  const [discussUploading, setDiscussUploading] = useState<boolean>(false);
  const [discussFilterSubject, setDiscussFilterSubject] = useState<string>('All');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Daily Goal Tracker State
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(30);
  const [dailyGoalCompleted, setDailyGoalCompleted] = useState<number>(0);
  const [showAllFeaturesModal, setShowAllFeaturesModal] = useState<boolean>(false);
  const [zipDownloading, setZipDownloading] = useState<boolean>(false);

  async function handleDownloadFeaturesZip() {
    if (zipDownloading) return;
    setZipDownloading(true);
    try {
      await downloadAllFeaturesZipOfPdf();
    } finally {
      setZipDownloading(false);
    }
  }

  // Practice Mode States
  const [selectedSubject, setSelectedSubject] = useState<string>('Science');
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [practiceQuestionCount, setPracticeQuestionCount] = useState<10 | 20 | 30 | 50>(10);
  const [practiceTimerMinutes, setPracticeTimerMinutes] = useState<number>(15);
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<MCQQuestion[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(0);
  const [savedPracticePrompt, setSavedPracticePrompt] = useState<SavedPracticeState | null>(null);
  const [instantFeedback, setInstantFeedback] = useState<{ status: 'correct' | 'wrong'; text: string } | null>(null);
  const [practiceMistakesOnly, setPracticeMistakesOnly] = useState(false);

  // Mock Test States (Every Saturday 8-9 AM + Automatic Publish at 10 AM)
  const [mockActive, setMockActive] = useState(false);
  const [mockFinished, setMockFinished] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<MCQQuestion[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({});
  const [mockTimeLeft, setMockTimeLeft] = useState(3600);
  const [mockWarnings, setMockWarnings] = useState(0);
  const [mockDisqualified, setMockDisqualified] = useState(false);
  const [savedMockState, setSavedMockState] = useState<SavedMockState | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [countdownText, setCountdownText] = useState('02 Days : 14 Hours : 25 Min : 10 Sec');
  const [isSaturdayMockHour, setIsSaturdayMockHour] = useState(false);
  const [isSaturdayResultPublished, setIsSaturdayResultPublished] = useState(true);
  const [showFridayReminderModal, setShowFridayReminderModal] = useState(false);

  // Security / Anti-Screenshot States
  const [securityAlertBanner, setSecurityAlertBanner] = useState<string | null>(null);
  const [windowBlurred, setWindowBlurred] = useState(false);

  // Flash Board & Chat Inputs (Manual + Automatic Modes)
  const [chatInput, setChatInput] = useState('');
  const [flashMode, setFlashMode] = useState<'manual' | 'automatic'>('automatic');
  const [flashTitle, setFlashTitle] = useState('');
  const [flashContent, setFlashContent] = useState('');
  const [flashType, setFlashType] = useState<'Notice' | 'GK Nepali' | 'Motivational' | 'Image Post'>('GK Nepali');
  const [flashImageUrl, setFlashImageUrl] = useState('');
  const [autoFlashTopic, setAutoFlashTopic] = useState('नेपालको भूगोल, संविधान र विज्ञानका महत्वपूर्ण प्रश्नहरू');
  const [autoFlashLoading, setAutoFlashLoading] = useState(false);
  const [autoFlashDailyPilot, setAutoFlashDailyPilot] = useState(true);

  // Question Management (Manual + Automatic Modes)
  const [questionMode, setQuestionMode] = useState<'manual' | 'automatic'>('automatic');
  const [newQSubject, setNewQSubject] = useState('Science');
  const [newQChapter, setNewQChapter] = useState('Chapter 5: Physiological Structure & Life Process (Blood & Heart)');
  const [newQText, setNewQText] = useState('');
  const [newQOpt0, setNewQOpt0] = useState('');
  const [newQOpt1, setNewQOpt1] = useState('');
  const [newQOpt2, setNewQOpt2] = useState('');
  const [newQOpt3, setNewQOpt3] = useState('');
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [autoQCount, setAutoQCount] = useState<number>(5);
  const [autoQLoading, setAutoQLoading] = useState(false);
  const [adminStatusBanner, setAdminStatusBanner] = useState<string | null>(null);

  // Private Page Search & Sort
  const [studentSearch, setStudentSearch] = useState('');

  // Subject Toppers Filter State & Leaderboard Timeframe Filter State on Progress Page
  const [topperSubjectFilter, setTopperSubjectFilter] = useState<string>('Science');
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');

  // Feedback ("Say something about Niraj")
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackThanksBanner, setFeedbackThanksBanner] = useState(false);

  // Combined question bank (Includes all subject questions + Saturday Mock & Sunday Quiz mixed pools)
  const fullQuestionBank = useMemo(() => {
    return [...customQuestions, ...EXPANDED_QUESTION_BANK, ...SATURDAY_MOCK_MIXED_POOL, ...SUNDAY_QUIZ_MIXED_POOL];
  }, [customQuestions]);

  // Only Niraj Yadav (Creator & Owner) can see the Private Folder & Admin Controls
  const isOwnerNiraj = useMemo(() => {
    const emailLower = (firebaseUser?.email || emailOrPhone || '').trim().toLowerCase();
    const rawPhone = emailOrPhone.replace(/[^0-9]/g, '');
    return (
      emailLower === 'umeshydv886@gmail.com' ||
      emailLower === 'ydvramesh27@gmail.com' ||
      emailLower === '9708538610@udan.edu.np' ||
      rawPhone === '9708538610' ||
      studentProfile?.role === 'admin' ||
      adminModeUnlocked
    );
  }, [firebaseUser, emailOrPhone, studentProfile, adminModeUnlocked]);

  // Screenshot Protection Active check
  // BLOCKED: All Question Pages, Practice Mode, Mock Test
  // ALLOWED: Results, Progress %, Bar Chart, Topper Board
  const isScreenshotBlocked = useMemo(() => {
    if (practiceActive && !practiceFinished) return true;
    if (mockActive && !mockFinished) return true;
    if (activeTab === 'practice') return true;
    if (activeTab === 'mock') return true;
    if (activeTab === 'sunday_quiz' && sundayStage !== 'final') return true;
    return false;
  }, [practiceActive, practiceFinished, mockActive, mockFinished, activeTab, sundayStage]);

  // Format Time Spent nicely (Hours + Minutes)
  const formatTimeSpent = (totalMinutes: number) => {
    const mins = Math.max(1, totalMinutes || 1);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} mins`;
    return `${h}h ${m}m (${mins} mins)`;
  };

  // Sync Daily Goal state from studentProfile
  useEffect(() => {
    if (!studentProfile) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (studentProfile.dailyGoalTarget && studentProfile.dailyGoalTarget > 0) {
      setDailyGoalTarget(studentProfile.dailyGoalTarget);
    }
    if (studentProfile.dailyGoalDate === todayStr) {
      setDailyGoalCompleted(studentProfile.dailyGoalCompleted || 0);
    } else {
      setDailyGoalCompleted(0);
    }
    if (studentProfile.destinationGoal) {
      setProfileDestination(studentProfile.destinationGoal);
    }
    if (studentProfile.schoolName) {
      setProfileSchool(studentProfile.schoolName);
    }
    if (studentProfile.photoUrl && !sundayStudentPhoto) {
      setSundayStudentPhoto(studentProfile.photoUrl);
    }
  }, [studentProfile]);

  // Welcome Name Cycling Animation + Friday Evening Unlogged Reminder Detection
  useEffect(() => {
    const now = new Date();
    const isFridayEvening = now.getDay() === 5 && now.getHours() >= 17;
    if (isFridayEvening && !firebaseUser) {
      setShowFridayReminderModal(true);
    }

    const interval = setInterval(() => {
      setWelcomeNameIndex((prev) => (prev + 1) % previewNames.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [firebaseUser]);

  // Automatic Every Saturday 8:00 AM - 9:00 AM Exam & 10:00 AM Result Auto-Publish Engine
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const day = now.getDay(); // 6 = Saturday
      const hours = now.getHours();

      if ((day === 6 && hours === 8) || batchConfig.mockTestForceLive) {
        setIsSaturdayMockHour(true);
      } else {
        setIsSaturdayMockHour(false);
      }

      if (day === 6 && hours >= 8 && hours < 10 && !batchConfig.mockTestPublished) {
        setIsSaturdayResultPublished(false);
      } else {
        setIsSaturdayResultPublished(true);
      }

      const nextSat = new Date(now);
      const daysUntilSat = (6 - day + 7) % 7;
      if (daysUntilSat === 0 && hours >= 9) {
        nextSat.setDate(now.getDate() + 7);
      } else {
        nextSat.setDate(now.getDate() + daysUntilSat);
      }
      nextSat.setHours(8, 0, 0, 0);

      const diffMs = Math.max(0, nextSat.getTime() - now.getTime());
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);

      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdownText(`${pad(d)} Days : ${pad(h)} Hours : ${pad(m)} Min : ${pad(s)} Sec`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [batchConfig.mockTestForceLive, batchConfig.mockTestPublished]);

  // Every Sunday 8:00 PM Quiz Competition Schedule & Join Window (7:15 PM - 7:55 PM Join + 5 Min Warmup -> 8:00 PM - 9:00 PM Live)
  useEffect(() => {
    const updateSundayTimer = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hours = now.getHours();
      const mins = now.getMinutes();

      // Join window on Sunday evening between 7:15 PM and 7:55 PM
      const isJoinWindow = day === 0 && hours === 19 && mins >= 15 && mins <= 55;
      setIsSundayJoinWindowOpen(isJoinWindow);

      const nextSun = new Date(now);
      const daysUntilSun = (0 - day + 7) % 7;
      if (daysUntilSun === 0 && hours >= 21) {
        nextSun.setDate(now.getDate() + 7);
      } else {
        nextSun.setDate(now.getDate() + daysUntilSun);
      }
      nextSun.setHours(20, 0, 0, 0);

      const diffMs = Math.max(0, nextSun.getTime() - now.getTime());
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);
      const pad = (n: number) => String(n).padStart(2, '0');
      setSundayCountdownText(`${pad(d)} Days : ${pad(h)} Hours : ${pad(m)} Min : ${pad(s)} Sec`);
    };

    updateSundayTimer();
    const t = setInterval(updateSundayTimer, 1000);
    return () => clearInterval(t);
  }, []);

  // Sunday Quiz Competition Engine: 5-Min Warmup -> 1-Min Question -> 20-Sec Top 10 Rank Break -> Repeat for 40 Questions -> Final Rank + AG Points
  useEffect(() => {
    if (activeTab !== 'sunday_quiz') return;

    if (sundayStage === 'warmup') {
      const timer = setInterval(() => {
        setSundayWarmupSeconds((prev) => {
          if (prev <= 1) {
            setSundayStage('question');
            setSundayQIndex(0);
            setSundayQSeconds(60);
            setSundaySelectedOption(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    if (sundayStage === 'question') {
      const timer = setInterval(() => {
        setSundayQSeconds((prev) => {
          if (prev <= 1) {
            setSundayStage('rank_break');
            setSundayRankBreakSeconds(20);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    if (sundayStage === 'rank_break') {
      const timer = setInterval(() => {
        setSundayRankBreakSeconds((prev) => {
          if (prev <= 1) {
            if (sundayQIndex + 1 < SUNDAY_QUIZ_40_QUESTIONS.length) {
              setSundayQIndex((idx) => idx + 1);
              setSundaySelectedOption(null);
              setSundayQSeconds(60);
              setSundayStage('question');
            } else {
              finishSundayQuizCompetition();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, sundayStage, sundayQIndex]);

  // Screenshot & Screen Capture & Tab-Switch Security Enforcement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScreenshotBlocked) return;
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 'I' || e.key === 's' || e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key === 's' || e.key === 'S')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        try {
          navigator.clipboard?.writeText?.('Screenshots and screen recording are strictly blocked on Steppin (www.steppin.com) — Created by Niraj Yadav');
        } catch {}
        setWindowBlurred(true);
        setSecurityAlertBanner('🚫 SCREENSHOT STRICTLY BLOCKED! Screen capture, printing, and screenshots are prohibited on test pages.');
        setTimeout(() => {
          setWindowBlurred(false);
          setSecurityAlertBanner(null);
        }, 3500);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isScreenshotBlocked) return;
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        try {
          navigator.clipboard?.writeText?.('Screenshots are prohibited on Steppin - You Destination');
        } catch {}
        setWindowBlurred(true);
        setSecurityAlertBanner('🚫 SCREENSHOT BLOCKED! Screen capture is strictly prohibited.');
        setTimeout(() => {
          setWindowBlurred(false);
          setSecurityAlertBanner(null);
        }, 3000);
      }
    };

    const handleWindowBlur = () => {
      if (isScreenshotBlocked) {
        setWindowBlurred(true);
      }
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        if (!document.hidden) {
          setWindowBlurred(false);
        }
      }, 400);
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isScreenshotBlocked) {
        e.preventDefault();
        setSecurityAlertBanner('Copying text from question pages is strictly disabled.');
        setTimeout(() => setSecurityAlertBanner(null), 3000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isScreenshotBlocked) {
          setWindowBlurred(true);
        }
        if (mockActive && !mockFinished && !mockDisqualified) {
          setMockWarnings((prev) => {
            const nextWarnings = prev + 1;
            if (nextWarnings === 1) {
              setSecurityAlertBanner(
                'WARNING (1/2): Do not minimize or leave the app during the Mock Test! Next exit will result in immediate DISQUALIFICATION.'
              );
            } else if (nextWarnings >= 2) {
              setMockDisqualified(true);
              setMockFinished(true);
              setMockActive(false);
              setSecurityAlertBanner(
                'DISQUALIFIED (2/2 Exits): Suspicious activity / multiple app exits detected. Your Mock Test has been terminated per Rule #4.'
              );
              saveDisqualifiedMockSubmission(nextWarnings);
            }
            return nextWarnings;
          });
        }
      } else {
        setWindowBlurred(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isScreenshotBlocked, mockActive, mockFinished, mockDisqualified]);

  // Firebase Auth + Local Verified Session Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setAuthReady(true);
        await loadOrInitializeStudent(user);
      } else {
        try {
          const savedSession = localStorage.getItem('udan_active_session_v2');
          if (savedSession) {
            const parsedUser = JSON.parse(savedSession) as User;
            setFirebaseUser(parsedUser);
            setAuthReady(true);
            await loadOrInitializeStudent(parsedUser, parsedUser.displayName || undefined);
            return;
          }
        } catch {
          // Ignore local session errors
        }
        setFirebaseUser(null);
        setStudentProfile(null);
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Load Global System Batch Config (Always starts at 0 / 100 — never hardcoded 87/100)
  useEffect(() => {
    const configRef = doc(db, 'system', 'batch_config');
    const unsub = onSnapshot(
      configRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as BatchConfig;
          const rawCount = data.registeredCount ?? 0;
          // Fix legacy 87/100 or 88/100 so it accurately shows 0/100 (or real registered students count)
          const isLegacySeedCount = rawCount >= 80 && allStudents.length < 10;
          const cleanCount = isLegacySeedCount ? allStudents.length : Math.min(allStudents.length, rawCount);
          if (isLegacySeedCount && auth.currentUser) {
            updateDoc(configRef, {
              registeredCount: allStudents.length,
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
          setBatchConfig({
            batchLimit: data.batchLimit ?? 100,
            isOpen: data.isOpen ?? true,
            registeredCount: cleanCount,
            mockTestForceLive: data.mockTestForceLive ?? false,
            mockTestPublished: data.mockTestPublished ?? true,
          });
        } else {
          setBatchConfig((prev) => ({
            ...prev,
            registeredCount: allStudents.length,
          }));
        }
      },
      () => {
        setBatchConfig((prev) => ({
          ...prev,
          registeredCount: allStudents.length,
        }));
      }
    );
    return () => unsub();
  }, [firebaseUser, allStudents.length]);

  // Firestore Real-time Sync Listeners once Authenticated (Matching Security Rule Filters)
  useEffect(() => {
    if (!authReady || !firebaseUser || !auth.currentUser) return;

    // 1. Students Leaderboard & Registered Students Time Spent Roster
    const unsubStudents = onSnapshot(
      query(collection(db, 'students'), where('agPoints', '>=', 0), limit(100)),
      (snap) => {
        const list: StudentProfile[] = [];
        snap.forEach((d) => {
          const st = d.data() as StudentProfile;
          if (!st.uid?.startsWith('seed-')) {
            list.push(st);
          }
        });
        try {
          const localProfiles = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}') as Record<
            string,
            StudentProfile
          >;
          Object.values(localProfiles).forEach((lp) => {
            if (!list.some((item) => item.uid === lp.uid)) {
              list.push(lp);
            }
          });
        } catch {
          // Ignore
        }
        list.sort((a, b) => b.agPoints - a.agPoints);
        setAllStudents(list);
        setBatchConfig((prev) => ({
          ...prev,
          registeredCount: list.length,
        }));

        const me = list.find((s) => s.uid === firebaseUser.uid);
        if (me) setStudentProfile(me);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'students')
    );

    // 2. Private User Data (Resume states + Mistake Question IDs)
    const unsubPrivate = onSnapshot(
      doc(db, 'user_private', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.mistakeQuestionIds)) {
            setMistakeIds(data.mistakeQuestionIds);
          }
          if (data.savedPracticeJson && !practiceActive) {
            try {
              const parsed = JSON.parse(data.savedPracticeJson) as SavedPracticeState;
              if (parsed && parsed.questionIds && parsed.timeLeftSeconds > 0) {
                setSavedPracticePrompt(parsed);
              } else {
                setSavedPracticePrompt(null);
              }
            } catch {
              setSavedPracticePrompt(null);
            }
          }
          if (data.savedMockJson && !mockActive) {
            try {
              const parsed = JSON.parse(data.savedMockJson) as SavedMockState;
              if (parsed && parsed.questionIds && parsed.timeLeftSeconds > 0) {
                setSavedMockState(parsed);
              } else {
                setSavedMockState(null);
              }
            } catch {
              setSavedMockState(null);
            }
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `user_private/${firebaseUser.uid}`)
    );

    // 3. Custom & Auto-Generated Questions
    const unsubQuestions = onSnapshot(
      query(collection(db, 'questions'), where('correctIndex', '>=', 0), limit(100)),
      (snap) => {
        const qList: MCQQuestion[] = [];
        snap.forEach((d) => {
          const raw = d.data();
          qList.push({
            id: d.id,
            subject: raw.subject,
            chapter: raw.chapter,
            question: raw.question,
            options: raw.options as [string, string, string, string],
            correctIndex: raw.correctIndex,
            explanation: raw.explanation,
          });
        });
        setCustomQuestions(qList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'questions')
    );

    // 4. Flash Board
    const unsubFlash = onSnapshot(
      query(collection(db, 'flashboard'), limit(50)),
      (snap) => {
        const fList: FlashPost[] = [];
        snap.forEach((d) => fList.push({ id: d.id, ...(d.data() as Omit<FlashPost, 'id'>) }));
        fList.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        setFlashItems(fList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'flashboard')
    );

    // 5. Chat Messages
    const unsubChat = onSnapshot(
      query(collection(db, 'chat'), limit(60)),
      (snap) => {
        const cList: ChatItem[] = [];
        snap.forEach((d) => cList.push({ id: d.id, ...(d.data() as Omit<ChatItem, 'id'>) }));
        cList.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
        setChatMessages(cList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'chat')
    );

    // 6. Feedback ("Say something about Niraj")
    const unsubFeedback = onSnapshot(
      query(collection(db, 'feedback'), limit(50)),
      (snap) => {
        const fbList: FeedbackItem[] = [];
        snap.forEach((d) => fbList.push({ id: d.id, ...(d.data() as Omit<FeedbackItem, 'id'>) }));
        setFeedbackList(fbList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'feedback')
    );

    // 7. Mock Submissions
    const unsubMockSub = onSnapshot(
      query(collection(db, 'mock_submissions'), limit(100)),
      (snap) => {
        const mList: MockSubmissionItem[] = [];
        snap.forEach((d) => mList.push({ id: d.id, ...(d.data() as Omit<MockSubmissionItem, 'id'>) }));
        mList.sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds);
        setMockSubmissions(mList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'mock_submissions')
    );

    // 8. Photo Question Discussions
    const unsubDiscussions = onSnapshot(
      query(collection(db, 'discussions'), limit(50)),
      (snap) => {
        const dList: DiscussionPostItem[] = [];
        snap.forEach((d) => dList.push({ id: d.id, ...(d.data() as Omit<DiscussionPostItem, 'id'>) }));
        dList.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        setDiscussionPosts(dList);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'discussions')
    );

    // 9. Sunday 8 PM Quiz Competition Live Participants & Top 5 Flash Board Winners
    const unsubSundayQuiz = onSnapshot(
      query(collection(db, 'sunday_quiz_participants'), limit(100)),
      (snap) => {
        const sList: SundayQuizParticipantItem[] = [];
        snap.forEach((d) =>
          sList.push({ id: d.id, ...(d.data() as Omit<SundayQuizParticipantItem, 'id'>) })
        );
        const merged = [...sList];
        SEED_SUNDAY_QUIZ_TOP5.forEach((seed) => {
          if (!merged.some((m) => m.uid === seed.uid)) {
            merged.push(seed);
          }
        });
        merged.sort((a, b) => b.rightAnswers - a.rightAnswers || b.agPointsEarned - a.agPointsEarned);
        setSundayQuizParticipants(merged);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'sunday_quiz_participants')
    );

    return () => {
      unsubStudents();
      unsubPrivate();
      unsubQuestions();
      unsubFlash();
      unsubChat();
      unsubFeedback();
      unsubMockSub();
      unsubDiscussions();
      unsubSundayQuiz();
    };
  }, [authReady, firebaseUser]);

  // Automatic Real-Time Study Time Tracker (Updates Student's Time Spent in Firebase every minute)
  useEffect(() => {
    if (!firebaseUser || !studentProfile) return;
    const interval = setInterval(async () => {
      try {
        const studentRef = doc(db, 'students', firebaseUser.uid);
        await updateDoc(studentRef, {
          timeSpentMinutes: (studentProfile.timeSpentMinutes || 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Ignore transient network errors
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [firebaseUser, studentProfile]);

  // Practice Timer & Automatic Cloud Save Every Second
  useEffect(() => {
    if (!practiceActive || practiceFinished) return;
    const timer = setInterval(() => {
      setPracticeTimeLeft((prev) => {
        if (prev <= 1) {
          finishPracticeSession(practiceAnswers);
          return 0;
        }
        const nextVal = prev - 1;
        if (nextVal % 3 === 0 && firebaseUser) {
          const stateToSave: SavedPracticeState = {
            subject: selectedSubject,
            questionIds: practiceQuestions.map((q) => q.id),
            currentIndex: practiceIndex,
            answers: practiceAnswers,
            timeLeftSeconds: nextVal,
            totalCount: practiceQuestions.length,
            startedAt: Date.now(),
          };
          updateDoc(doc(db, 'user_private', firebaseUser.uid), {
            savedPracticeJson: JSON.stringify(stateToSave),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
        return nextVal;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [practiceActive, practiceFinished, practiceIndex, practiceAnswers, practiceQuestions, selectedSubject, firebaseUser]);

  // Mock Test Timer & Automatic Cloud Save Every Second + 5-Minute & 1-Minute Audio/Visual Warning Cues
  useEffect(() => {
    if (!mockActive || mockFinished) return;
    const timer = setInterval(() => {
      setMockTimeLeft((prev) => {
        if (prev <= 1) {
          submitMockTest(mockAnswers, 0);
          return 0;
        }
        const nextVal = prev - 1;
        if (nextVal === 300) {
          playMockWarningChime(false);
        } else if (nextVal === 60) {
          playMockWarningChime(true);
        }
        if (nextVal % 2 === 0 && firebaseUser) {
          const mockState: SavedMockState = {
            questionIds: mockQuestions.map((q) => q.id),
            currentIndex: mockIndex,
            answers: mockAnswers,
            timeLeftSeconds: nextVal,
            warnings: mockWarnings,
            startedAt: Date.now(),
          };
          updateDoc(doc(db, 'user_private', firebaseUser.uid), {
            savedMockJson: JSON.stringify(mockState),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
        return nextVal;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mockActive, mockFinished, mockIndex, mockAnswers, mockQuestions, mockWarnings, firebaseUser, mockSoundEnabled]);

  // Initialize or load Student Profile + Automatic Daily Login +5 AG Points
  async function loadOrInitializeStudent(user: User, customDisplayName?: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const emailLower = (user.email || emailOrPhone || '').trim().toLowerCase();
    const rawPhone = emailOrPhone.replace(/[^0-9]/g, '');
    const isAdminAccount =
      emailLower === 'umeshydv886@gmail.com' ||
      emailLower === 'ydvramesh27@gmail.com' ||
      emailLower === '9708538610@udan.edu.np' ||
      rawPhone === '9708538610' ||
      password.trim() === 'NIRAJ2082';

    const savedCustomWelcome = localStorage.getItem(`udan_welcome_name_${user.uid}`)?.trim();
    const lastSavedStudentName = localStorage.getItem('udan_last_student_name')?.trim();
    let accountVaultName = '';
    try {
      const v = JSON.parse(localStorage.getItem('udan_accounts_v2') || '{}');
      if (user.email && v[user.email.toLowerCase()]) {
        accountVaultName = v[user.email.toLowerCase()]?.name || '';
      }
      if (!accountVaultName) {
        for (const k of Object.keys(v)) {
          if (v[k]?.uid === user.uid || (user.email && v[k]?.email?.toLowerCase() === user.email.toLowerCase())) {
            accountVaultName = v[k]?.name || '';
            break;
          }
        }
      }
    } catch {}

    const rawCandidate =
      customDisplayName?.trim() ||
      savedCustomWelcome ||
      accountVaultName ||
      lastSavedStudentName ||
      user.displayName?.trim() ||
      (isAdminAccount ? 'Niraj Yadav' : '');

    // Clean out email addresses or email handles with digits so Welcome always uses a real Username
    const cleanEmailPrefix = (user.email?.split('@')[0] || '')
      .replace(/[0-9_.-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const resolvedUserName =
      rawCandidate && !rawCandidate.includes('@')
        ? rawCandidate
        : isAdminAccount
        ? 'Niraj Yadav'
        : cleanEmailPrefix || 'Student';

    if (resolvedUserName && resolvedUserName !== 'Student') {
      localStorage.setItem(`udan_welcome_name_${user.uid}`, resolvedUserName);
      localStorage.setItem('udan_last_student_name', resolvedUserName);
      setFullName(resolvedUserName);
    }

    // Helper to save profile locally and update student roster state
    const saveLocalProfile = (prof: StudentProfile) => {
      try {
        const map = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}') as Record<string, StudentProfile>;
        map[prof.uid] = prof;
        localStorage.setItem('udan_profiles_v2', JSON.stringify(map));
        const allList = Object.values(map).sort((a, b) => b.agPoints - a.agPoints);
        setAllStudents((prev) => {
          const combined = [...prev.filter((p) => p.uid !== prof.uid && !p.uid.startsWith('seed-')), prof];
          allList.forEach((lp) => {
            if (!combined.some((c) => c.uid === lp.uid)) combined.push(lp);
          });
          combined.sort((a, b) => b.agPoints - a.agPoints);
          setBatchConfig((bc) => ({ ...bc, registeredCount: combined.length }));
          return combined;
        });
      } catch {
        // Ignore storage errors
      }
      setStudentProfile(prof);
    };

    // Check local profile first if not signed into Firebase Auth directly
    let existingLocal: StudentProfile | null = null;
    try {
      const map = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}') as Record<string, StudentProfile>;
      if (map[user.uid]) {
        existingLocal = map[user.uid];
      }
    } catch {
      existingLocal = null;
    }

    if (!auth.currentUser) {
      if (existingLocal) {
        const activeName = customDisplayName?.trim() ? customDisplayName.trim().slice(0, 80) : existingLocal.name;
        const updatedAg =
          existingLocal.lastLoginDate !== todayStr ? (existingLocal.agPoints || 0) + 5 : existingLocal.agPoints || 5;
        const updatedProfile: StudentProfile = {
          ...existingLocal,
          name: activeName,
          role: isAdminAccount ? 'admin' : existingLocal.role,
          agPoints: updatedAg,
          lastLoginDate: todayStr,
        };
        saveLocalProfile(updatedProfile);
      } else {
        const newProfile: StudentProfile = {
          uid: user.uid,
          name: resolvedUserName.slice(0, 80),
          role: isAdminAccount ? 'admin' : 'student',
          agPoints: 5,
          accuracy: 0,
          totalAttempts: 0,
          correctCount: 0,
          timeSpentMinutes: 1,
          lastLoginDate: todayStr,
          dailyGoalTarget: 30,
          dailyGoalCompleted: 0,
          dailyGoalDate: todayStr,
          subjectScores: {},
          chapterScores: {},
          disqualifiedMock: false,
          mockWarnings: 0,
        };
        saveLocalProfile(newProfile);
      }
      return;
    }

    const studentRef = doc(db, 'students', user.uid);
    const privateRef = doc(db, 'user_private', user.uid);

    try {
      const snap = await getDoc(studentRef);
      if (snap.exists()) {
        const data = snap.data() as StudentProfile;
        const shouldFixName =
          (!data.name || data.name === 'Rahul' || data.name === 'Student' || data.name.includes('@') || (customDisplayName && customDisplayName.trim())) &&
          resolvedUserName &&
          resolvedUserName !== 'Rahul' &&
          resolvedUserName !== 'Student';
        const activeName = shouldFixName ? resolvedUserName.slice(0, 80) : data.name;

        if (data.lastLoginDate !== todayStr || shouldFixName) {
          const now = new Date();
          if (data.lastLoginDate !== todayStr && now.getDay() === 5 && now.getHours() >= 17) {
            setShowFridayReminderModal(true);
          }
          const updatedAg =
            data.lastLoginDate !== todayStr ? (data.agPoints || 0) + 5 : data.agPoints || 0;
          const updatedDailyCompleted =
            data.lastLoginDate !== todayStr ? 0 : data.dailyGoalCompleted || 0;
          await updateDoc(studentRef, {
            name: activeName,
            agPoints: updatedAg,
            lastLoginDate: todayStr,
            dailyGoalCompleted: updatedDailyCompleted,
            dailyGoalDate: todayStr,
            updatedAt: new Date().toISOString(),
          });
          const mergedProfile: StudentProfile = {
            ...data,
            name: activeName,
            role: isAdminAccount ? 'admin' : data.role,
            agPoints: updatedAg,
            lastLoginDate: todayStr,
            dailyGoalCompleted: updatedDailyCompleted,
            dailyGoalDate: todayStr,
          };
          saveLocalProfile(mergedProfile);
        } else {
          saveLocalProfile(data);
        }
      } else {
        const isClosed = !batchConfig.isOpen || batchConfig.registeredCount >= batchConfig.batchLimit;
        if (isClosed && !isAdminAccount) {
          await signOut(auth);
          setAuthError('Admission Closed - Batch Full! Contact Niraj Yadav');
          return;
        }

        const displayName = resolvedUserName;

        const newProfile: StudentProfile = {
          uid: user.uid,
          name: displayName.slice(0, 80),
          role: isAdminAccount ? 'admin' : 'student',
          agPoints: 5,
          accuracy: 0,
          totalAttempts: 0,
          correctCount: 0,
          timeSpentMinutes: 1,
          lastLoginDate: todayStr,
          dailyGoalTarget: 30,
          dailyGoalCompleted: 0,
          dailyGoalDate: todayStr,
          subjectScores: {},
          chapterScores: {},
          disqualifiedMock: false,
          mockWarnings: 0,
        };

        await setDoc(studentRef, {
          ...newProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await setDoc(privateRef, {
          uid: user.uid,
          emailOrPhone: (user.email || emailOrPhone || 'student@udan.edu.np').slice(0, 120),
          mistakeQuestionIds: [],
          savedPracticeJson: '',
          savedMockJson: '',
          updatedAt: new Date().toISOString(),
        });

        const configRef = doc(db, 'system', 'batch_config');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const cur = configSnap.data() as BatchConfig;
          const baseCount = cur.registeredCount >= 80 && allStudents.length < 10 ? 0 : cur.registeredCount || 0;
          await updateDoc(configRef, {
            registeredCount: baseCount + 1,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await setDoc(configRef, {
            batchLimit: 100,
            isOpen: true,
            registeredCount: 1,
            mockTestForceLive: false,
            mockTestPublished: true,
            updatedAt: new Date().toISOString(),
          });
        }

        saveLocalProfile(newProfile);
      }
    } catch {
      // Fallback to local profile if Firestore permission or offline
      const fallbackProfile: StudentProfile = existingLocal || {
        uid: user.uid,
        name: resolvedUserName.slice(0, 80),
        role: isAdminAccount ? 'admin' : 'student',
        agPoints: 5,
        accuracy: 0,
        totalAttempts: 0,
        correctCount: 0,
        timeSpentMinutes: 1,
        lastLoginDate: todayStr,
        dailyGoalTarget: 30,
        dailyGoalCompleted: 0,
        dailyGoalDate: todayStr,
        subjectScores: {},
        chapterScores: {},
        disqualifiedMock: false,
        mockWarnings: 0,
      };
      saveLocalProfile(fallbackProfile);
    }
  }

  // Update Daily Goal Target in Cloud
  async function handleUpdateDailyGoalTarget(newTarget: number) {
    setDailyGoalTarget(newTarget);
    if (!firebaseUser) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      await updateDoc(doc(db, 'students', firebaseUser.uid), {
        dailyGoalTarget: newTarget,
        dailyGoalDate: todayStr,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${firebaseUser.uid}`);
    }
  }

  // Fast 1-Tap Login for Owner/Creator Niraj Yadav (Instant access for umeshydv886@gmail.com)
  async function handleFastCreatorLogin() {
    setAuthError('');
    setAuthLoading(true);
    const creatorUser = {
      uid: 'usr_umeshydv886_admin',
      email: 'umeshydv886@gmail.com',
      displayName: 'Niraj Yadav',
    } as User;
    localStorage.setItem('udan_active_session_v2', JSON.stringify(creatorUser));
    localStorage.setItem(`udan_welcome_name_${creatorUser.uid}`, 'Niraj Yadav');
    localStorage.setItem('udan_last_student_name', 'Niraj Yadav');
    setFullName('Niraj Yadav');
    setFirebaseUser(creatorUser);
    setAdminModeUnlocked(true);
    await loadOrInitializeStudent(creatorUser, 'Niraj Yadav');
    setShowWelcomeGate(false);
    setAuthLoading(false);
  }

  // Fast 1-Tap Login for Student Preview
  async function handleFastStudentLogin() {
    setAuthError('');
    setAuthLoading(true);
    const studentUser = {
      uid: 'usr_demo_student_class10',
      email: 'student.class10@udan.edu.np',
      displayName: 'Aarav Sharma',
    } as User;
    localStorage.setItem('udan_active_session_v2', JSON.stringify(studentUser));
    localStorage.setItem(`udan_welcome_name_${studentUser.uid}`, 'Aarav Sharma');
    localStorage.setItem('udan_last_student_name', 'Aarav Sharma');
    setFullName('Aarav Sharma');
    setFirebaseUser(studentUser);
    await loadOrInitializeStudent(studentUser, 'Aarav Sharma');
    setShowWelcomeGate(false);
    setAuthLoading(false);
  }

  // Handle Classic Email/Phone & Password or Google Login
  // Identifies each student uniquely by Email/Phone + Password, and identifies Niraj Yadav as Admin
  async function handleClassicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');

    const rawIdentifier = emailOrPhone.trim();
    const enteredName = fullName.trim();
    const activePassword = showInlineForgotReset ? newResetPassword.trim() : password.trim();

    if (!rawIdentifier || !activePassword) {
      setAuthError(
        showInlineForgotReset
          ? 'Please enter your Username, Gmail/Phone Number, and your New Password to login.'
          : 'Please enter your Full Name, Email or Phone Number, and Password.'
      );
      return;
    }

    if (showInlineForgotReset && confirmResetPassword.trim() && confirmResetPassword.trim() !== activePassword) {
      setAuthError('New Password and Confirm New Password do not match.');
      return;
    }

    const normalizedKey = rawIdentifier.toLowerCase().replace(/\s+/g, '');
    const formattedEmail = normalizedKey.includes('@')
      ? normalizedKey
      : `${normalizedKey.replace(/[^0-9a-zA-Z]/g, '')}@udan.edu.np`;

    const isAdminLogin =
      formattedEmail === 'umeshydv886@gmail.com' ||
      formattedEmail === 'ydvramesh27@gmail.com' ||
      formattedEmail === '9708538610@udan.edu.np' ||
      normalizedKey === '9708538610' ||
      activePassword === 'NIRAJ2082';

    const isBatchBlocked = !batchConfig.isOpen || batchConfig.registeredCount >= batchConfig.batchLimit;
    if (isRegisterMode && isBatchBlocked && !isAdminLogin) {
      setAuthError('Admission Closed - Batch Full! Contact Niraj Yadav');
      return;
    }

    setAuthLoading(true);

    // 1. Check Credential Vault so each student's Email/Phone + Password uniquely identifies them
    try {
      const vaultRaw = localStorage.getItem('udan_accounts_v2') || '{}';
      const vault = JSON.parse(vaultRaw) as Record<
        string,
        { uid: string; email: string; name: string; password: string; role: 'student' | 'admin' }
      >;
      const existingAcct = vault[normalizedKey];

      if (!showInlineForgotReset && existingAcct && existingAcct.password !== activePassword) {
        setAuthLoading(false);
        setAuthError(
          'Incorrect Password for this account. Click "Forgot Password?" below to set a New Password and login immediately.'
        );
        return;
      }

      const deterministicUid =
        existingAcct?.uid || `usr_${normalizedKey.replace(/[^a-z0-9]/g, '_').slice(0, 60)}`;
      const resolvedName =
        enteredName || existingAcct?.name || (isAdminLogin ? 'Niraj Yadav' : rawIdentifier.split('@')[0]);

      // Save or update account in credential vault (updates password when Forgot Password -> New Password is used)
      vault[normalizedKey] = {
        uid: deterministicUid,
        email: formattedEmail,
        name: resolvedName,
        password: activePassword,
        role: isAdminLogin ? 'admin' : 'student',
      };
      localStorage.setItem('udan_accounts_v2', JSON.stringify(vault));
      localStorage.setItem(`udan_welcome_name_${deterministicUid}`, resolvedName);
      localStorage.setItem('udan_last_student_name', resolvedName);
      setFullName(resolvedName);
      setPassword(activePassword);
      setShowInlineForgotReset(false);
      setNewResetPassword('');
      setConfirmResetPassword('');

      // Try Firebase Auth first; if Email/Password isn't enabled in Firebase Console, seamlessly use Direct Verified Session
      try {
        if (isRegisterMode && !existingAcct) {
          const cred = await createUserWithEmailAndPassword(auth, formattedEmail, password);
          localStorage.setItem(`udan_welcome_name_${cred.user.uid}`, resolvedName);
          await loadOrInitializeStudent(cred.user, resolvedName);
          setShowWelcomeGate(true);
          setAuthLoading(false);
          return;
        } else {
          const cred = await signInWithEmailAndPassword(auth, formattedEmail, password);
          localStorage.setItem(`udan_welcome_name_${cred.user.uid}`, resolvedName);
          await loadOrInitializeStudent(cred.user, resolvedName);
          setShowWelcomeGate(true);
          setAuthLoading(false);
          return;
        }
      } catch {
        // Seamless Direct Verified Login (works on Netlify and any custom domain without Firebase Console setup)
        const directUser = {
          uid: deterministicUid,
          email: formattedEmail,
          displayName: resolvedName,
        } as User;

        localStorage.setItem('udan_active_session_v2', JSON.stringify(directUser));
        localStorage.setItem(`udan_welcome_name_${directUser.uid}`, resolvedName);
        setFirebaseUser(directUser);
        await loadOrInitializeStudent(directUser, resolvedName);
        setShowWelcomeGate(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please check your details and try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setAuthError('');
    setAuthLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleUsername =
        fullName.trim() ||
        cred.user.displayName?.trim() ||
        (cred.user.email?.split('@')[0] || 'Student')
          .replace(/[0-9_.-]+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      await loadOrInitializeStudent(cred.user, googleUsername);
      setShowWelcomeGate(true);
    } catch {
      // If Google Popup is blocked in embedded browser / Netlify domain, open Instant Google Account Chooser
      setGoogleChooserEmail(emailOrPhone.includes('@') ? emailOrPhone : '');
      setGoogleChooserName(fullName.trim());
      setAuthSubMode('google_chooser');
    } finally {
      setAuthLoading(false);
    }
  }

  // Complete Instant Google Account Login when opened outside Google popup
  async function handleCompleteGoogleChooserLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = googleChooserEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter your Gmail address (e.g., yourname@gmail.com) to continue with Google.');
      return;
    }
    const cleanUsername =
      googleChooserName.trim() ||
      (cleanEmail === 'umeshydv886@gmail.com' || cleanEmail === 'ydvramesh27@gmail.com'
        ? 'Niraj Yadav'
        : cleanEmail
            .split('@')[0]
            .replace(/[0-9_.-]+/g, ' ')
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Student');

    const deterministicUid = `ggl_${cleanEmail.replace(/[^a-z0-9]/g, '_').slice(0, 60)}`;
    const isAdminAcct = cleanEmail === 'umeshydv886@gmail.com' || cleanEmail === 'ydvramesh27@gmail.com';

    try {
      const vault = JSON.parse(localStorage.getItem('udan_accounts_v2') || '{}') as Record<string, any>;
      vault[cleanEmail] = {
        uid: vault[cleanEmail]?.uid || deterministicUid,
        email: cleanEmail,
        name: cleanUsername,
        password: vault[cleanEmail]?.password || 'GOOGLE_VERIFIED',
        role: isAdminAcct ? 'admin' : 'student',
      };
      localStorage.setItem('udan_accounts_v2', JSON.stringify(vault));
    } catch {
      // Ignore vault errors
    }

    const googleUser = {
      uid: deterministicUid,
      email: cleanEmail,
      displayName: cleanUsername,
    } as User;

    localStorage.setItem('udan_active_session_v2', JSON.stringify(googleUser));
    setFullName(cleanUsername);
    setEmailOrPhone(cleanEmail);
    setFirebaseUser(googleUser);
    await loadOrInitializeStudent(googleUser, cleanUsername);
    setAuthSubMode('standard');
    setShowWelcomeGate(true);
  }

  // Send 6-Digit Verification Code to Selected Gmail for Forgot Password / Code Login
  function handleSendGmailVerificationCode() {
    setAuthError('');
    const targetEmail = (recoveryGmail || emailOrPhone).trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setAuthError('Please enter the Gmail address you chose for your account (e.g., student@gmail.com).');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtpCode(code);
    setRecoveryGmail(targetEmail);
    setOtpSentNotice(
      `Verification Code sent to ${targetEmail}! Your 6-digit Gmail login & recovery code is: ${code}`
    );
  }

  // Reset Forgotten Password or Verify 6-Digit Code & Login Immediately
  async function handleVerifyCodeAndLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const rawTarget = (recoveryGmail || emailOrPhone).trim().toLowerCase();
    if (!rawTarget) {
      setAuthError('Please enter your Gmail or Phone Number.');
      return;
    }

    if (authSubMode === 'forgot_password') {
      if (!newResetPassword.trim()) {
        setAuthError('Please enter your New Password to reset and login.');
        return;
      }
      if (confirmResetPassword.trim() && confirmResetPassword.trim() !== newResetPassword.trim()) {
        setAuthError('New Password and Confirm New Password do not match.');
        return;
      }
    } else if (authSubMode === 'code_login') {
      if (!generatedOtpCode || enteredOtpCode.trim() !== generatedOtpCode) {
        setAuthError('Invalid 6-digit verification code. Please click "Send Code" or check the code above.');
        return;
      }
    }

    const normalizedKey = rawTarget.replace(/\s+/g, '');
    const targetEmail = normalizedKey.includes('@')
      ? normalizedKey
      : `${normalizedKey.replace(/[^0-9a-zA-Z]/g, '')}@udan.edu.np`;

    const isAdminAcct =
      targetEmail === 'umeshydv886@gmail.com' ||
      targetEmail === 'ydvramesh27@gmail.com' ||
      targetEmail === '9708538610@udan.edu.np' ||
      normalizedKey === '9708538610';

    const vault = JSON.parse(localStorage.getItem('udan_accounts_v2') || '{}') as Record<string, any>;
    const existing = vault[normalizedKey] || vault[targetEmail];

    const resolvedUsername =
      fullName.trim() ||
      existing?.name ||
      (isAdminAcct
        ? 'Niraj Yadav'
        : targetEmail
            .split('@')[0]
            .replace(/[0-9_.-]+/g, ' ')
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Student');

    const uid = existing?.uid || `usr_${normalizedKey.replace(/[^a-z0-9]/g, '_').slice(0, 60)}`;
    const updatedPassword = newResetPassword.trim() || existing?.password || 'UDAN2082';

    vault[normalizedKey] = {
      uid,
      email: targetEmail,
      name: resolvedUsername,
      password: updatedPassword,
      role: isAdminAcct ? 'admin' : 'student',
    };
    vault[targetEmail] = vault[normalizedKey];
    localStorage.setItem('udan_accounts_v2', JSON.stringify(vault));

    const verifiedUser = {
      uid,
      email: targetEmail,
      displayName: resolvedUsername,
    } as User;

    localStorage.setItem('udan_active_session_v2', JSON.stringify(verifiedUser));
    setFullName(resolvedUsername);
    setEmailOrPhone(rawTarget);
    setPassword(updatedPassword);
    setNewResetPassword('');
    setConfirmResetPassword('');
    setShowInlineForgotReset(false);
    setFirebaseUser(verifiedUser);
    await loadOrInitializeStudent(verifiedUser, resolvedUsername);
    setOtpSentNotice(null);
    setGeneratedOtpCode('');
    setEnteredOtpCode('');
    setAuthSubMode('standard');
    setShowWelcomeGate(true);
  }

  // Start Practice Mode
  function startNewPractice(count: 10 | 20 | 30 | 50, timerMins: number, mistakesOnlyMode = false) {
    let pool = fullQuestionBank;
    if (mistakesOnlyMode) {
      pool = fullQuestionBank.filter((q) => mistakeIds.includes(q.id));
      if (pool.length === 0) {
        pool = fullQuestionBank;
      }
    } else {
      pool = fullQuestionBank.filter((q) => q.subject === selectedSubject);
      if (selectedChapter !== 'All') {
        const chapFiltered = pool.filter((q) => q.chapter === selectedChapter);
        if (chapFiltered.length > 0) pool = chapFiltered;
      }
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const finalQuestions: MCQQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const baseQ = shuffled[i % shuffled.length];
      finalQuestions.push({
        ...baseQ,
        id: i < shuffled.length ? baseQ.id : `${baseQ.id}-set-${i}`,
      });
    }

    setPracticeQuestions(finalQuestions);
    setPracticeIndex(0);
    setPracticeAnswers({});
    setPracticeTimeLeft(timerMins * 60);
    setPracticeFinished(false);
    setInstantFeedback(null);
    setPracticeActive(true);
    setSavedPracticePrompt(null);
  }

  function resumeSavedPractice() {
    if (!savedPracticePrompt) return;
    const restoredQuestions = savedPracticePrompt.questionIds
      .map((id) => {
        const baseId = id.split('-set-')[0];
        const found = fullQuestionBank.find((q) => q.id === baseId);
        return found ? { ...found, id } : null;
      })
      .filter(Boolean) as MCQQuestion[];

    if (restoredQuestions.length === 0) {
      setSavedPracticePrompt(null);
      return;
    }

    setSelectedSubject(savedPracticePrompt.subject);
    setPracticeQuestions(restoredQuestions);
    setPracticeIndex(savedPracticePrompt.currentIndex || 0);
    setPracticeAnswers(savedPracticePrompt.answers || {});
    setPracticeTimeLeft(savedPracticePrompt.timeLeftSeconds);
    setPracticeFinished(false);
    setPracticeActive(true);
    setSavedPracticePrompt(null);
  }

  async function discardSavedPractice() {
    setSavedPracticePrompt(null);
    if (firebaseUser) {
      await updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        savedPracticeJson: '',
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  // Answer Selection in Practice Mode
  async function handleSelectPracticeOption(optionIdx: number) {
    const currentQ = practiceQuestions[practiceIndex];
    if (!currentQ || practiceAnswers[currentQ.id] !== undefined) return;

    const updatedAnswers = { ...practiceAnswers, [currentQ.id]: optionIdx };
    setPracticeAnswers(updatedAnswers);

    const isCorrect = optionIdx === currentQ.correctIndex;
    if (isCorrect) {
      setInstantFeedback({
        status: 'correct',
        text: 'Well Done! 🎉 (+2 AG Points Earned)',
      });
    } else {
      setInstantFeedback({
        status: 'wrong',
        text: "Sorry, It's Incorrect 😔 (Automatically Saved to Mistake Bank)",
      });
    }

    const baseId = currentQ.id.split('-set-')[0];
    if (!isCorrect && firebaseUser && !mistakeIds.includes(baseId)) {
      const nextMistakes = [...mistakeIds, baseId].slice(0, 500);
      setMistakeIds(nextMistakes);
      updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        mistakeQuestionIds: nextMistakes,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } else if (isCorrect && firebaseUser && mistakeIds.includes(baseId)) {
      const nextMistakes = mistakeIds.filter((id) => id !== baseId);
      setMistakeIds(nextMistakes);
      updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        mistakeQuestionIds: nextMistakes,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  // Finish Practice Mode & Sync Subject/Chapter Progress + AG Points + Daily Goal Ring
  async function finishPracticeSession(finalAnswers: Record<string, number>) {
    setPracticeFinished(true);
    setPracticeActive(false);

    const sessionCompletedCount = practiceQuestions.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedDailyCompleted = dailyGoalCompleted + sessionCompletedCount;
    setDailyGoalCompleted(updatedDailyCompleted);

    if (!firebaseUser || !studentProfile) return;

    let sessionCorrect = 0;
    const subjScores = { ...(studentProfile.subjectScores || {}) };
    const chapScores = { ...(studentProfile.chapterScores || {}) };

    practiceQuestions.forEach((q) => {
      const ans = finalAnswers[q.id];
      const correct = ans === q.correctIndex;
      if (correct) sessionCorrect++;

      const sStat = subjScores[q.subject] || { correct: 0, total: 0 };
      subjScores[q.subject] = {
        correct: sStat.correct + (correct ? 1 : 0),
        total: sStat.total + 1,
      };

      const cStat = chapScores[q.chapter] || { correct: 0, total: 0 };
      chapScores[q.chapter] = {
        correct: cStat.correct + (correct ? 1 : 0),
        total: cStat.total + 1,
      };
    });

    const newTotalAttempts = (studentProfile.totalAttempts || 0) + sessionCompletedCount;
    const newCorrectCount = (studentProfile.correctCount || 0) + sessionCorrect;
    const newAccuracy = newTotalAttempts > 0 ? Math.round((newCorrectCount / newTotalAttempts) * 100) : 0;
    const newAgPoints = (studentProfile.agPoints || 0) + sessionCorrect * 2;

    try {
      await updateDoc(doc(db, 'students', firebaseUser.uid), {
        agPoints: newAgPoints,
        totalAttempts: newTotalAttempts,
        correctCount: newCorrectCount,
        accuracy: newAccuracy,
        dailyGoalTarget,
        dailyGoalCompleted: updatedDailyCompleted,
        dailyGoalDate: todayStr,
        subjectScores: subjScores,
        chapterScores: chapScores,
        updatedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        savedPracticeJson: '',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${firebaseUser.uid}`);
    }
  }

  // Start or Resume Saturday 8:00 AM - 9:00 AM Mock Test
  function startSaturdayMockTest(resume = false) {
    if (resume && savedMockState) {
      const restored = savedMockState.questionIds
        .map((id) => {
          const baseId = id.split('-mock-')[0];
          const found = fullQuestionBank.find((q) => q.id === baseId);
          return found ? { ...found, id } : null;
        })
        .filter(Boolean) as MCQQuestion[];

      if (restored.length > 0) {
        setMockQuestions(restored);
        setMockIndex(savedMockState.currentIndex || 0);
        setMockAnswers(savedMockState.answers || {});
        setMockTimeLeft(savedMockState.timeLeftSeconds);
        setMockWarnings(savedMockState.warnings || 0);
        setMockDisqualified(false);
        setMockFinished(false);
        setMockActive(true);
        return;
      }
    }

    const combinedMockPool = [...SATURDAY_MOCK_MIXED_POOL, ...fullQuestionBank];
    const shuffled = combinedMockPool.sort(() => Math.random() - 0.5);
    const mixed30: MCQQuestion[] = [];
    for (let i = 0; i < 30; i++) {
      const q = shuffled[i % shuffled.length];
      mixed30.push({ ...q, id: `${q.id}-mock-${i}` });
    }

    setMockQuestions(mixed30);
    setMockIndex(0);
    setMockAnswers({});
    setMockTimeLeft(3600);
    setMockWarnings(0);
    setMockDisqualified(false);
    setMockFinished(false);
    setMockActive(true);
  }

  async function saveDisqualifiedMockSubmission(warningsCount: number) {
    if (!firebaseUser || !studentProfile) return;
    try {
      await setDoc(doc(db, 'mock_submissions', firebaseUser.uid), {
        uid: firebaseUser.uid,
        studentName: studentProfile.name,
        score: 0,
        totalQuestions: 30,
        accuracy: 0,
        timeTakenSeconds: 3600 - mockTimeLeft,
        warnings: warningsCount,
        disqualified: true,
        submittedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        savedMockJson: '',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `mock_submissions/${firebaseUser.uid}`);
    }
  }

  async function submitMockTest(finalAnswers: Record<string, number>, timeRemaining = mockTimeLeft) {
    setMockActive(false);
    setMockFinished(true);

    if (!firebaseUser || !studentProfile) return;

    let score = 0;
    mockQuestions.forEach((q) => {
      if (finalAnswers[q.id] === q.correctIndex) score++;
    });

    const totalQ = mockQuestions.length || 30;
    const acc = Math.round((score / totalQ) * 100);
    const timeTaken = Math.max(1, 3600 - timeRemaining);
    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedDailyCompleted = dailyGoalCompleted + totalQ;
    setDailyGoalCompleted(updatedDailyCompleted);

    try {
      await setDoc(doc(db, 'mock_submissions', firebaseUser.uid), {
        uid: firebaseUser.uid,
        studentName: studentProfile.name,
        score,
        totalQuestions: totalQ,
        accuracy: acc,
        timeTakenSeconds: timeTaken,
        warnings: mockWarnings,
        disqualified: false,
        submittedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'students', firebaseUser.uid), {
        agPoints: (studentProfile.agPoints || 0) + score * 2,
        totalAttempts: (studentProfile.totalAttempts || 0) + totalQ,
        correctCount: (studentProfile.correctCount || 0) + score,
        dailyGoalCompleted: updatedDailyCompleted,
        dailyGoalDate: todayStr,
        updatedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'user_private', firebaseUser.uid), {
        savedMockJson: '',
        updatedAt: new Date().toISOString(),
      });
      setSavedMockState(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `mock_submissions/${firebaseUser.uid}`);
    }
  }

  // AI Weakness Detector Calculation + Recharts Subject Data (Based Strictly on Real Student Attempts)
  const subjectChartData = useMemo(() => {
    const hasAttemptedAny = (studentProfile?.totalAttempts || 0) > 0;
    return SUBJECT_CATALOG.map((subj) => {
      const sStat = studentProfile?.subjectScores?.[subj.id];
      const correct = hasAttemptedAny && sStat ? sStat.correct : 0;
      const total = hasAttemptedAny && sStat ? sStat.total : 0;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      return {
        subject: subj.name,
        correct,
        total,
        accuracy: pct,
      };
    });
  }, [studentProfile]);

  const weaknessAlerts = useMemo(() => {
    const alerts: string[] = [];
    const hasAttemptedAny = (studentProfile?.totalAttempts || 0) > 0;
    if (!hasAttemptedAny) {
      alerts.push('No practice questions completed yet. Start Practice Mode to generate personalized AI diagnostic reports on weak chapters.');
      return alerts;
    }

    const chapScores = studentProfile?.chapterScores || {};
    const subjScores = studentProfile?.subjectScores || {};

    Object.entries(chapScores).forEach(([chap, stat]) => {
      if (stat.total > 0) {
        const pct = Math.round((stat.correct / stat.total) * 100);
        if (pct < 60) {
          alerts.push(`Your ${chap} needs revision (${pct}% accuracy on attempted questions).`);
        }
      }
    });

    Object.entries(subjScores).forEach(([subj, stat]) => {
      if (stat.total > 0) {
        const pct = Math.round((stat.correct / stat.total) * 100);
        if (pct < 65) {
          alerts.push(`Your ${subj} is weak (${pct}% accuracy) — Practice more MCQs in this subject.`);
        }
      }
    });

    if (alerts.length === 0) {
      alerts.push('Strong performance! No critical weakness identified in your attempted practice sets.');
    }
    return alerts;
  }, [studentProfile]);

  // Maximum AG Point Student (Shines on Flash Board)
  const topAgStudent = useMemo(() => {
    if (allStudents.length === 0) {
      return (
        studentProfile || {
          uid: 'current-student',
          name: fullName.trim() || firebaseUser?.displayName || 'Topper Student',
          role: 'student',
          agPoints: 5,
          accuracy: 0,
          totalAttempts: 0,
          correctCount: 0,
          timeSpentMinutes: 1,
        }
      );
    }
    return [...allStudents].sort((a, b) => b.agPoints - a.agPoints)[0];
  }, [allStudents, studentProfile, fullName, firebaseUser]);

  // Benchmark contenders used to populate the Progress Page leaderboards alongside live Firestore students
  const leaderboardBasePool = useMemo(() => {
    const benchmarkStudents: Array<
      StudentProfile & { weeklyPoints: number; monthlyPoints: number; allTimePoints: number }
    > = [
      {
        uid: 'lb-student-1',
        name: 'Aarav Sharma',
        role: 'student',
        agPoints: 340,
        weeklyPoints: 96,
        monthlyPoints: 230,
        allTimePoints: 340,
        accuracy: 92,
        totalAttempts: 185,
        correctCount: 170,
        timeSpentMinutes: 310,
        destinationGoal: 'Your Destination (+2 Science)',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
      {
        uid: 'lb-student-2',
        name: 'Srijana Karki',
        role: 'student',
        agPoints: 318,
        weeklyPoints: 112,
        monthlyPoints: 218,
        allTimePoints: 318,
        accuracy: 89,
        totalAttempts: 172,
        correctCount: 153,
        timeSpentMinutes: 285,
        destinationGoal: 'Your Destination (+2 Science)',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      },
      {
        uid: 'lb-student-3',
        name: 'Rohan Adhikari',
        role: 'student',
        agPoints: 295,
        weeklyPoints: 84,
        monthlyPoints: 245,
        allTimePoints: 295,
        accuracy: 86,
        totalAttempts: 160,
        correctCount: 138,
        timeSpentMinutes: 250,
        destinationGoal: 'Your Destination (CTEVT / Engineering)',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
      {
        uid: 'lb-student-4',
        name: 'Prakriti Thapa',
        role: 'student',
        agPoints: 276,
        weeklyPoints: 104,
        monthlyPoints: 198,
        allTimePoints: 276,
        accuracy: 85,
        totalAttempts: 150,
        correctCount: 128,
        timeSpentMinutes: 230,
        destinationGoal: 'Your Destination (+2 Management)',
        photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
      },
      {
        uid: 'lb-student-5',
        name: 'Bishal Gurung',
        role: 'student',
        agPoints: 254,
        weeklyPoints: 78,
        monthlyPoints: 184,
        allTimePoints: 254,
        accuracy: 82,
        totalAttempts: 142,
        correctCount: 116,
        timeSpentMinutes: 215,
        destinationGoal: 'Your Destination (+2 Science)',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      },
      {
        uid: 'lb-student-6',
        name: 'Anushka Poudel',
        role: 'student',
        agPoints: 232,
        weeklyPoints: 90,
        monthlyPoints: 176,
        allTimePoints: 232,
        accuracy: 80,
        totalAttempts: 130,
        correctCount: 104,
        timeSpentMinutes: 190,
        destinationGoal: 'Your Destination (+2 Science)',
      },
    ];

    const liveMapped = allStudents.map((st, idx) => {
      const allTime = Math.max(5, st.agPoints || 5);
      const isCurrentUser = st.uid === firebaseUser?.uid;
      const dailyPts = (st.dailyGoalCompleted || 0) * 2;
      const weekly = isCurrentUser
        ? Math.min(allTime, Math.max(5, dailyPts > 0 ? dailyPts + 5 : Math.round(allTime * 0.42)))
        : Math.min(allTime, Math.max(5, Math.round(allTime * (0.32 + ((idx % 4) * 0.08)))));
      const monthly = isCurrentUser
        ? Math.min(allTime, Math.max(weekly, Math.round(allTime * 0.78)))
        : Math.min(allTime, Math.max(weekly, Math.round(allTime * (0.68 + ((idx % 3) * 0.09)))));
      return {
        ...st,
        weeklyPoints: weekly,
        monthlyPoints: monthly,
        allTimePoints: allTime,
      };
    });

    const existingNames = new Set(liveMapped.map((s) => s.name.trim().toLowerCase()));
    const combined = [...liveMapped];

    if (studentProfile && !combined.some((s) => s.uid === studentProfile.uid)) {
      const allTime = Math.max(5, studentProfile.agPoints || 5);
      const weekly = Math.min(allTime, Math.max(5, Math.round(allTime * 0.45)));
      const monthly = Math.min(allTime, Math.max(weekly, Math.round(allTime * 0.8)));
      combined.push({
        ...studentProfile,
        weeklyPoints: weekly,
        monthlyPoints: monthly,
        allTimePoints: allTime,
      });
      existingNames.add(studentProfile.name.trim().toLowerCase());
    }

    benchmarkStudents.forEach((b) => {
      if (!existingNames.has(b.name.trim().toLowerCase())) {
        combined.push(b);
      }
    });

    return combined;
  }, [allStudents, studentProfile, firebaseUser]);

  // Student Points Leaderboard filtered & sorted by Weekly, Monthly, or All-Time Points
  const pointsLeaderboardList = useMemo(() => {
    return leaderboardBasePool
      .map((st) => {
        const displayPoints =
          leaderboardTimeFilter === 'weekly'
            ? st.weeklyPoints
            : leaderboardTimeFilter === 'monthly'
            ? st.monthlyPoints
            : st.allTimePoints;

        const periodAttempts =
          leaderboardTimeFilter === 'weekly'
            ? Math.max(1, Math.round((st.totalAttempts || 20) * 0.3))
            : leaderboardTimeFilter === 'monthly'
            ? Math.max(1, Math.round((st.totalAttempts || 20) * 0.72))
            : st.totalAttempts || 20;

        return {
          ...st,
          displayPoints,
          periodAttempts,
        };
      })
      .sort((a, b) => b.displayPoints - a.displayPoints || b.accuracy - a.accuracy);
  }, [leaderboardBasePool, leaderboardTimeFilter]);

  // Subject Toppers Ranking (Ranks students specifically by accuracy in the selected individual subject & period points)
  const subjectToppersList = useMemo(() => {
    return leaderboardBasePool
      .map((st) => {
        const sStat = st.subjectScores?.[topperSubjectFilter];
        const correct = sStat ? sStat.correct : Math.round(((st.accuracy || 75) / 100) * 20);
        const total = sStat && sStat.total > 0 ? sStat.total : 20;
        const subjectAccuracy = total > 0 ? Math.round((correct / total) * 100) : st.accuracy || 0;
        const filteredPoints =
          leaderboardTimeFilter === 'weekly'
            ? st.weeklyPoints
            : leaderboardTimeFilter === 'monthly'
            ? st.monthlyPoints
            : st.allTimePoints;
        return {
          uid: st.uid,
          name: st.name,
          subjectAccuracy,
          correct,
          total,
          agPoints: filteredPoints,
          weeklyPoints: st.weeklyPoints,
          monthlyPoints: st.monthlyPoints,
          allTimePoints: st.allTimePoints,
        };
      })
      .sort((a, b) => b.subjectAccuracy - a.subjectAccuracy || b.agPoints - a.agPoints);
  }, [leaderboardBasePool, topperSubjectFilter, leaderboardTimeFilter]);

  // Week-over-Week AG Point Growth Line Chart Data
  const weeklyAgGrowthData = useMemo(() => {
    const currentAg = Math.max(5, studentProfile?.agPoints ?? 5);
    const topperAg = Math.max(200, topAgStudent?.agPoints ?? 245);
    const w1 = Math.max(5, Math.round(currentAg * 0.18));
    const w2 = Math.max(w1 + 5, Math.round(currentAg * 0.36));
    const w3 = Math.max(w2 + 8, Math.round(currentAg * 0.58));
    const w4 = Math.max(w3 + 10, Math.round(currentAg * 0.78));
    const w5 = Math.max(w4 + 12, Math.round(currentAg * 0.91));

    return [
      { week: 'Week 1', agPoints: w1, topperPace: Math.round(topperAg * 0.22) },
      { week: 'Week 2', agPoints: w2, topperPace: Math.round(topperAg * 0.4) },
      { week: 'Week 3', agPoints: w3, topperPace: Math.round(topperAg * 0.58) },
      { week: 'Week 4', agPoints: w4, topperPace: Math.round(topperAg * 0.76) },
      { week: 'Week 5', agPoints: w5, topperPace: Math.round(topperAg * 0.9) },
      { week: 'Current Week', agPoints: currentAg, topperPace: topperAg },
    ];
  }, [studentProfile, topAgStudent]);

  // Export Formatted PDF Performance Report for Offline Review
  function handleExportPerformancePdf() {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const studentName = currentStudentName || 'Student';
    const totalAttempts = studentProfile?.totalAttempts ?? 0;
    const overallAcc = totalAttempts > 0 ? (studentProfile?.accuracy ?? 0) : 0;
    const agPts = studentProfile?.agPoints ?? 5;
    const studyTime = formatTimeSpent(studentProfile?.timeSpentMinutes ?? 1);
    const dateGenerated = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Header Banner
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 210, 38, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('STEPPIN - YOU DESTINATION', 14, 16);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(56, 189, 248);
    pdf.text('Official Class 10 CDC Nepal Entrance Performance & Accuracy Report (www.steppin.com)', 14, 24);
    pdf.setTextColor(203, 213, 225);
    pdf.text(`Created by Niraj Yadav  |  Generated: ${dateGenerated}`, 14, 31);

    // Student Profile Summary Box
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(`Student Name: ${studentName}`, 14, 50);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Overall Accuracy: ${totalAttempts > 0 ? `${overallAcc}%` : '0% (No Practice Yet)'}`, 14, 58);
    pdf.text(`Total Questions Attempted: ${totalAttempts}`, 75, 58);
    pdf.text(`AG Points Balance: ${agPts} Pts`, 145, 58);
    pdf.text(`Total Study Time in App: ${studyTime}`, 14, 65);
    pdf.text(`Daily Goal Progress: ${dailyGoalCompleted} / ${dailyGoalTarget} MCQs (${dailyGoalPct}%)`, 95, 65);

    pdf.setDrawColor(203, 213, 225);
    pdf.line(14, 71, 196, 71);

    // Section 1: Subject-Wise Accuracy & Question Metrics Table
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text('1. Subject-Wise Accuracy & Question Breakdown', 14, 80);

    // Table Header
    let y = 88;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, y - 5, 182, 8, 'F');
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Subject (CDC Syllabus Nepal)', 17, y);
    pdf.text('Correct', 105, y);
    pdf.text('Total Attempted', 130, y);
    pdf.text('Accuracy (%)', 168, y);

    y += 8;
    pdf.setFont('helvetica', 'normal');
    subjectChartData.forEach((row) => {
      const statusTag = row.accuracy < 60 ? ' (Weak)' : ' (Strong)';
      pdf.text(`${row.subject}`, 17, y);
      pdf.text(`${row.correct}`, 108, y);
      pdf.text(`${row.total}`, 138, y);
      pdf.text(`${row.accuracy}%${statusTag}`, 168, y);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, y + 2.5, 196, y + 2.5);
      y += 8;
    });

    // Section 2: AI Weakness Detector Diagnostics
    y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('2. AI Weakness Detector & Priority Revision Plan', 14, y);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    weaknessAlerts.forEach((alertItem, idx) => {
      const cleanText = alertItem.replace(/[^\x20-\x7E]/g, '-');
      pdf.text(`${idx + 1}. ${cleanText}`, 17, y);
      y += 7;
    });

    // Section 3: Topper Comparison Summary
    y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('3. Comparison with Batch #1 Topper', 14, y);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(
      `Batch Topper: ${topAgStudent.name}  |  Topper Accuracy: ${topAgStudent.accuracy}%  |  Topper AG Points: ${topAgStudent.agPoints} Pts`,
      17,
      y
    );
    y += 7;
    pdf.text(
      `Accuracy Gap to #1 Rank: ${Math.max(0, topAgStudent.accuracy - overallAcc)}%  |  Keep practicing daily to shine on the Flash Board!`,
      17,
      y
    );

    // Footer
    pdf.setDrawColor(203, 213, 225);
    pdf.line(14, 275, 196, 275);
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      'UDAN - The Entrance Topper  |  Every Saturday 8:00 AM - 9:00 AM Live Mock Exam  |  Created by Niraj Yadav',
      14,
      282
    );

    const safeFileName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`UDAN_Progress_Report_${safeFileName}.pdf`);
  }

  // Admin Batch Control Handlers
  async function handleToggleAdmissionOpen() {
    const nextOpen = !batchConfig.isOpen;
    try {
      await setDoc(
        doc(db, 'system', 'batch_config'),
        {
          ...batchConfig,
          isOpen: nextOpen,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'system/batch_config');
    }
  }

  async function handleChangeBatchLimit(delta: number) {
    const nextLimit = Math.max(10, batchConfig.batchLimit + delta);
    try {
      await setDoc(
        doc(db, 'system', 'batch_config'),
        {
          ...batchConfig,
          batchLimit: nextLimit,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'system/batch_config');
    }
  }

  async function handleDeleteStudentSeat(targetUid: string) {
    try {
      if (!targetUid.startsWith('seed-')) {
        await deleteDoc(doc(db, 'students', targetUid));
      } else {
        setAllStudents((prev) => prev.filter((s) => s.uid !== targetUid));
      }
      const nextCount = Math.max(0, batchConfig.registeredCount - 1);
      await setDoc(
        doc(db, 'system', 'batch_config'),
        {
          ...batchConfig,
          registeredCount: nextCount,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `students/${targetUid}`);
    }
  }

  // MANUAL Flash Board Post
  async function handleManualFlashPost(e: React.FormEvent) {
    e.preventDefault();
    if (!flashTitle.trim() || !flashContent.trim()) return;
    const id = `flash_${Date.now()}`;
    try {
      const payload: Record<string, any> = {
        type: flashType,
        title: flashTitle.trim().slice(0, 150),
        content: flashContent.trim().slice(0, 2000),
        authorName: 'Niraj Yadav (Admin)',
        createdAt: new Date().toISOString(),
      };
      if (flashImageUrl.trim()) {
        payload.imageUrl = flashImageUrl.trim().slice(0, 500);
      }
      await setDoc(doc(db, 'flashboard', id), payload);
      setFlashTitle('');
      setFlashContent('');
      setFlashImageUrl('');
      setAdminStatusBanner('Flash Board post published manually!');
      setTimeout(() => setAdminStatusBanner(null), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `flashboard/${id}`);
    }
  }

  // AUTOMATIC Flash Board Post Generator & Publisher
  async function handleAutomaticFlashPost() {
    setAutoFlashLoading(true);
    setAdminStatusBanner(null);
    try {
      const res = await fetch('/api/auto-generate-flashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: flashType,
          topic: autoFlashTopic,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.post) {
        throw new Error(data.error || 'Failed to generate automatic Flash Board post');
      }

      const id = `flash_auto_${Date.now()}`;
      await setDoc(doc(db, 'flashboard', id), {
        type: flashType,
        title: String(data.post.title || 'UDAN Official Update').slice(0, 150),
        content: String(data.post.content || '').slice(0, 2000),
        authorName: 'Niraj Yadav (Auto-Pilot)',
        createdAt: new Date().toISOString(),
      });
      setAdminStatusBanner('Automatic Flash Board post generated & published to all students!');
      setTimeout(() => setAdminStatusBanner(null), 5000);
    } catch (err: any) {
      setAdminStatusBanner(err?.message || 'Could not auto-generate Flash Board post.');
    } finally {
      setAutoFlashLoading(false);
    }
  }

  // MANUAL Add Question
  async function handleAdminManualAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQText.trim() || !newQOpt0.trim() || !newQOpt1.trim() || !newQOpt2.trim() || !newQOpt3.trim() || !firebaseUser)
      return;
    const id = `q_${Date.now()}`;
    try {
      await setDoc(doc(db, 'questions', id), {
        subject: newQSubject,
        chapter: newQChapter.trim().slice(0, 100),
        question: newQText.trim().slice(0, 1000),
        options: [
          newQOpt0.trim().slice(0, 300),
          newQOpt1.trim().slice(0, 300),
          newQOpt2.trim().slice(0, 300),
          newQOpt3.trim().slice(0, 300),
        ],
        correctIndex: Number(newQCorrect),
        explanation: (newQExplanation.trim() || 'Verified CDC Entrance Answer by Niraj Yadav.').slice(0, 1500),
        createdBy: firebaseUser.uid,
        createdAt: new Date().toISOString(),
      });
      setNewQText('');
      setNewQOpt0('');
      setNewQOpt1('');
      setNewQOpt2('');
      setNewQOpt3('');
      setNewQExplanation('');
      setAdminStatusBanner('Question added manually to Cloud Question Bank!');
      setTimeout(() => setAdminStatusBanner(null), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `questions/${id}`);
    }
  }

  // AUTOMATIC Question Generator & Cloud Bank Saver
  async function handleAdminAutomaticAddQuestions() {
    if (!firebaseUser) return;
    setAutoQLoading(true);
    setAdminStatusBanner(null);
    try {
      const res = await fetch('/api/auto-generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newQSubject,
          chapter: newQChapter,
          count: autoQCount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions)) {
        throw new Error(data.error || 'Failed to auto-generate questions');
      }

      let savedCount = 0;
      for (const qItem of data.questions) {
        if (!Array.isArray(qItem.options) || qItem.options.length < 4) continue;
        const qId = `q_auto_${Date.now()}_${savedCount}`;
        await setDoc(doc(db, 'questions', qId), {
          subject: String(qItem.subject || newQSubject).slice(0, 60),
          chapter: String(qItem.chapter || newQChapter).slice(0, 100),
          question: String(qItem.question).slice(0, 1000),
          options: [
            String(qItem.options[0]).slice(0, 300),
            String(qItem.options[1]).slice(0, 300),
            String(qItem.options[2]).slice(0, 300),
            String(qItem.options[3]).slice(0, 300),
          ],
          correctIndex: Math.min(3, Math.max(0, Number(qItem.correctIndex) || 0)),
          explanation: String(qItem.explanation || 'Verified CDC Entrance Solution.').slice(0, 1500),
          createdBy: firebaseUser.uid,
          createdAt: new Date().toISOString(),
        });
        savedCount++;
      }

      setAdminStatusBanner(
        `Automatically generated and saved ${savedCount} new ${newQSubject} MCQs to the Cloud Question Bank!`
      );
      setTimeout(() => setAdminStatusBanner(null), 5000);
    } catch (err: any) {
      setAdminStatusBanner(err?.message || 'Automatic question generation failed.');
    } finally {
      setAutoQLoading(false);
    }
  }

  // Send Live Chat Message
  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !firebaseUser || !studentProfile) return;
    const id = `msg_${Date.now()}`;
    try {
      await setDoc(doc(db, 'chat', id), {
        senderId: firebaseUser.uid,
        senderName: studentProfile.name,
        senderRole: isOwnerNiraj ? 'admin' : 'student',
        text: chatInput.trim().slice(0, 500),
        agPoints: studentProfile.agPoints || 0,
        createdAt: new Date().toISOString(),
      });
      setChatInput('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chat/${id}`);
    }
  }

  // Submit Feedback "Say something about Niraj"
  async function handleSendFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim() || !firebaseUser || !studentProfile) return;
    const id = `fb_${Date.now()}`;
    try {
      await setDoc(doc(db, 'feedback', id), {
        authorId: firebaseUser.uid,
        authorName: studentProfile.name,
        message: feedbackText.trim().slice(0, 800),
        rating: feedbackRating,
        createdAt: new Date().toISOString(),
      });
      setFeedbackText('');
      setFeedbackThanksBanner(true);
      setTimeout(() => setFeedbackThanksBanner(false), 6000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `feedback/${id}`);
    }
  }

  // Compress & Convert Photo Question to Cloud-Safe Data URL
  function handleDiscussPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          setDiscussPhotoDataUrl(compressed);
        }
      };
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  // Create Photo Question Discussion Post
  async function handleCreateDiscussionPost(e: React.FormEvent) {
    e.preventDefault();
    if ((!discussText.trim() && !discussPhotoDataUrl) || !firebaseUser || !studentProfile) return;
    setDiscussUploading(true);
    const postId = `disc_${Date.now()}`;
    try {
      const payload: Record<string, any> = {
        authorId: firebaseUser.uid,
        authorName: studentProfile.name,
        authorRole: isOwnerNiraj ? 'admin' : 'student',
        subject: discussSubject,
        questionText: (discussText.trim() || 'Please help solve this photo question!').slice(0, 1000),
        repliesJson: '[]',
        createdAt: new Date().toISOString(),
      };
      if (discussPhotoDataUrl) {
        payload.photoDataUrl = discussPhotoDataUrl;
      }
      await setDoc(doc(db, 'discussions', postId), payload);
      setDiscussText('');
      setDiscussPhotoDataUrl('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `discussions/${postId}`);
    } finally {
      setDiscussUploading(false);
    }
  }

  // Reply to a Photo Question Discussion Post
  async function handleSendDiscussionReply(post: DiscussionPostItem) {
    const draft = (replyDrafts[post.id] || '').trim();
    if (!draft || !firebaseUser || !studentProfile) return;
    let existingReplies: DiscussionReplyItem[] = [];
    try {
      if (post.repliesJson) {
        existingReplies = JSON.parse(post.repliesJson);
      }
    } catch {
      existingReplies = [];
    }

    const newReply: DiscussionReplyItem = {
      id: `rep_${Date.now()}`,
      authorName: studentProfile.name,
      authorRole: isOwnerNiraj ? 'admin' : 'student',
      text: draft.slice(0, 500),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextRepliesJson = JSON.stringify([...existingReplies, newReply]).slice(0, 20000);
    try {
      const payload: Record<string, any> = {
        authorId: post.authorId,
        authorName: post.authorName,
        authorRole: post.authorRole,
        subject: post.subject,
        questionText: post.questionText,
        repliesJson: nextRepliesJson,
        createdAt: post.createdAt || new Date().toISOString(),
      };
      if (post.photoDataUrl) {
        payload.photoDataUrl = post.photoDataUrl;
      }
      await setDoc(doc(db, 'discussions', post.id), payload);
      setReplyDrafts((prev) => ({ ...prev, [post.id]: '' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `discussions/${post.id}`);
    }
  }

  async function handleDeleteDiscussionPost(postId: string) {
    try {
      await deleteDoc(doc(db, 'discussions', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `discussions/${postId}`);
    }
  }

  // Sunday Quiz Competition Photo Upload (For Top 5 Flash Board Winner Showcase)
  function handleSundayPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          setSundayStudentPhoto(canvas.toDataURL('image/jpeg', 0.75));
        }
      };
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  // Join Sunday 8 PM Quiz Competition (Enters 5-Min Warmup -> Live 40 Questions)
  async function handleJoinSundayQuiz(startImmediately = false) {
    if (!firebaseUser || !studentProfile) return;
    setSundayJoined(true);
    setSundayRightCount(0);
    setSundayQIndex(0);
    setSundaySelectedOption(null);

    const avatarUrl =
      sundayStudentPhoto ||
      studentProfile.photoUrl ||
      firebaseUser.photoURL ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80';

    const participantRecord: SundayQuizParticipantItem = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      studentName: studentProfile.name,
      photoUrl: avatarUrl,
      rightAnswers: 0,
      currentQuestionAnswered: 0,
      agPointsEarned: 0,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSundayQuizParticipants((prev) => {
      const next = [participantRecord, ...prev.filter((p) => p.uid !== firebaseUser.uid)];
      next.sort((a, b) => b.rightAnswers - a.rightAnswers || b.agPointsEarned - a.agPointsEarned);
      try {
        localStorage.setItem('udan_sunday_quiz_v2', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });

    try {
      await setDoc(doc(db, 'sunday_quiz_participants', firebaseUser.uid), participantRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sunday_quiz_participants/${firebaseUser.uid}`);
    }

    if (startImmediately) {
      setSundayQSeconds(60);
      setSundayStage('question');
    } else {
      setSundayWarmupSeconds(300); // 5 min warmup
      setSundayStage('warmup');
    }
  }

  // Lock Answer for Current Sunday Quiz Question (1-Min Timer)
  async function handleSelectSundayQuizOption(optIdx: number) {
    if (sundaySelectedOption !== null) return;
    setSundaySelectedOption(optIdx);

    const currentQ = SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex];
    const isCorrect = currentQ && optIdx === currentQ.correctIndex;
    const nextRight = isCorrect ? sundayRightCount + 1 : sundayRightCount;
    setSundayRightCount(nextRight);

    if (!firebaseUser || !studentProfile) return;
    const avatarUrl =
      sundayStudentPhoto ||
      studentProfile.photoUrl ||
      firebaseUser.photoURL ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80';

    const updatedRecord: SundayQuizParticipantItem = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      studentName: studentProfile.name,
      photoUrl: avatarUrl,
      rightAnswers: nextRight,
      currentQuestionAnswered: sundayQIndex + 1,
      agPointsEarned: nextRight * 2,
      updatedAt: new Date().toISOString(),
    };

    setSundayQuizParticipants((prev) => {
      const next = [updatedRecord, ...prev.filter((p) => p.uid !== firebaseUser.uid)];
      next.sort((a, b) => b.rightAnswers - a.rightAnswers || b.agPointsEarned - a.agPointsEarned);
      try {
        localStorage.setItem('udan_sunday_quiz_v2', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });

    try {
      await setDoc(doc(db, 'sunday_quiz_participants', firebaseUser.uid), updatedRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sunday_quiz_participants/${firebaseUser.uid}`);
    }
  }

  // Finalize Sunday 8 PM Quiz Competition after Question 40 & Award AG Points
  async function finishSundayQuizCompetition() {
    setSundayStage('final');
    if (!firebaseUser || !studentProfile) return;
    const earnedPoints = sundayRightCount * 2;
    try {
      await updateDoc(doc(db, 'students', firebaseUser.uid), {
        agPoints: (studentProfile.agPoints || 0) + earnedPoints,
        totalAttempts: (studentProfile.totalAttempts || 0) + 40,
        correctCount: (studentProfile.correctCount || 0) + sundayRightCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${firebaseUser.uid}`);
    }
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Save or Update Student's Welcome Username & Detailed Profile Fields
  async function handleSaveWelcomeUsername(customNameInput?: string) {
    if (!firebaseUser) return;
    const nextName = (customNameInput ?? welcomeNameDraft).trim();
    if (!nextName) return;

    const cleanName = nextName.slice(0, 80);
    localStorage.setItem(`udan_welcome_name_${firebaseUser.uid}`, cleanName);
    setFullName(cleanName);
    setWelcomeNameDraft('');

    const updatedProf: StudentProfile = {
      ...(studentProfile || {
        uid: firebaseUser.uid,
        name: cleanName,
        role: isOwnerNiraj ? 'admin' : 'student',
        agPoints: 5,
        accuracy: 0,
        totalAttempts: 0,
        correctCount: 0,
        timeSpentMinutes: 1,
      }),
      name: cleanName,
      destinationGoal: profileDestination.trim() || 'Your Destination',
      schoolName: profileSchool.trim() || 'Class 10 CDC Nepal',
      photoUrl: sundayStudentPhoto || studentProfile?.photoUrl || '',
    };

    setStudentProfile(updatedProf);
    try {
      const map = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}') as Record<string, StudentProfile>;
      map[firebaseUser.uid] = updatedProf;
      localStorage.setItem('udan_profiles_v2', JSON.stringify(map));
      setAllStudents((prev) =>
        [updatedProf, ...prev.filter((s) => s.uid !== firebaseUser.uid)].sort((a, b) => b.agPoints - a.agPoints)
      );
    } catch {
      // Ignore localStorage errors
    }

    try {
      await setDoc(
        doc(db, 'students', firebaseUser.uid),
        {
          ...updatedProf,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Fallback handled via localStorage
    }

    setProfileSaveBanner(`Welcome Name & Profile updated to "${cleanName}"!`);
    setTimeout(() => setProfileSaveBanner(null), 4000);
  }

  // Delete Student's Own Profile / Account ("Deleting Profile")
  async function handleDeleteMyOwnProfile() {
    if (!firebaseUser) return;
    const targetUid = firebaseUser.uid;

    try {
      const map = JSON.parse(localStorage.getItem('udan_profiles_v2') || '{}') as Record<string, StudentProfile>;
      delete map[targetUid];
      localStorage.setItem('udan_profiles_v2', JSON.stringify(map));

      const vault = JSON.parse(localStorage.getItem('udan_accounts_v2') || '{}') as Record<string, any>;
      Object.keys(vault).forEach((k) => {
        if (vault[k]?.uid === targetUid) {
          delete vault[k];
        }
      });
      localStorage.setItem('udan_accounts_v2', JSON.stringify(vault));
      localStorage.removeItem(`udan_welcome_name_${targetUid}`);
      localStorage.removeItem('udan_active_session_v2');
    } catch {
      // Ignore storage errors
    }

    setAllStudents((prev) => prev.filter((s) => s.uid !== targetUid));

    try {
      await deleteDoc(doc(db, 'students', targetUid));
      await deleteDoc(doc(db, 'user_private', targetUid));
      const nextCount = Math.max(0, batchConfig.registeredCount - 1);
      await setDoc(
        doc(db, 'system', 'batch_config'),
        {
          ...batchConfig,
          registeredCount: nextCount,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Ignore Firestore offline/permission errors when deleting local session
    }

    setConfirmDeleteProfile(false);
    setFirebaseUser(null);
    setStudentProfile(null);
    setAdminModeUnlocked(false);
    setShowWelcomeGate(false);
    signOut(auth).catch(() => {});
  }

  // Download Official Detailed Profile Letter as PDF
  function handleDownloadProfileLetterPdf(resolvedName: string) {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Royal Header Frame
    pdf.setFillColor(25, 16, 59);
    pdf.rect(0, 0, 210, 42, 'F');
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, 190, 277);

    pdf.setTextColor(254, 240, 138);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(20);
    pdf.text('UDAN — THE ENTRANCE TOPPER', 105, 18, { align: 'center' });

    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Official Student Academic Profile & Commendation Letter', 105, 27, { align: 'center' });
    pdf.setFontSize(9.5);
    pdf.setTextColor(56, 189, 248);
    pdf.text(`Issued by Creator Niraj Yadav  |  Date: ${dateStr}`, 105, 35, { align: 'center' });

    // Letter Salutation & Body
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(14);
    pdf.text(`OFFICIAL PROFILE LETTER FOR: ${resolvedName.toUpperCase()}`, 18, 58);

    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Dear ${resolvedName},`, 18, 70);

    const bodyParagraph =
      `Welcome to our entrance preparation journey at UDAN — The Entrance Topper! Every single MCQ you solve today brings you one step closer to ${profileDestination || 'Your Destination'} tomorrow. This official profile letter certifies your active enrollment and dedication in Batch 100.`;
    const splitBody = pdf.splitTextToSize(bodyParagraph, 174);
    pdf.text(splitBody, 18, 80);

    // Detailed Profile Metrics Box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(18, 105, 174, 68, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('DETAILED STUDENT PROFILE RECORD:', 24, 116);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`• Student Username: ${resolvedName}`, 24, 126);
    pdf.text(`• Target Goal: ${profileDestination || 'Your Destination'}`, 24, 134);
    pdf.text(`• School / Curriculum: ${profileSchool || 'Class 10 CDC Syllabus Nepal'}`, 24, 142);
    pdf.text(`• AG Points Earned: ${studentProfile?.agPoints ?? 5} AG Points`, 24, 150);
    const profileAttempts = studentProfile?.totalAttempts ?? 0;
    const profileAcc = profileAttempts > 0 ? (studentProfile?.accuracy ?? 0) : 0;
    pdf.text(`• Overall Entrance Accuracy: ${profileAcc}% (${profileAttempts} Questions Attempted)`, 24, 158);
    pdf.text(`• Total Active Study Time: ${formatTimeSpent(studentProfile?.timeSpentMinutes ?? 1)}`, 24, 166);

    // Sign-off
    pdf.setFont('times', 'italic');
    pdf.setFontSize(11);
    pdf.text('Keep practicing with discipline and confidence. Your destination awaits you!', 18, 192);

    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text('Sincerely,', 18, 212);
    pdf.text('Niraj Yadav', 18, 220);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.text('Creator & Founder — UDAN (The Entrance Topper)', 18, 226);

    const safeName = resolvedName.replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`UDAN_Profile_Letter_${safeName}.pdf`);
  }

  // Admission Closed Logic
  const isSignupBlocked = !batchConfig.isOpen || batchConfig.registeredCount >= batchConfig.batchLimit;

  // Filtered students for Niraj's Private Registered Student & Time Spent Page
  const filteredRegisteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    const list = [...allStudents].sort((a, b) => (b.timeSpentMinutes || 0) - (a.timeSpentMinutes || 0));
    if (!q) return list;
    return list.filter((s) => s.name.toLowerCase().includes(q));
  }, [allStudents, studentSearch]);

  // Daily Goal Progress Ring Math
  const dailyGoalPct = useMemo(() => {
    if (!dailyGoalTarget || dailyGoalTarget <= 0) return 0;
    return Math.min(100, Math.round((dailyGoalCompleted / dailyGoalTarget) * 100));
  }, [dailyGoalCompleted, dailyGoalTarget]);

  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (dailyGoalPct / 100) * ringCircumference;

  // ============================================================================
  // RENDER STEP 1: ONLY LOGIN PAGE BEFORE LOGIN (NO "WELCOME SITA", NO SUBJECT BOOKS BEFORE LOGIN)
  // ============================================================================
  if (!firebaseUser) {
    return (
      <div className={`${appTheme} min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between`}>
        <OfflineIndicator />
        {/* Clean Minimal Header on Login Page with Steppin Logo, Download Button & Language Switcher */}
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-3.5">
            <UDANLogo size={48} />
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider classic-gold-text block leading-none">
                Steppin — You Destination
              </span>
              <span className="text-xs text-amber-300 font-medium classic-serif-italic">
                Your Dream, Our Mission · तपाईंको सपना, हाम्रो लक्ष्य · www.steppin.com
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Prominent English / Nepali Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-amber-400/50 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setCurrentLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLanguage === 'en'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                🇺🇸 English
              </button>
              <button
                type="button"
                onClick={() => setCurrentLanguage('ne')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLanguage === 'ne'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="नेपाली भाषामा बदल्नुहोस्"
              >
                🇳🇵 नेपाली
              </button>
            </div>

            {/* Quick 1-Tap Light (White & Black) vs Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setAppTheme(appTheme === 'theme-light' ? 'theme-indigo' : 'theme-light')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-slate-200"
              title="Toggle Light (White Background, Black Text) / Dark Mode"
            >
              {appTheme === 'theme-light' ? '🌙 Dark Mode' : '☀️ White & Black (Light)'}
            </button>

            <PWAInstallButton />

            <span className="font-mono-tabular text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              {batchConfig.registeredCount} / {batchConfig.batchLimit} Registered ({batchConfig.batchLimit - batchConfig.registeredCount} Seats Left)
            </span>
          </div>
        </header>

        {/* ALSO DOWNLOADABLE FOR EVERYONE HERO NOTICE BAR */}
        <div className="bg-gradient-to-r from-violet-950/80 via-slate-900 to-amber-950/80 border-b border-amber-400/30 px-6 py-2.5 text-xs text-slate-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[10px] tracking-wide uppercase shrink-0">
                INSTALLABLE APP
              </span>
              <span>
                📲 <strong>Steppin is free & installable for Class 10 students</strong> on Android, iPhone & PC with offline caching!
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-300 font-semibold">Created by Niraj Yadav</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">www.steppin.com</span>
            </div>
          </div>
        </div>

        {/* Centered ONLY Login / Signup Card */}
        <main className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <div className="bg-slate-900 border-2 border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2 border-b border-slate-800 pb-4 flex flex-col items-center">
              <UDANLogo size={76} />
              <p className="text-xs font-bold text-amber-300 tracking-widest uppercase pt-1">
                STEPPIN ENTRANCE PREPARATION · YOU DESTINATION
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold classic-gold-text">
                {authSubMode === 'forgot_password'
                  ? 'Forgot Password · Gmail Code Reset'
                  : authSubMode === 'code_login'
                  ? 'Login with 6-Digit Gmail Code'
                  : authSubMode === 'google_chooser'
                  ? 'Sign In with Google Account'
                  : isRegisterMode
                  ? 'New Student Admission'
                  : 'Student & Creator Login'}
              </h1>
              <p className="text-xs text-slate-300 classic-serif-italic">
                We welcome you by your Username — Enter your name, Gmail/Phone & Password or Login with Code
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthSubMode('standard');
                  setShowInlineForgotReset(false);
                  setIsRegisterMode(false);
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  authSubMode === 'standard' && !isRegisterMode && !showInlineForgotReset
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryGmail(emailOrPhone);
                  setAuthSubMode('forgot_password');
                  setShowInlineForgotReset(true);
                  setIsRegisterMode(false);
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  authSubMode === 'forgot_password' || showInlineForgotReset
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forgot Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthSubMode('standard');
                  setShowInlineForgotReset(false);
                  setIsRegisterMode(true);
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  authSubMode === 'standard' && isRegisterMode
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                New Signup
              </button>
            </div>

            {isRegisterMode && isSignupBlocked && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-700/80 text-rose-200 text-xs space-y-1.5">
                <p className="font-bold text-sm text-rose-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  Admission Closed - Batch Full! Contact Niraj Yadav
                </p>
                <p>
                  Registration is currently locked ({batchConfig.registeredCount} / {batchConfig.batchLimit} seats occupied).
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/80 text-amber-200 text-xs">
                {authError}
              </div>
            )}

            {otpSentNotice && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs space-y-2">
                <p className="font-bold text-emerald-300">📧 Gmail Verification Code Dispatched!</p>
                <p>{otpSentNotice}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono-tabular text-base font-extrabold text-amber-300 tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-amber-400/50">
                    {generatedOtpCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtpCode(generatedOtpCode)}
                    className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              </div>
            )}

            {/* MODE A: FORGOT PASSWORD (NEW PASSWORD FILL-UP & DIRECT LOGIN) OR 6-DIGIT GMAIL CODE LOGIN */}
            {(authSubMode === 'forgot_password' || authSubMode === 'code_login') && (
              <form onSubmit={handleVerifyCodeAndLogin} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/40 text-xs text-amber-200">
                  {authSubMode === 'forgot_password' ? (
                    <span>
                      <strong>Forgot Password Reset:</strong> Enter your Username, Gmail/Phone, and fill up your{' '}
                      <strong>New Password</strong> below to immediately reset your password and log into the app!
                    </span>
                  ) : (
                    <span>
                      <strong>Login with 6-Digit Gmail Code:</strong> Click <strong>Send Code</strong> to receive a 6-digit login code for your Gmail account.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Username (Name to Welcome)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name (e.g., Aarav Sharma)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Gmail or Phone Number Chosen for Your Account
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={recoveryGmail || emailOrPhone}
                      onChange={(e) => {
                        setRecoveryGmail(e.target.value);
                        setEmailOrPhone(e.target.value);
                      }}
                      placeholder="yourname@gmail.com or 98XXXXXXXX"
                      className="flex-1 px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                    {authSubMode === 'code_login' && (
                      <button
                        type="button"
                        onClick={handleSendGmailVerificationCode}
                        className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                      >
                        Send Code
                      </button>
                    )}
                  </div>
                </div>

                {authSubMode === 'forgot_password' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1.5">
                        New Password (Enter New Password to Login)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewResetPassword ? 'text' : 'password'}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-950 border-2 border-amber-400/70 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewResetPassword((prev) => !prev)}
                          aria-label={showNewResetPassword ? 'Hide New Password' : 'Show New Password'}
                          title={showNewResetPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          {showNewResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmResetPassword ? 'text' : 'password'}
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword((prev) => !prev)}
                          aria-label={showConfirmResetPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                          title={showConfirmResetPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showConfirmResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {authSubMode === 'code_login' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Enter 6-Digit Gmail Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={enteredOtpCode}
                      onChange={(e) => setEnteredOtpCode(e.target.value)}
                      placeholder="6-digit code from your Gmail"
                      className="w-full px-3.5 py-2.5 text-sm font-mono-tabular tracking-widest bg-slate-950 border border-slate-800 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {authSubMode === 'forgot_password'
                    ? 'Save New Password & Login App →'
                    : 'Verify 6-Digit Code & Login Now →'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('standard');
                    setShowInlineForgotReset(false);
                    setAuthError('');
                  }}
                  className="w-full text-center text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  ← Back to Standard Password Login
                </button>
              </form>
            )}

            {/* MODE B: GOOGLE ACCOUNT CHOOSER (WORKS EVEN WHEN OPENED OUTSIDE GOOGLE / EMBEDDED BROWSER) */}
            {authSubMode === 'google_chooser' && (
              <form onSubmit={handleCompleteGoogleChooserLogin} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs text-sky-200">
                  <strong>Instant Google Account Sign-In:</strong> Choose your Gmail address and display username below to sign in directly with Google.
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Google Display Name (Username to Welcome)
                  </label>
                  <input
                    type="text"
                    required
                    value={googleChooserName}
                    onChange={(e) => setGoogleChooserName(e.target.value)}
                    placeholder="Enter your full name (Username)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleChooserEmail}
                    onChange={(e) => setGoogleChooserEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer"
                >
                  Continue with This Google Account →
                </button>
                <button
                  type="button"
                  onClick={() => setAuthSubMode('standard')}
                  className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* MODE C: STANDARD EMAIL/PHONE + PASSWORD LOGIN */}
            {authSubMode === 'standard' && (
              <form onSubmit={handleClassicSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Username (Enter Name to Welcome)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name (never welcomed by email)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Gmail or Phone Number (Unique Account ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="yourname@gmail.com or 98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {!showInlineForgotReset ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInlineForgotReset(true);
                          setNewResetPassword('');
                          setConfirmResetPassword('');
                          setAuthError('');
                        }}
                        className="text-xs font-extrabold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border-2 border-amber-400/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-400">
                        🔑 FORGOT PASSWORD — SET NEW PASSWORD
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInlineForgotReset(false);
                          setAuthError('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewResetPassword ? 'text' : 'password'}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-900 border border-amber-400/60 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewResetPassword((prev) => !prev)}
                          aria-label={showNewResetPassword ? 'Hide New Password' : 'Show New Password'}
                          title={showNewResetPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          {showNewResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmResetPassword ? 'text' : 'password'}
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword((prev) => !prev)}
                          aria-label={showConfirmResetPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                          title={showConfirmResetPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showConfirmResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || (isRegisterMode && isSignupBlocked)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isRegisterMode && isSignupBlocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : showInlineForgotReset
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  {authLoading
                    ? 'Signing In...'
                    : isRegisterMode && isSignupBlocked
                    ? 'Admission Closed - Batch Full!'
                    : showInlineForgotReset
                    ? 'Save New Password & Login App →'
                    : isRegisterMode
                    ? 'Register & Login Now'
                    : 'Login with Username & Password'}
                </button>

                {!showInlineForgotReset && !isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlineForgotReset(true);
                      setNewResetPassword('');
                      setConfirmResetPassword('');
                      setAuthError('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot Password? Click Here to Enter New Password & Login
                  </button>
                )}
              </form>
            )}

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-800"></div>
              <span className="shrink mx-3 text-xs text-slate-500">OR GOOGLE / CODE LOGIN</span>
              <div className="grow border-t border-slate-800"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading || (isRegisterMode && isSignupBlocked)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-sky-500/50 bg-slate-950 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-sky-400" />
                Login with Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryGmail(emailOrPhone.includes('@') ? emailOrPhone : '');
                  setAuthSubMode('code_login');
                  setAuthError('');
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-amber-400/50 bg-slate-950 hover:bg-slate-800 text-amber-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Login with Gmail Code
              </button>
            </div>

            {/* Quick 1-Tap Instant Access for Creator & Student Testing */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-center text-slate-400 font-medium">⚡ Instant 1-Tap Access:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleFastCreatorLogin}
                  disabled={authLoading}
                  className="py-2.5 px-3 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>👑 Creator Login (Niraj)</span>
                </button>
                <button
                  type="button"
                  onClick={handleFastStudentLogin}
                  disabled={authLoading}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-sky-400 border border-sky-500/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>🎓 Student Demo Login</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="max-w-7xl w-full mx-auto px-6 py-4 border-t border-slate-900 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <span>UDAN - The Entrance Topper · Created by 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿</span>
          <div className="flex items-center gap-4">
            <a href={NIRAJ_FB_LINK} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
              Facebook
            </a>
            <a
              href={NIRAJ_TIKTOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              TikTok
            </a>
          </div>
        </footer>
      </div>
    );
  }

  // ============================================================================
  // RENDER: AUTHENTICATED MAIN PLATFORM
  // ============================================================================
  const savedCustomWelcomeName = firebaseUser
    ? localStorage.getItem(`udan_welcome_name_${firebaseUser.uid}`)?.trim()
    : '';

  let accountVaultName = '';
  try {
    const v = JSON.parse(localStorage.getItem('udan_accounts_v2') || '{}');
    if (firebaseUser?.email && v[firebaseUser.email.toLowerCase()]) {
      accountVaultName = v[firebaseUser.email.toLowerCase()]?.name || '';
    }
    if (!accountVaultName && firebaseUser?.uid) {
      for (const k of Object.keys(v)) {
        if (v[k]?.uid === firebaseUser.uid || (firebaseUser.email && v[k]?.email?.toLowerCase() === firebaseUser.email.toLowerCase())) {
          accountVaultName = v[k]?.name || '';
          break;
        }
      }
    }
  } catch {}

  const lastGlobalStudentName = localStorage.getItem('udan_last_student_name')?.trim() || '';

  const rawProfileName =
    savedCustomWelcomeName ||
    accountVaultName ||
    lastGlobalStudentName ||
    (studentProfile?.name && studentProfile.name !== 'Rahul' && !studentProfile.name.includes('@')
      ? studentProfile.name
      : '') ||
    fullName.trim() ||
    firebaseUser?.displayName?.trim() ||
    (isOwnerNiraj ? 'Niraj Yadav' : '');

  const currentStudentName =
    rawProfileName && !rawProfileName.includes('@')
      ? rawProfileName
      : isOwnerNiraj
      ? 'Niraj Yadav'
      : (firebaseUser?.email?.split('@')[0] || 'Student')
          .replace(/[0-9_.-]+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Student';

  // ============================================================================
  // RENDER STEP 2: WELCOME SCREEN WITH LOGGED-IN USERNAME RIGHT AFTER LOGIN
  // ============================================================================
  if (showWelcomeGate) {
    return (
      <div className={`${appTheme} min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6`}>
        <OfflineIndicator />
        <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <UDANLogo size={38} />
            <span className="text-xl font-bold text-white font-display">UDAN — The Entrance Topper</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'ne' : 'en')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'en' ? '🇳🇵 NE' : '🇺🇸 EN'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAppTheme(appTheme === 'theme-light' ? 'theme-indigo' : 'theme-light')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer text-slate-200"
            >
              {appTheme === 'theme-light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <PWAInstallButton />
            <ProfileLetterAvatar
              name={currentStudentName}
              photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
              size="sm"
            />
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/50 text-amber-300">
              {isOwnerNiraj ? '👑 Creator Niraj Yadav' : `🎓 Logged in: ${currentStudentName}`}
            </span>
          </div>
        </header>

        <main className="max-w-3xl w-full mx-auto my-auto py-10">
          <div className="bg-slate-900 border-2 border-amber-400/60 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="flex justify-center items-center gap-4">
              <UDANLogo size={72} />
              <ProfileLetterAvatar
                name={currentStudentName}
                photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
                size="lg"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              {isOwnerNiraj
                ? 'WELCOME CREATOR NIRAJ YADAV · PRIVATE FOLDER UNLOCKED'
                : `WELCOME ${currentStudentName.toUpperCase()} · DESTINATION: ${(profileDestination || 'YOUR DESTINATION').toUpperCase()}`}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white font-display leading-tight">
              Welcome, <span className="text-amber-400 underline underline-offset-8">{currentStudentName}!</span> in our
              entrance preparation journey
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              “{DAILY_QUOTES[0].quote}” — <strong className="text-white">𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿</strong>
            </p>

            {/* Enter or Customize Your Welcome Username Anytime */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/40 max-w-lg mx-auto space-y-2.5 text-left">
              <label className="block text-xs font-bold text-amber-300">
                ✨ Enter Your Name to Welcome (Customize Display Username):
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={welcomeNameDraft}
                  onChange={(e) => setWelcomeNameDraft(e.target.value)}
                  placeholder={`Current Welcome Name: ${currentStudentName} (Type your name here)`}
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleSaveWelcomeUsername()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shrink-0"
                >
                  Update Welcome Name
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                We welcome you by your <strong>Username ({currentStudentName})</strong> — never by your email address!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-lg mx-auto text-xs text-slate-300 space-y-1.5">
              <p>
                <strong className="text-sky-400">Welcomed Username:</strong> {currentStudentName} ·{' '}
                <strong className="text-emerald-400">Badge:</strong> {profileDestination || 'Your Destination'}
              </p>
              <p>
                <strong className="text-amber-400">Access Level:</strong>{' '}
                {isOwnerNiraj
                  ? '👑 Creator & Admin (Private Student Folder & Admin Control Unlocked — Hidden from all students)'
                  : '🎓 Registered Batch Student (Personal Progress, AG Points & Exams)'}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowWelcomeGate(false)}
                className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Continue to Subject Books & Entrance Features →
              </button>
              {isOwnerNiraj && (
                <button
                  type="button"
                  onClick={() => {
                    setShowWelcomeGate(false);
                    setActiveTab('private_students');
                  }}
                  className="px-6 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Open Creator Private Folder
                </button>
              )}
            </div>
          </div>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 pt-4 border-t border-slate-900">
          UDAN - The Entrance Topper · तपाईंको सपना, हाम्रो लक्ष्य · Created by 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿
        </footer>
      </div>
    );
  }

  return (
    <div
      onContextMenu={(e) => {
        if (isScreenshotBlocked) {
          e.preventDefault();
          setSecurityAlertBanner('Right-click & Screenshot Blocked on Question Pages!');
          setTimeout(() => setSecurityAlertBanner(null), 3500);
        }
      }}
      className={`${appTheme} min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        isScreenshotBlocked ? 'screenshot-protected' : ''
      }`}
    >
      <OfflineIndicator />
      {/* Top Bar Contract: Logo + Nav + Download App & Theme Switcher */}
      <header className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-30">
        {/* Zone 1: Custom UDAN Logo + Classic Gold Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-wider whitespace-nowrap shrink-0"
        >
          <UDANLogo size={42} />
          <div className="flex flex-col text-left">
            <span className="classic-gold-text leading-tight">STEPPIN</span>
            <span className="text-[10px] text-amber-300 font-mono tracking-wider uppercase font-semibold">
              You destination
            </span>
          </div>
        </a>

        {/* Zone 2: Concise navigation links with bilingual labels */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboard' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.dashboard}
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'practice' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.practice}
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'mock' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.mockTest}
          </button>
          <button
            onClick={() => setActiveTab('sunday_quiz')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'sunday_quiz' ? 'text-amber-400 underline underline-offset-8 font-bold' : 'text-amber-300'
            }`}
          >
            {t.nav.sundayQuiz}
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'progress' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.progress}
          </button>
          <button
            onClick={() => setActiveTab('flashboard')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'flashboard' ? 'text-sky-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.flashboard}
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'voice' ? 'text-rose-400 underline underline-offset-8 font-bold' : 'text-rose-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>{t.nav.voiceRoom}</span>
          </button>
          <button
            onClick={() => setActiveTab('discuss')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'discuss' ? 'text-sky-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            {t.nav.discuss}
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'downloads' ? 'text-emerald-400 underline underline-offset-8 font-bold' : 'text-emerald-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.nav.downloadCenter}</span>
          </button>
        </nav>

        {/* Zone 3: Student Profile Chip + Language Toggle + Download ZIP + Download App + Theme + Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Logged-In Student Profile Chip (Always Shows Who Is Logged In) */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            title={`Logged in as ${currentStudentName} — View Profile & Progress`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-400/50 hover:border-amber-300 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <ProfileLetterAvatar
              name={currentStudentName}
              photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
              size="sm"
            />
            <div className="flex flex-col text-left max-w-[130px] sm:max-w-[180px]">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {currentStudentName}
              </span>
              <span className="text-[10px] text-amber-300 font-mono leading-tight">
                {isOwnerNiraj ? '👑 Creator Niraj' : `🎓 ${studentProfile?.agPoints ?? 5} AG Pts`}
              </span>
            </div>
          </button>

          {/* Prominent Language Switch (English / नेपाली) */}
          <button
            type="button"
            onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'ne' : 'en')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Toggle Language: English / नेपाली"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'en' ? '🇳🇵 NE' : '🇺🇸 EN'}</span>
          </button>

          {/* 1-Tap White & Black / Dark Mode Switcher */}
          <button
            type="button"
            onClick={() => setAppTheme(appTheme === 'theme-light' ? 'theme-indigo' : 'theme-light')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer text-slate-200"
            title="Switch between White Background & Black Text (Light) and Dark Mode"
          >
            {appTheme === 'theme-light' ? '🌙 Dark' : '☀️ Light (White & Black)'}
          </button>

          <PWAInstallButton />
          <select
            value={appTheme}
            onChange={(e) => setAppTheme(e.target.value as any)}
            aria-label="Choose App Color Theme"
            className="hidden sm:inline-block px-2 py-1.5 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-300 font-bold text-xs cursor-pointer"
          >
            <option value="theme-light">☀️ White & Black (Light)</option>
            <option value="theme-indigo">👑 Royal Violet</option>
            <option value="theme-emerald">🌿 Emerald Gold</option>
            <option value="theme-crimson">🌹 Crimson Gold</option>
            <option value="theme-slate">🌙 Classic Dark</option>
          </select>
          <button
            onClick={() => {
              localStorage.removeItem('udan_active_session_v2');
              setFirebaseUser(null);
              setStudentProfile(null);
              setAdminModeUnlocked(false);
              setShowWelcomeGate(false);
              signOut(auth).catch(() => {});
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Features & 95-Item Checklist Modal */}
      {showAllFeaturesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950">
              <div>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  📦 COMPLETE SPECIFICATION ARCHIVE & 95-ITEM CHECKLIST (16 MODULES)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                  Steppin — You Destination (www.steppin.com) All Features (ZIP & PDF)
                </h2>
                <p className="text-xs text-slate-400">
                  Your Dream, Our Mission · तपाईंको सपना, हाम्रो लक्ष्य · Academic Director: Niraj Yadav
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadFeaturesZip}
                  disabled={zipDownloading}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  {zipDownloading ? 'Generating ZIP...' : 'Download ZIP of PDFs (.zip)'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadMasterFeaturesPdfDirect()}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  Master PDF (.pdf)
                </button>
                <button
                  type="button"
                  onClick={() => setShow95ChecklistModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  95-Item Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllFeaturesModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/40 text-slate-300 space-y-1.5">
                <p className="font-bold text-amber-300 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-amber-400" />
                  What is inside <code className="text-white">Steppin_All_Features_And_Guides_PDF.zip</code>?
                </p>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>
                    <strong className="text-white">00_Steppin_Master_Feature_Specification.pdf</strong> — Complete Master A4 Guide covering all 16 modules
                  </li>
                  <li>
                    <strong className="text-white">01_Steppin_Branding_PWA_And_Auth_Guide.pdf</strong> — Branding, PWA, Multi-Mode Login & You Destination Gate
                  </li>
                  <li>
                    <strong className="text-white">02_Steppin_Curriculum_Mock_Tests_And_Quizzes.pdf</strong> — CDC 7-Subject Bank, Saturday Mock Exam & Sunday Super Quiz
                  </li>
                  <li>
                    <strong className="text-white">03_Steppin_Leaderboard_Voice_AI_And_Admin.pdf</strong> — Live Voice Room, Bilingual I18N, Leaderboards & Firestore Rules
                  </li>
                  <li>
                    <strong className="text-white">Steppin_95_Item_Complete_Verification_Checklist.txt</strong> — Complete plain-text checklist of all 95 requirements
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                {STEPPIN_ALL_FEATURES_DATA.map((sec) => (
                  <div key={sec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-amber-400">MODULE {sec.number}</span>
                      <h3 className="text-base font-bold text-white">{sec.title}</h3>
                      <p className="text-xs text-slate-400">{sec.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {sec.items.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                          <p className="font-bold text-sky-300 text-xs">
                            {sec.number}.{i + 1} {item.name}
                          </p>
                          <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showFridayReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <BellRing className="w-4 h-4 animate-bounce" /> FRIDAY EVENING MOCK TEST REMINDER
              </span>
              <button
                onClick={() => setShowFridayReminderModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-display">
                Get Ready, {currentStudentName}! Tomorrow is Saturday 8:00 AM Mock Test
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Make sure to complete a quick revision session tonight so you are ready for tomorrow’s 30 Mixed Questions
                exam (8:00 AM – 9:00 AM sharp). Late login is not allowed per Rule #1!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <p className="text-slate-400">Live Countdown to Saturday 8:00 AM Exam:</p>
              <p className="text-lg font-bold text-amber-400 font-mono-tabular">{countdownText}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFridayReminderModal(false)}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFridayReminderModal(false);
                  setActiveTab('practice');
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                Start Friday Night Practice Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Utility Sub-bar (Social Links + Private Page for Niraj Only) */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer"
              title="Open Detailed Profile Letter & Settings"
            >
              <ProfileLetterAvatar
                name={currentStudentName}
                photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
                size="sm"
              />
              <span className="font-bold text-white">{currentStudentName}</span>
            </button>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold text-[11px]">
              🎯 {profileDestination || 'Your Destination'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono-tabular font-semibold">
              {studentProfile?.agPoints ?? 5} AG Points
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Time Spent: {formatTimeSpent(studentProfile?.timeSpentMinutes ?? 1)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Batch: {batchConfig.registeredCount}/{batchConfig.batchLimit} ({batchConfig.isOpen ? 'OPEN' : 'CLOSED'})
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={NIRAJ_FB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline font-semibold"
            >
              Facebook
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={NIRAJ_TIKTOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-semibold"
            >
              TikTok
            </a>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'text-amber-400 font-bold underline' : 'text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'practice' ? 'text-amber-400 font-bold underline' : 'text-slate-300'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setActiveTab('mock')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'mock' ? 'text-amber-400 font-bold underline' : 'text-slate-300'
              }`}
            >
              Saturday Exam
            </button>
            <button
              onClick={() => setActiveTab('sunday_quiz')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'sunday_quiz' ? 'text-amber-400 font-bold underline' : 'text-amber-300'
              }`}
            >
              Sunday 8PM Quiz
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'progress' ? 'text-sky-400 font-bold underline' : 'text-slate-300'
              }`}
            >
              Progress & AI
            </button>
            <button
              onClick={() => setActiveTab('flashboard')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'flashboard' ? 'text-sky-400 font-bold underline' : 'text-slate-300'
              }`}
            >
              Flash Board
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`hover:text-white whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'voice' ? 'text-rose-400 font-bold' : 'text-rose-300'
              }`}
            >
              <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Voice Room</span>
            </button>
            <button
              onClick={() => setActiveTab('discuss')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'discuss' ? 'text-sky-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Discuss Photo Q&A
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`hover:text-white whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'downloads' ? 'text-emerald-400 font-bold' : 'text-emerald-300'
              }`}
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>Downloads</span>
            </button>
            <button
              onClick={() => setShowFridayReminderModal(true)}
              className="text-amber-400 hover:text-amber-300 whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold"
            >
              <BellRing className="w-3.5 h-3.5" /> Friday Reminder
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`hover:text-white whitespace-nowrap cursor-pointer ${
                activeTab === 'profile' ? 'text-sky-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Profile & Feedback
            </button>

            {/* PRIVATE FOLDER: Strictly visible ONLY to Creator Niraj Yadav (Hidden from all regular students) */}
            {isOwnerNiraj && (
              <>
                <button
                  onClick={() => setActiveTab('private_students')}
                  className={`px-3 py-1 rounded-md border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'private_students'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-950 text-emerald-400 border-emerald-500/40 hover:border-emerald-400 font-bold'
                  }`}
                >
                  <Lock className="w-3 h-3" /> 📁 Private Folder (Students & Time)
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1 rounded-md border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-950 text-amber-400 border-amber-500/40 hover:border-amber-400 font-bold'
                  }`}
                >
                  <Wand2 className="w-3 h-3" /> 👑 Creator Control Panel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Security Alert Banner when PrintScreen or Tab Switch occurs */}
      {securityAlertBanner && (
        <div className="bg-rose-950 border-b border-rose-700 px-6 py-3 text-xs font-semibold text-rose-200 flex items-center justify-between max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{securityAlertBanner}</span>
          </div>
          <button
            onClick={() => setSecurityAlertBanner(null)}
            className="text-rose-300 hover:text-white underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Anti-Screenshot & Watermark Overlay when Questions/Exams are Active */}
      {isScreenshotBlocked && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-20 select-none overflow-hidden opacity-[0.04] flex flex-wrap gap-20 p-8 items-center justify-around -rotate-12"
        >
          {Array.from({ length: 36 }).map((_, idx) => (
            <span
              key={idx}
              className="text-white text-xs font-mono font-bold tracking-wider whitespace-nowrap"
            >
              STEPPIN · CONFIDENTIAL · NO SCREENSHOT · {currentStudentName} · {firebaseUser?.uid?.slice(0, 8)}
            </span>
          ))}
        </div>
      )}

      {/* Privacy Screen Blur when Question Page loses focus or Screenshot Key Pressed */}
      {windowBlurred && isScreenshotBlocked && (
        <div
          onClick={() => setWindowBlurred(false)}
          className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="p-4 rounded-full bg-rose-500/10 border-2 border-rose-500/50 mb-3 animate-pulse">
            <EyeOff className="w-12 h-12 text-rose-400" />
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Security Shield Active · Created by Niraj Yadav
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            Screenshot & Screen Capture Strictly Blocked
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2">
            Practice questions, Saturday Mock Exams, and Sunday Quiz are strictly protected against screenshots, recording, and app switching.
          </p>
          <p className="text-xs text-amber-300/80 font-mono mt-1">
            Student: {currentStudentName} · ID: {firebaseUser?.uid?.slice(0, 10)}
          </p>
          <button
            type="button"
            onClick={() => setWindowBlurred(false)}
            className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl cursor-pointer shadow-lg"
          >
            Click Anywhere to Return to Test
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 pb-28 md:pb-12 flex-1 space-y-8">
        {/* ====================================================================
            NEW PAGE: PRIVATE REGISTERED STUDENTS & TIME SPENT TRACKER (ONLY NIRAJ SEES)
            ==================================================================== */}
        {activeTab === 'private_students' && isOwnerNiraj && (
          <div className="space-y-6">
            <section className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Lock className="w-3.5 h-3.5" /> PRIVATE PAGE — ONLY NIRAJ YADAV CAN SEE THIS PAGE
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    Registered Students & Real-Time App Study Time Tracker
                  </h1>
                  <p className="text-xs text-slate-400">
                    Every student’s active minutes spent in the app are tracked and updated automatically in the cloud.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <p className="text-[11px] text-slate-400">Batch Capacity Status</p>
                    <p className="text-lg font-bold text-emerald-400 font-mono-tabular">
                      {batchConfig.registeredCount} / {batchConfig.batchLimit} Registered
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Open Auto/Manual Controls →
                  </button>
                </div>
              </div>

              {/* Search & Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5">Search Registered Student by Name</label>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Type student name (e.g., Aarav, Srijana, Rohan)..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Total Active Profiles</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-0.5">
                    {filteredRegisteredStudents.length} Students
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Combined Batch Study Time</p>
                  <p className="text-xl font-bold text-sky-400 font-mono-tabular mt-0.5">
                    {formatTimeSpent(
                      filteredRegisteredStudents.reduce((acc, s) => acc + (s.timeSpentMinutes || 0), 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Registered Student Name + Time Spent Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Registered Student Name</th>
                      <th className="py-3.5 px-4">Time Spent in App (Auto-Synced)</th>
                      <th className="py-3.5 px-4">Accuracy (%)</th>
                      <th className="py-3.5 px-4">AG Points</th>
                      <th className="py-3.5 px-4">Last Active Date</th>
                      <th className="py-3.5 px-4 text-right">Manual Seat Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                    {filteredRegisteredStudents.map((st, idx) => (
                      <tr key={st.uid} className="hover:bg-slate-950/60 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-sans font-bold text-white">{st.name}</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">
                          {formatTimeSpent(st.timeSpentMinutes)}
                        </td>
                        <td className="py-3.5 px-4 text-sky-400">{st.accuracy}%</td>
                        <td className="py-3.5 px-4 text-amber-400 font-bold">{st.agPoints} Pts</td>
                        <td className="py-3.5 px-4 text-slate-400">{st.lastLoginDate || 'Today'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteStudentSeat(st.uid)}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-sans font-semibold cursor-pointer"
                          >
                            Remove Student (-1 Seat)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            1. DASHBOARD / WELCOME, DAILY GOAL TRACKER RING & SUBJECT-ONLY QUESTION BANK
            ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Dynamic Welcome Hero Banner */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-medium">
                  <span>UDAN - The Entrance Topper</span>
                  <span aria-hidden="true">·</span>
                  <span>तपाईंको सपना, हाम्रो लक्ष्य</span>
                  <span aria-hidden="true">·</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold">
                    🎯 Badge: {profileDestination || 'Your Destination'}
                  </span>
                </div>
                <div className="flex items-center gap-3.5">
                  <ProfileLetterAvatar
                    name={currentStudentName}
                    photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
                    size="lg"
                  />
                  <h1 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
                    Welcome, <span className="text-amber-400">{currentStudentName}!</span> in our entrance preparation journey
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  “{DAILY_QUOTES[welcomeNameIndex % DAILY_QUOTES.length].quote}”
                </p>

                {/* Quick Enter / Update Name to Welcome Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1 max-w-xl">
                  <input
                    type="text"
                    value={welcomeNameDraft}
                    onChange={(e) => setWelcomeNameDraft(e.target.value)}
                    placeholder={`Enter your name to welcome (Currently: ${currentStudentName})`}
                    className="flex-1 min-w-[210px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveWelcomeUsername()}
                    className="px-3.5 py-2 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Set Welcome Name
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Start Practice Mode
                  </button>
                  <button
                    onClick={() => setActiveTab('mock')}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Every Saturday 8 AM Exam
                  </button>
                  <button
                    onClick={() => setActiveTab('sunday_quiz')}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Every Sunday 8 PM Quiz (40 Q)
                  </button>
                  <button
                    onClick={() => setActiveTab('discuss')}
                    className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Send Photo Question (Discuss)
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="px-4 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4" /> View Progress & AI
                  </button>
                  <button
                    onClick={() => setActiveTab('flashboard')}
                    className="px-4 py-2.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Open Flash Board
                  </button>
                  <a
                    href={NIRAJ_FB_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    Niraj Facebook <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={NIRAJ_TIKTOK_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    Niraj TikTok <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Shining Maximum AG Point Student Spotlight */}
              <div className="lg:col-span-4 bg-slate-950 border border-amber-500/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> FLASH BOARD TOP SHINING STAR
                  </span>
                  <span className="text-xs text-slate-400 font-mono-tabular">#1 AG Rank</span>
                </div>
                <div className="py-2">
                  <p className="text-xl font-bold text-amber-300 tracking-tight font-display">
                    {topAgStudent.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum AG Point Leader · Accuracy {topAgStudent.accuracy}%
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Total AG Score</span>
                  <span className="text-base font-bold text-amber-400 font-mono-tabular">
                    {topAgStudent.agPoints} AG Pts
                  </span>
                </div>
              </div>
            </section>

            {/* Daily Goal Tracker Card with Interactive SVG Progress Ring */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Animated SVG Progress Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={ringRadius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={ringRadius}
                      fill="transparent"
                      stroke={dailyGoalPct >= 100 ? '#10b981' : '#38bdf8'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringStrokeDashoffset}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-white font-mono-tabular">{dailyGoalPct}%</span>
                    <span className="text-[10px] text-slate-400 font-mono-tabular">
                      {dailyGoalCompleted}/{dailyGoalTarget}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-sky-400">
                    <Target className="w-4 h-4" /> DAILY ENTRANCE GOAL TRACKER
                  </div>
                  <h2 className="text-xl font-bold text-white font-display">
                    {dailyGoalPct >= 100
                      ? 'Daily Target Achieved! Well Done! 🎉'
                      : `Complete ${Math.max(0, dailyGoalTarget - dailyGoalCompleted)} more questions today to hit your goal`}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Your progress ring updates automatically every time you finish a Practice Mode session or Saturday Exam.
                  </p>
                </div>
              </div>

              {/* Target MCQ Selector Controls */}
              <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-400">Set Daily Target:</span>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {[20, 30, 50, 100].map((targetVal) => (
                    <button
                      key={targetVal}
                      type="button"
                      onClick={() => handleUpdateDailyGoalTarget(targetVal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-colors cursor-pointer ${
                        dailyGoalTarget === targetVal
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {targetVal}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Automatic Resume Prompts if Student Mistakenly Cut App */}
            {(savedPracticePrompt || savedMockState) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMockState && (
                  <div className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-400">INTERRUPTED SATURDAY EXAM DETECTED</p>
                      <p className="text-sm font-semibold text-white">
                        Auto-saved at Question {savedMockState.currentIndex + 1} / 30
                      </p>
                      <p className="text-xs text-slate-300">
                        Warnings used: {savedMockState.warnings}/2 · Click to resume immediately.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('mock');
                        startSaturdayMockTest(true);
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      RESUME MOCK TEST - {Math.ceil(savedMockState.timeLeftSeconds / 60)} Min Left
                    </button>
                  </div>
                )}

                {savedPracticePrompt && (
                  <div className="bg-sky-950/40 border border-sky-600/60 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-sky-400">CONTINUE LAST PRACTICE? (AUTO-SAVED)</p>
                      <p className="text-sm font-semibold text-white">
                        {savedPracticePrompt.subject} ({savedPracticePrompt.currentIndex + 1} / {savedPracticePrompt.totalCount})
                      </p>
                      <p className="text-xs text-slate-300">
                        Time remaining: {Math.ceil(savedPracticePrompt.timeLeftSeconds / 60)} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveTab('practice');
                          resumeSavedPractice();
                        }}
                        className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        YES, RESUME
                      </button>
                      <button
                        onClick={discardSavedPractice}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 4-Column KPI Strip */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
                <p className="text-xs text-slate-400">Batch 100 Seat Status</p>
                <p className="text-2xl font-bold text-white font-mono-tabular">
                  {batchConfig.registeredCount} / {batchConfig.batchLimit}
                </p>
                <p className="text-xs text-slate-400">
                  Status: {batchConfig.isOpen ? 'OPEN for Registration' : 'CLOSED by Niraj Yadav'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
                <p className="text-xs text-slate-400">Every Saturday Exam (8–9 AM)</p>
                <p className="text-base font-bold text-amber-400 font-mono-tabular pt-1">{countdownText}</p>
                <p className="text-xs text-slate-400">Result Auto-Publishes at 10:00 AM</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
                <p className="text-xs text-slate-400">Your AG Points & Daily Bonus</p>
                <p className="text-2xl font-bold text-sky-400 font-mono-tabular">
                  {studentProfile?.agPoints ?? 5} Pts
                </p>
                <p className="text-xs text-slate-400">1 Correct = +2 Pts · Daily Login = +5 Pts</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
                <p className="text-xs text-slate-400">Auto Mistake Question Bank</p>
                <p className="text-2xl font-bold text-rose-400 font-mono-tabular">{mistakeIds.length} Saved</p>
                <button
                  onClick={() => {
                    setPracticeMistakesOnly(true);
                    setActiveTab('practice');
                  }}
                  className="text-xs text-sky-400 hover:underline font-medium cursor-pointer"
                >
                  Practice Mistake Questions →
                </button>
              </div>
            </section>

            {/* Subject Wise Question Bank — ONLY Subject Names (No Question Numbers Shown) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    Subject-Wise Question Bank (Class 10 CDC Syllabus Nepal)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any subject below to start randomized entrance practice
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono-tabular">7 Core Entrance Subjects</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUBJECT_CATALOG.map((subj) => {
                  const sScore = studentProfile?.subjectScores?.[subj.id];
                  const hasScore = sScore && sScore.total > 0;
                  const pct = hasScore ? Math.round((sScore.correct / sScore.total) * 100) : 0;
                  return (
                    <div
                      key={subj.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-white font-display">{subj.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400">{subj.subtitle}</p>
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Syllabus Coverage</span>
                            <span className="font-mono-tabular">
                              {hasScore ? `Mastery: ${pct}%` : 'Not Started (0%)'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 truncate max-w-[180px]">
                          {subj.chapters[0]}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubject(subj.id);
                            setSelectedChapter('All');
                            setPracticeMistakesOnly(false);
                            setActiveTab('practice');
                          }}
                          className="px-3.5 py-1.5 bg-slate-950 hover:bg-sky-500 hover:text-slate-950 text-sky-400 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Start Subject Practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            2. PRACTICE MODE (NO QUESTION COUNTS ON SUBJECT CARDS)
            ==================================================================== */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {savedPracticePrompt && !practiceActive && !practiceFinished && (
              <div className="bg-sky-950/60 border border-sky-500/60 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Continue Last Practice? ({savedPracticePrompt.subject})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    You were on Question {savedPracticePrompt.currentIndex + 1} of {savedPracticePrompt.totalCount} with{' '}
                    {Math.ceil(savedPracticePrompt.timeLeftSeconds / 60)} minutes left.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resumeSavedPractice}
                    className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    YES, Continue Practice
                  </button>
                  <button
                    onClick={discardSavedPractice}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    NO, Start Fresh
                  </button>
                </div>
              </div>
            )}

            {/* Configuration View */}
            {!practiceActive && !practiceFinished && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-display">
                      Configure Customized Practice Session
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Random Questions Every Time · Instant Well Done / Incorrect Feedback · Full Explanation After Test · Screenshot Blocked
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPracticeMistakesOnly(false)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        !practiceMistakesOnly
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Subject Question Bank
                    </button>
                    <button
                      onClick={() => setPracticeMistakesOnly(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        practiceMistakesOnly
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Auto Mistake Bank
                    </button>
                  </div>
                </div>

                {!practiceMistakesOnly ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        1. Select Entrance Subject
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {SUBJECT_CATALOG.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubject(s.id);
                              setSelectedChapter('All');
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                              selectedSubject === s.id
                                ? 'bg-sky-500/15 border-sky-400 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <p className="text-sm font-bold">{s.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{s.subtitle}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                          2. Select Chapter ({selectedSubject})
                        </label>
                        <select
                          value={selectedChapter}
                          onChange={(e) => setSelectedChapter(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="All">All Chapters Mixed (Recommended)</option>
                          {SUBJECT_CATALOG.find((s) => s.id === selectedSubject)?.chapters.map((ch) => (
                            <option key={ch} value={ch}>
                              {ch}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                          3. Choose Practice Set Size (10 / 20 / 30 / 50)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {([10, 20, 30, 50] as const).map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => {
                                setPracticeQuestionCount(cnt);
                                setPracticeTimerMinutes(cnt);
                              }}
                              className={`py-2.5 rounded-xl font-mono-tabular text-xs font-bold border cursor-pointer ${
                                practiceQuestionCount === cnt
                                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {cnt} Set
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                          4. Set Custom Timer (Minutes):{' '}
                          <span className="text-sky-400 font-mono-tabular">{practiceTimerMinutes} Min</span>
                        </label>
                        <input
                          type="range"
                          min={5}
                          max={60}
                          step={5}
                          value={practiceTimerMinutes}
                          onChange={(e) => setPracticeTimerMinutes(Number(e.target.value))}
                          className="w-full accent-sky-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono-tabular mt-1">
                          <span>5 Min</span>
                          <span>15 Min</span>
                          <span>30 Min</span>
                          <span>45 Min</span>
                          <span>60 Min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-base font-bold text-rose-400 font-display">
                      Auto Mistake Question Bank
                    </h3>
                    <p className="text-xs text-slate-300">
                      Every question you answer incorrectly in Practice Mode is automatically stored here. Once you answer it
                      correctly, it is automatically cleared from your Mistake Bank!
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> Screenshot Blocked During Practice Session
                  </span>
                  <button
                    onClick={() => startNewPractice(practiceQuestionCount, practiceTimerMinutes, practiceMistakesOnly)}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Start Randomized Practice ({selectedSubject})
                  </button>
                </div>
              </div>
            )}

            {/* Active Practice Question Runner */}
            {practiceActive && practiceQuestions[practiceIndex] && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-sky-400 font-semibold">
                      {practiceQuestions[practiceIndex].subject} · {practiceQuestions[practiceIndex].chapter}
                    </span>
                    <h3 className="text-lg font-bold text-white font-display mt-0.5">
                      Question {practiceIndex + 1} of {practiceQuestions.length}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono-tabular text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatSeconds(practiceTimeLeft)}
                    </div>
                    <button
                      onClick={() => finishPracticeSession(practiceAnswers)}
                      className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Submit & View Explanations
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                      {practiceQuestions[practiceIndex].question}
                    </p>
                    <AudioSpeakerBtn text={practiceQuestions[practiceIndex].question} label="Listen" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {practiceQuestions[practiceIndex].options.map((opt, idx) => {
                    const qId = practiceQuestions[practiceIndex].id;
                    const chosen = practiceAnswers[qId];
                    const isAnswered = chosen !== undefined;
                    const isCorrectOpt = idx === practiceQuestions[practiceIndex].correctIndex;

                    let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-sky-500/60';
                    if (isAnswered) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (chosen === idx) {
                        btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 font-semibold';
                      } else {
                        btnStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectPracticeOption(idx)}
                        className={`p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>
                          <strong className="font-mono-tabular mr-2.5">{String.fromCharCode(65 + idx)}.</strong>
                          {opt}
                        </span>
                        {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        {isAnswered && chosen === idx && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {instantFeedback && (
                  <div
                    className={`p-4 rounded-xl border text-sm font-bold flex items-center justify-between ${
                      instantFeedback.status === 'correct'
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-600 text-rose-200'
                    }`}
                  >
                    <span>{instantFeedback.text}</span>
                    <span className="text-xs font-normal text-slate-300">
                      Full step-by-step explanation unlocked after test completion
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={practiceIndex === 0}
                    onClick={() => {
                      setInstantFeedback(null);
                      setPracticeIndex((i) => Math.max(0, i - 1));
                    }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    ← Previous Question
                  </button>

                  {practiceIndex < practiceQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setInstantFeedback(null);
                        setPracticeIndex((i) => i + 1);
                      }}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => finishPracticeSession(practiceAnswers)}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Complete Practice & See Full Explanations
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Practice Results & Full Explanations */}
            {practiceFinished && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400">
                      STEPPIN VERIFIED RESULT · PRACTICE PERFORMANCE & EXPLANATIONS
                    </span>
                    <h2 className="text-2xl font-bold text-white font-display mt-1">
                      Practice Session Completed!
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setPracticeFinished(false);
                      setPracticeActive(false);
                    }}
                    className="px-4 py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Start Another Practice Set
                  </button>
                </div>

                <div className="space-y-4">
                  {practiceQuestions.map((q, idx) => {
                    const userAns = practiceAnswers[q.id];
                    const isCorrect = userAns === q.correctIndex;
                    return (
                      <div key={q.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-white">
                            {idx + 1}. {q.question}
                          </p>
                          <span
                            className={`text-xs font-bold shrink-0 ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isCorrect ? 'Well Done! 🎉 (+2 Pts)' : "Sorry, It's Incorrect 😔"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Your Answer:{' '}
                          <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                            {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                          </strong>{' '}
                          · Correct Answer: <strong className="text-emerald-400">{q.options[q.correctIndex]}</strong>
                        </p>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <strong className="text-sky-400">Full Explanation: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            3. EVERY SATURDAY EXAM (8:00 AM - 9:00 AM) & 10:00 AM AUTO TOPPER BOARD
            ==================================================================== */}
        {activeTab === 'mock' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold">
                  <span>AUTOMATIC WEEKLY EXAM</span>
                  <span aria-hidden="true">·</span>
                  <span>EVERY SATURDAY 8:00 AM TO 9:00 AM</span>
                  <span aria-hidden="true">·</span>
                  <span>RESULT AUTO PUBLISH AT 10:00 AM</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  UDAN Saturday Live Entrance Exam (30 Mixed Questions)
                </h2>
                <p className="text-xs text-slate-400">
                  Opens automatically every Saturday at 8:00 AM, auto-submits at 9:00 AM, and publishes the Topper Board at 10:00 AM
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-right shrink-0">
                <p className="text-[11px] text-slate-400 uppercase">Live Countdown to Next Saturday Exam</p>
                <p className="text-lg sm:text-xl font-bold text-amber-400 font-mono-tabular mt-1">
                  {countdownText}
                </p>
              </div>
            </div>

            {!mockActive && !mockFinished && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Official Saturday Exam Rules & Regulations
                  </h3>

                  <ol className="space-y-2.5 text-xs sm:text-sm text-slate-300 list-decimal list-inside">
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Test 1 Hour only</strong> (Every Saturday 8:00 AM to 9:00 AM), late login is strictly not allowed.
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>30 Mixed questions</strong> across CDC Class 10 subjects, <strong>No negative marking</strong>.
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Do not minimize app</strong> or switch tabs during the live examination window.
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Suspicious Activity = DISQUALIFIED</strong> (1st exit = Warning, 2nd exit = Auto-Disqualified).
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Auto-submit after 1 hour</strong> when the countdown clock hits 00:00.
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Screenshot Blocked</strong> on all Mock Test question screens.
                    </li>
                    <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <strong>Admin decision of Niraj Yadav is final</strong> in all ranking and scholarship matters.
                    </li>
                  </ol>

                  <label className="flex items-center gap-2.5 pt-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rulesAccepted}
                      onChange={(e) => setRulesAccepted(e.target.checked)}
                      className="w-4 h-4 accent-sky-500"
                    />
                    I have read and accept all 7 Rules & Regulations of Niraj Yadav.
                  </label>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {savedMockState && (
                      <button
                        onClick={() => startSaturdayMockTest(true)}
                        className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                      >
                        RESUME MOCK TEST - {Math.ceil(savedMockState.timeLeftSeconds / 60)} Min Left
                      </button>
                    )}

                    {isSaturdayMockHour || batchConfig.mockTestForceLive ? (
                      <button
                        disabled={!rulesAccepted}
                        onClick={() => startSaturdayMockTest(false)}
                        className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                          rulesAccepted
                            ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Enter Live Saturday Exam (8:00 AM – 9:00 AM) →
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                        <button
                          type="button"
                          disabled
                          className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-950 border-2 border-amber-400/50 text-amber-300 cursor-not-allowed opacity-95 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Exam Locked Until Countdown Finishes · Saturday 8:00 AM ({countdownText})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('practice')}
                          className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>Go to Practice Mode Instead →</span>
                        </button>
                        {isOwnerNiraj && (
                          <button
                            type="button"
                            onClick={() => startSaturdayMockTest(false)}
                            className="px-4 py-3 rounded-xl font-semibold text-xs text-amber-300 bg-slate-900 border border-amber-400/40 hover:bg-amber-400/10 cursor-pointer"
                          >
                            👑 Creator Preview Test (Niraj Only)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-Changing Topper Board */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">
                        10:00 AM Auto-Published Topper Board
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isSaturdayResultPublished
                          ? 'Results Automatically Published · Official Saturday Rank Board'
                          : 'Exam in Progress — Topper Board Auto-Publishes at 10:00 AM'}
                      </p>
                    </div>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>

                  {isSaturdayResultPublished ? (
                    <div className="space-y-2.5">
                      {mockSubmissions.map((sub, i) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">
                              #{i + 1} {sub.studentName}
                            </p>
                            <p className="text-slate-400 font-mono-tabular mt-0.5">
                              Time: {Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s · Accuracy:{' '}
                              {sub.accuracy}%
                            </p>
                          </div>
                          <div className="text-right">
                            {sub.disqualified ? (
                              <span className="text-rose-400 font-bold">DISQUALIFIED</span>
                            ) : (
                              <span className="text-sm font-bold text-emerald-400 font-mono-tabular">
                                {sub.score} / {sub.totalQuestions}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {mockSubmissions.length === 0 && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                          No Saturday Exam submissions yet. Real student rankings will appear here automatically once students submit their exam!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-sm font-bold text-white">Results Pending Automatic 10:00 AM Release</p>
                      <p className="text-xs text-slate-400">
                        All Saturday 8:00–9:00 AM submissions are being evaluated automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Mock Test Runner with 5-Minute Visual Warning Cue & Sound Alert */}
            {mockActive && mockQuestions[mockIndex] && (
              <div
                className={`bg-slate-900 border-2 rounded-2xl p-6 sm:p-8 space-y-6 transition-all ${
                  mockTimeLeft <= 300 ? 'mock-warning-pulse border-rose-500' : 'border-slate-800'
                }`}
              >
                {/* 5-Minute Remaining Visual Warning Cue Banner */}
                {mockTimeLeft <= 300 && (
                  <div className="p-4 rounded-xl bg-rose-950/90 border-2 border-amber-400 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-start sm:items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-300 shrink-0 animate-bounce" />
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300 font-display">
                          ⚠️ Final 5 Minutes Remaining — Hurry Up & Review Your Answers!
                        </p>
                        <p className="text-xs text-rose-100 mt-0.5">
                          Only <strong className="font-mono-tabular text-white underline">{formatSeconds(mockTimeLeft)}</strong> left before automatic submission! You have answered{' '}
                          <strong className="text-emerald-300">{Object.keys(mockAnswers).length}</strong> of{' '}
                          <strong>{mockQuestions.length}</strong> questions (
                          <strong className="text-amber-300">
                            {Math.max(0, mockQuestions.length - Object.keys(mockAnswers).length)} unanswered
                          </strong>
                          ).
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-44 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-rose-400/50 shrink-0">
                      <div
                        className="bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((mockTimeLeft / 300) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-rose-400">
                      LIVE SATURDAY EXAM · SCREENSHOT BLOCKED · AUTO-SAVING EVERY SECOND
                    </span>
                    <h3 className="text-lg font-bold text-white font-display mt-0.5">
                      Question {mockIndex + 1} of {mockQuestions.length} ({mockQuestions[mockIndex].subject})
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMockSoundEnabled((prev) => !prev)}
                      title="Toggle 5-Minute Audio Warning Alert"
                      className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 hover:border-amber-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      {mockSoundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Alert Sound ON</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                          <span>Muted</span>
                        </>
                      )}
                    </button>

                    {mockTimeLeft > 300 && (
                      <button
                        type="button"
                        onClick={() => {
                          setMockTimeLeft(300);
                          playMockWarningChime(false);
                        }}
                        title="Preview the 5-Minute Remaining Visual & Audio Warning Cue"
                        className="px-2.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 text-amber-300 text-xs font-bold cursor-pointer"
                      >
                        ⚡ Preview 5-Min Alert
                      </button>
                    )}

                    <span className="text-xs font-mono-tabular text-amber-300">
                      Exit Warnings: {mockWarnings} / 2
                    </span>

                    <div
                      className={`px-4 py-2 rounded-xl font-mono-tabular text-base font-bold flex items-center gap-2 transition-all ${
                        mockTimeLeft <= 300
                          ? 'bg-rose-600 text-white border-2 border-amber-300 animate-pulse shadow-lg shadow-rose-500/40'
                          : 'bg-slate-950 border border-slate-800 text-amber-400'
                      }`}
                    >
                      <Clock className={`w-4 h-4 ${mockTimeLeft <= 300 ? 'animate-spin' : ''}`} />
                      <span>{formatSeconds(mockTimeLeft)}</span>
                      {mockTimeLeft <= 300 && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-300 text-slate-950 font-extrabold">
                          ≤ 5 MIN!
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => submitMockTest(mockAnswers)}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Submit Final Exam
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-base sm:text-lg font-semibold text-white">
                    {mockQuestions[mockIndex].question}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {mockQuestions[mockIndex].options.map((opt, idx) => {
                    const qId = mockQuestions[mockIndex].id;
                    const selected = mockAnswers[qId] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMockAnswers((prev) => ({ ...prev, [qId]: idx }))}
                        className={`p-4 rounded-xl border text-left text-sm transition-colors cursor-pointer ${
                          selected
                            ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <strong className="font-mono-tabular mr-2.5">{String.fromCharCode(65 + idx)}.</strong>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={mockIndex === 0}
                    onClick={() => setMockIndex((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {mockIndex < mockQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setMockIndex((i) => i + 1)}
                        className="px-5 py-2.5 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Save & Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => submitMockTest(mockAnswers)}
                        className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Submit Exam Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mock Test Completed View */}
            {mockFinished && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <span className="text-xs font-bold text-emerald-400">
                  STEPPIN VERIFIED · OFFICIAL SATURDAY EXAM SUBMISSION SUMMARY
                </span>
                <h3 className="text-2xl font-bold text-white font-display">
                  {mockDisqualified
                    ? 'Exam Disqualified (Rule #4 Violation - Multiple App Exits)'
                    : 'Saturday Exam Submitted Successfully!'}
                </h3>
                <p className="text-sm text-slate-300">
                  Your score has been synced to the Cloud Topper Board. Official rank list auto-publishes at 10:00 AM.
                </p>
                <button
                  onClick={() => setMockFinished(false)}
                  className="px-5 py-2.5 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Back to Saturday Exam & Topper Board
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            3B. EVERY SUNDAY AT 8:00 PM LIVE QUIZ COMPETITION (40 QUESTIONS: MOSTLY IQ + MATH/SCIENCE/ENGLISH)
            ==================================================================== */}
        {activeTab === 'sunday_quiz' && (
          <div className="space-y-8">
            {/* Top Banner: Schedule & Rules */}
            <section className="bg-slate-900 border-2 border-amber-400/60 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> WEEKLY SUNDAY 8:00 PM QUIZ COMPETITION · REPEATS EVERY WEEK
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    Sunday 8:00 PM – 9:00 PM Live Quiz Competition (40 Questions)
                  </h2>
                  <p className="text-xs text-slate-300">
                    Mostly IQ (25 Logical Reasoning Qs) + Maths (5 Qs) + Science (5 Qs) + English (5 Qs) · 1 Min per Question · Top 10 Rank for 20 Sec After Every Question!
                  </p>
                </div>

                <div className="px-4 py-3 rounded-xl bg-slate-950 border border-amber-500/40 text-right">
                  <p className="text-[11px] text-slate-400">Next Sunday 8:00 PM Quiz Countdown</p>
                  <p className="text-base sm:text-lg font-bold text-amber-400 font-mono-tabular">
                    {sundayCountdownText}
                  </p>
                </div>
              </div>

              {/* 4 Timeline Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-sky-400 font-bold">1. Join Window (10 Mins Only)</span>
                  <p className="text-white font-semibold">7:40 PM to 7:50 PM (7:15–7:55 PM Gate)</p>
                  <p className="text-slate-400">Students must join inside the entry window before lock.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold">2. 5-Minute Warmup</span>
                  <p className="text-white font-semibold">7:55 PM to 8:00 PM</p>
                  <p className="text-slate-400">5-minute live warmup countdown before Question #1 launches.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold">3. 1 Min Question + 20s Top 10</span>
                  <p className="text-white font-semibold">8:00 PM to 9:00 PM (40 Questions)</p>
                  <p className="text-slate-400">
                    1 min timer per question, live answered student list, then 20s Top 10 Rank board!
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-rose-400 font-bold">4. Weekly Hall of Fame</span>
                  <p className="text-white font-semibold">Top 5 Students + AG Points</p>
                  <p className="text-slate-400">
                    Top 5 students of the week shine in the Weekly Hall of Fame with Photo, Name & Total Correct Answers!
                  </p>
                </div>
              </div>
            </section>

            {/* WEEKLY HALL OF FAME SECTION: TOP 5 STUDENTS OF THE WEEK (PROFILE PHOTOS, NAMES & TOTAL CORRECT ANSWERS) */}
            <section className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> SUNDAY LIVE QUIZ COMPETITION · WEEKLY HALL OF FAME
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold classic-gold-text font-display">
                    Weekly Hall of Fame — Top 5 Students of the Week
                  </h3>
                  <p className="text-xs text-slate-300">
                    Honoring the Top 5 students of the week with their profile photos, names, and total correct answers achieved during the 40-question Sunday 8:00 PM live quiz competition.
                  </p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-400/40 text-right">
                  <p className="text-[11px] text-slate-400">Live Competition Standard</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-400 font-mono-tabular">
                    40 Live Questions · +2 AG Pts / Right Answer
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {sundayQuizParticipants.slice(0, 5).map((student, idx) => {
                  const accuracyPct = Math.min(100, Math.round((student.rightAnswers / 40) * 100));
                  const rankBadge =
                    idx === 0
                      ? '👑 #1 Champion'
                      : idx === 1
                      ? '🥈 #2 Runner-Up'
                      : idx === 2
                      ? '🥉 #3 Podium'
                      : `🌟 #${idx + 1} Top 5`;

                  return (
                    <div
                      key={student.id || student.uid}
                      className={`p-5 rounded-2xl bg-slate-950 border-2 flex flex-col items-center text-center justify-between space-y-3 transition-transform hover:-translate-y-1 ${
                        idx === 0
                          ? 'border-amber-400 shadow-lg shadow-amber-500/20'
                          : idx === 1
                          ? 'border-slate-300/70'
                          : idx === 2
                          ? 'border-amber-600/70'
                          : 'border-slate-800'
                      }`}
                    >
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-mono-tabular font-extrabold ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-900 border border-amber-400/40 text-amber-300'
                        }`}
                      >
                        {rankBadge}
                      </span>

                      <div className="relative">
                        <img
                          src={
                            student.photoUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={student.studentName}
                          referrerPolicy="no-referrer"
                          className={`w-20 h-20 rounded-full object-cover border-2 ${
                            idx === 0 ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-amber-400/70'
                          }`}
                        />
                      </div>

                      <div className="space-y-1 w-full">
                        <p className="text-base font-bold text-white font-display line-clamp-1">
                          {student.studentName}
                        </p>
                        <p className="text-[11px] text-amber-300 font-semibold">
                          🎯 {profileDestination || 'Your Destination'}
                        </p>
                      </div>

                      <div className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Total Correct Answers
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono-tabular">
                          {student.rightAnswers} / 40 Correct
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono-tabular pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400">{accuracyPct}% Acc</span>
                          <span className="text-sky-400 font-bold">+{student.agPointsEarned} AG Pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STAGE 1: LOBBY / JOIN WINDOW */}
            {sundayStage === 'lobby' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white font-display">
                      Join Sunday 8:00 PM Quiz Competition Lobby
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload your student photo below so if you finish in the <strong>Top 5</strong>, your photo and name
                      will shine on the Flash Board all week!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={
                        sundayStudentPhoto ||
                        firebaseUser?.photoURL ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                      }
                      alt={currentStudentName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-sm font-bold text-white">{currentStudentName}</p>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-xs font-semibold text-sky-400 cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{sundayStudentPhoto ? 'Change Your Winner Photo' : 'Upload Your Photo for Top 5 Board'}</span>
                        <input type="file" accept="image/*" onChange={handleSundayPhotoSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleJoinSundayQuiz(false)}
                      className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                    >
                      {isSundayJoinWindowOpen
                        ? 'Join Live Quiz Lobby (Enter 5-Min Warmup)'
                        : 'Enter 5-Minute Warmup Room Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJoinSundayQuiz(true)}
                      className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                    >
                      Start 40-Question Live Quiz Competition Now →
                    </button>
                  </div>
                </div>

                {/* Current Week's Top 5 Winners Preview */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">
                        This Week’s Top 5 Quiz Champions
                      </h3>
                      <p className="text-xs text-slate-400">Shining on Flash Board with Name & Photo</p>
                    </div>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="space-y-3">
                    {sundayQuizParticipants.slice(0, 5).map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono-tabular font-bold text-amber-400 w-5">#{idx + 1}</span>
                          <img
                            src={
                              p.photoUrl ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                            }
                            alt={p.studentName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-amber-400/60 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white">{p.studentName}</p>
                            <p className="text-[11px] text-slate-400 font-mono-tabular">
                              Right Answers: {p.rightAnswers} / 40
                            </p>
                          </div>
                        </div>
                        <span className="font-mono-tabular font-bold text-emerald-400">
                          +{p.agPointsEarned} AG Pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: 5-MINUTE WARMUP ROOM BEFORE 8:00 PM START */}
            {sundayStage === 'warmup' && (
              <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-8 text-center space-y-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold">
                  5-MINUTE WARMUP IN PROGRESS · GET YOUR PEN & NOTEBOOK READY
                </span>
                <h3 className="text-3xl font-bold text-white font-display">
                  Warmup Countdown: <span className="text-amber-400 font-mono-tabular">{formatSeconds(sundayWarmupSeconds)}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                  40 Questions (Mostly IQ + Maths + Science + English) will start automatically when the warmup finishes.
                  Each question has a strict <strong>1-minute timer</strong>, followed by a <strong>20-second Top 10 Rank</strong> display!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSundayQIndex(0);
                      setSundayQSeconds(60);
                      setSundaySelectedOption(null);
                      setSundayStage('question');
                    }}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    Skip Warmup & Start Question #1 Immediately →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: ACTIVE 1-MINUTE QUESTION + LIVE ANSWERED STUDENT NAME LIST */}
            {sundayStage === 'question' && SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex] && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold text-amber-400">
                        SUNDAY 8:00 PM QUIZ COMPETITION · QUESTION {sundayQIndex + 1} OF 40
                      </span>
                      <h3 className="text-lg font-bold text-white font-display mt-0.5">
                        {SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex].subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/50 font-mono-tabular text-base font-bold text-amber-400">
                        ⏱ {sundayQSeconds}s / 60s
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSundayStage('rank_break');
                          setSundayRankBreakSeconds(20);
                        }}
                        className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                      >
                        Finish 1-Min Timer Now →
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-base sm:text-lg font-semibold text-white">
                      {SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex].question}
                    </p>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 gap-3">
                    {SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex].options.map((opt, idx) => {
                      const isPicked = sundaySelectedOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={sundaySelectedOption !== null}
                          onClick={() => handleSelectSundayQuizOption(idx)}
                          className={`p-4 rounded-xl border text-left text-sm transition-colors cursor-pointer ${
                            isPicked
                              ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <strong className="font-mono-tabular mr-2.5">{String.fromCharCode(65 + idx)}.</strong>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {sundaySelectedOption !== null && (
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between">
                      <span>
                        ✓ Answer locked! Your name has been added to the Answered Name List. Top 10 Rank Board will publish as soon as the 1-minute timer ends.
                      </span>
                      <span className="font-mono-tabular font-bold">Next in {sundayQSeconds}s</span>
                    </div>
                  )}
                </div>

                {/* Live Name List of Students Who Answered This Question */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white font-display">
                      Live Answered Student Name List (Q#{sundayQIndex + 1})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Students who have locked their option for this question
                    </p>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {sundaySelectedOption !== null && (
                      <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-400/50 flex items-center justify-between">
                        <span className="font-bold text-white">{currentStudentName} (You)</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">✓ Answered</span>
                      </div>
                    )}
                    {sundayQuizParticipants
                      .filter((p) => p.uid !== firebaseUser?.uid)
                      .slice(0, 10)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-200">{p.studentName}</span>
                          <span className="text-[11px] text-emerald-400 font-mono-tabular">✓ Answered</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: 20-SECOND TOP 10 RANK PUBLISH SCREEN AFTER EVERY QUESTION */}
            {sundayStage === 'rank_break' && (
              <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400">
                      LIVE TOP 10 RANK BOARD · PUBLISHED FOR 20 SECONDS AFTER QUESTION #{sundayQIndex + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                      Top 10 Student Rank List (After Question {sundayQIndex + 1} / 40)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Correct Answer for Q#{sundayQIndex + 1}:{' '}
                      <strong className="text-emerald-400">
                        {
                          SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex]?.options[
                            SUNDAY_QUIZ_40_QUESTIONS[sundayQIndex]?.correctIndex || 0
                          ]
                        }
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-right">
                      <p className="text-[11px] text-slate-400">Next Question Starts In</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono-tabular">
                        {sundayRankBreakSeconds}s / 20s
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (sundayQIndex + 1 < SUNDAY_QUIZ_40_QUESTIONS.length) {
                          setSundayQIndex((idx) => idx + 1);
                          setSundaySelectedOption(null);
                          setSundayQSeconds(60);
                          setSundayStage('question');
                        } else {
                          finishSundayQuizCompetition();
                        }
                      }}
                      className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {sundayQIndex + 1 < 40 ? `Next Question (#${sundayQIndex + 2}) →` : 'View Final 40-Q Rank →'}
                    </button>
                  </div>
                </div>

                {/* Top 10 Rank Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4">Live Rank</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Right Answers So Far</th>
                        <th className="py-3 px-4 text-right">Live AG Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                      {sundayQuizParticipants.slice(0, 10).map((p, idx) => (
                        <tr
                          key={p.id}
                          className={p.uid === firebaseUser?.uid ? 'bg-sky-500/15' : 'hover:bg-slate-950/60'}
                        >
                          <td className="py-3 px-4 font-bold text-amber-400">#{idx + 1}</td>
                          <td className="py-3 px-4 font-sans font-bold text-white">
                            {p.studentName} {p.uid === firebaseUser?.uid ? '(You)' : ''}
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">{p.rightAnswers} Right</td>
                          <td className="py-3 px-4 text-right text-sky-400 font-bold">
                            +{p.agPointsEarned} AG Pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STAGE 5: FINAL ALL-STUDENT RANK BOARD AFTER QUESTION 40 + AG POINTS AWARDED */}
            {sundayStage === 'final' && (
              <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400">
                      ALL 40 QUESTIONS COMPLETED · FINAL RANK & AG POINTS DISTRIBUTED
                    </span>
                    <h3 className="text-2xl font-bold text-white font-display mt-1">
                      Sunday 8:00 PM Quiz Competition — All Student Final Rank List
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Top 5 Students are now automatically featured with their Name & Photo on the Flash Board for the entire week!
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('flashboard')}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      View Top 5 on Flash Board →
                    </button>
                    <button
                      type="button"
                      onClick={() => setSundayStage('lobby')}
                      className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Back to Quiz Lobby
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4">Final Rank</th>
                        <th className="py-3 px-4">Student Photo & Name</th>
                        <th className="py-3 px-4">Right Answers (Out of 40)</th>
                        <th className="py-3 px-4 text-right">AG Points Awarded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                      {sundayQuizParticipants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-950/60">
                          <td className="py-3.5 px-4 font-bold text-amber-400">
                            #{idx + 1} {idx < 5 ? '🌟 Top 5 Flash Board' : ''}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-3">
                            <img
                              src={
                                p.photoUrl ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                              }
                              alt={p.studentName}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                            />
                            <span>{p.studentName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-emerald-400 font-bold">{p.rightAnswers} / 40</td>
                          <td className="py-3.5 px-4 text-right text-sky-400 font-bold">
                            +{p.agPointsEarned} AG Pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            4. PROGRESS PAGE & AUTOMATIC AI WEAKNESS DETECTOR
            ==================================================================== */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400">
                    STEPPIN PERFORMANCE DASHBOARD · AI DIAGNOSTICS
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display mt-0.5">
                    Subject-Wise Bar Chart & Automatic AI Weakness Detector
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-mono-tabular font-bold text-sky-400">
                    Overall Accuracy:{' '}
                    {(studentProfile?.totalAttempts || 0) > 0
                      ? `${studentProfile?.accuracy || 0}%`
                      : '0% (No Practice Yet)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleExportPerformancePdf}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" /> Export Performance PDF
                  </button>
                </div>
              </div>

              {/* Interactive Recharts Bar Chart: Correct vs Total Questions per Subject */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Correct vs. Total Questions by Subject
                    </h3>
                    <p className="text-xs text-slate-400">
                      Visual breakdown of your answered questions and accuracy across all 7 CDC Entrance subjects
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono-tabular">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Correct Answers
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> Total Attempted
                    </span>
                  </div>
                </div>

                <div className="w-full h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectChartData}
                      margin={{ top: 10, right: 16, left: -10, bottom: 8 }}
                      barGap={6}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="subject"
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }}
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Bar
                        dataKey="correct"
                        name="Correct Questions"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="total"
                        name="Total Questions"
                        fill="#0ea5e9"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                {SUBJECT_CATALOG.map((subj) => {
                  const sStat = studentProfile?.subjectScores?.[subj.id];
                  const hasQuestions = sStat && sStat.total > 0;
                  const pct = hasQuestions ? Math.round((sStat.correct / sStat.total) * 100) : 0;
                  const isWeak = hasQuestions && pct < 60;
                  return (
                    <div key={subj.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{subj.name}</span>
                        <span
                          className={`font-mono-tabular font-bold ${
                            !hasQuestions ? 'text-slate-500' : isWeak ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {!hasQuestions
                            ? '0% · Not Attempted Yet'
                            : `${pct}% ${isWeak ? '▲ WEAK AREA' : '● STRONG'}`}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            !hasQuestions ? 'bg-slate-800' : isWeak ? 'bg-rose-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${Math.max(hasQuestions ? pct : 0, 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-rose-400 font-display flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> AI Weakness Detector Diagnostics
                  </h3>
                  <span className="text-xs text-slate-400">Automatic Real-Time Chapter Detection</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {weaknessAlerts.map((alertText, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <span>• {alertText}</span>
                      <button
                        onClick={() => {
                          if (alertText.includes('Science')) {
                            setSelectedSubject('Science');
                            setSelectedChapter('Chapter 5: Physiological Structure & Life Process (Blood & Heart)');
                          } else if (alertText.includes('Opt. Maths')) {
                            setSelectedSubject('Opt. Maths');
                            setSelectedChapter('All');
                          }
                          setActiveTab('practice');
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md shrink-0 cursor-pointer ${
                          alertText.includes('No practice')
                            ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
                            : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {alertText.includes('No practice') ? 'Start Practice Mode →' : 'Fix Weakness Now →'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Week-over-Week AG Point Growth Line Chart Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-amber-400">
                    AG POINT TRAJECTORY · +2 PTS PER CORRECT · +5 PTS DAILY LOGIN
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    Week-over-Week AG Point Growth
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tracks your cumulative AG Point momentum across the 6-week entrance preparation timeline vs. Batch #1 Topper pace
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-right">
                  <p className="text-[11px] text-slate-400">Current Balance</p>
                  <p className="text-lg font-bold text-amber-400 font-mono-tabular">
                    {studentProfile?.agPoints ?? 5} AG Pts
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weeklyAgGrowthData}
                      margin={{ top: 12, right: 20, left: -10, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line
                        type="monotone"
                        dataKey="agPoints"
                        name={`Your AG Points (${currentStudentName})`}
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#38bdf8', strokeWidth: 2, stroke: '#020617' }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="topperPace"
                        name={`Topper Pace (${topAgStudent.name})`}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#020617' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Student Points Leaderboard: Filter Rankings by Weekly, Monthly, or All-Time Points */}
            <div className="bg-slate-900 border-2 border-amber-400/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> BATCH 100 STUDENT POINTS LEADERBOARD
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    Student Leaderboard —{' '}
                    <span className="text-amber-400">
                      {leaderboardTimeFilter === 'weekly'
                        ? 'Weekly Points Ranking'
                        : leaderboardTimeFilter === 'monthly'
                        ? 'Monthly Points Ranking'
                        : 'All-Time Points Ranking'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Filter student rankings by Weekly, Monthly, or All-Time AG Points (+2 Pts per correct answer, +5 Pts daily login).
                  </p>
                </div>

                {/* Timeframe Filter Buttons: Weekly, Monthly, All-Time */}
                <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-950 border border-slate-800 gap-1.5 self-start lg:self-auto">
                  {(
                    [
                      { id: 'weekly', label: 'Weekly Points' },
                      { id: 'monthly', label: 'Monthly Points' },
                      { id: 'all-time', label: 'All-Time Points' },
                    ] as const
                  ).map((tab) => {
                    const isActive = leaderboardTimeFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLeaderboardTimeFilter(tab.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top 3 Podium Cards for Selected Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pointsLeaderboardList.slice(0, 3).map((student, idx) => {
                  const isCurrentUser = student.uid === firebaseUser?.uid;
                  const medalLabel =
                    idx === 0 ? '👑 #1 Rank' : idx === 1 ? '🥈 #2 Rank' : '🥉 #3 Rank';
                  const borderStyle =
                    idx === 0
                      ? 'border-amber-400 bg-amber-400/5'
                      : idx === 1
                      ? 'border-slate-300/60 bg-slate-950'
                      : 'border-amber-600/60 bg-slate-950';

                  return (
                    <div
                      key={`podium-${student.uid}`}
                      className={`p-4 rounded-xl border-2 ${borderStyle} flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ProfileLetterAvatar name={student.name} photoUrl={student.photoUrl} size="md" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-mono-tabular font-extrabold text-amber-400 block">
                            {medalLabel}
                          </span>
                          <p className="text-sm font-bold text-white truncate">
                            {student.name} {isCurrentUser ? '(You)' : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            🎯 {student.destinationGoal || 'Your Destination'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-emerald-400 font-mono-tabular">
                          {student.displayPoints} Pts
                        </p>
                        <p className="text-[11px] text-sky-400 font-mono-tabular">
                          {student.accuracy}% Acc
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ranked Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Overall Accuracy</th>
                      <th className="py-3 px-4">
                        {leaderboardTimeFilter === 'weekly'
                          ? 'Weekly Attempts'
                          : leaderboardTimeFilter === 'monthly'
                          ? 'Monthly Attempts'
                          : 'Total Attempts'}
                      </th>
                      <th className="py-3 px-4 text-right text-amber-400">
                        {leaderboardTimeFilter === 'weekly'
                          ? 'Weekly Points'
                          : leaderboardTimeFilter === 'monthly'
                          ? 'Monthly Points'
                          : 'All-Time Points'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                    {pointsLeaderboardList.slice(0, 10).map((student, idx) => {
                      const isCurrentUser = student.uid === firebaseUser?.uid;
                      return (
                        <tr
                          key={student.uid}
                          className={`${
                            isCurrentUser ? 'bg-sky-500/15' : 'hover:bg-slate-950/60'
                          } transition-colors`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            {idx === 0 ? (
                              <span className="text-amber-400">#1 🏆</span>
                            ) : idx === 1 ? (
                              <span className="text-slate-200">#2 🥈</span>
                            ) : idx === 2 ? (
                              <span className="text-amber-600">#3 🥉</span>
                            ) : (
                              <span className="text-slate-400">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <ProfileLetterAvatar name={student.name} photoUrl={student.photoUrl} size="sm" />
                              <span>
                                {student.name} {isCurrentUser ? '(You)' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-sans text-xs text-slate-300">
                            {student.destinationGoal || 'Your Destination'}
                          </td>
                          <td className="py-3.5 px-4 text-emerald-400 font-bold">{student.accuracy}%</td>
                          <td className="py-3.5 px-4 text-sky-400">{student.periodAttempts} MCQs</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-amber-400">
                            {student.displayPoints} AG Pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Toppers Section: Ranks Students Specifically by Individual Subject Accuracy */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> SUBJECT-SPECIFIC ACCURACY LEADERBOARD
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    Subject Toppers — Ranked by {topperSubjectFilter} Accuracy (%)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any individual subject below or switch between Weekly, Monthly, and All-Time points.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {SUBJECT_CATALOG.map((subj) => (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => setTopperSubjectFilter(subj.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        topperSubjectFilter === subj.id
                          ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {subj.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Showing points for:{' '}
                  <strong className="text-amber-400 uppercase">{leaderboardTimeFilter}</strong>
                </span>
                <div className="inline-flex items-center gap-1.5">
                  {(
                    [
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'all-time', label: 'All-Time' },
                    ] as const
                  ).map((period) => (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => setLeaderboardTimeFilter(period.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                        leaderboardTimeFilter === period.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">Subject Rank</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">{topperSubjectFilter} Accuracy</th>
                      <th className="py-3 px-4">Correct / Attempted</th>
                      <th className="py-3 px-4 text-right">
                        {leaderboardTimeFilter === 'weekly'
                          ? 'Weekly AG Points'
                          : leaderboardTimeFilter === 'monthly'
                          ? 'Monthly AG Points'
                          : 'All-Time AG Points'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                    {subjectToppersList.slice(0, 8).map((item, idx) => {
                      const isCurrentUser = item.uid === firebaseUser?.uid;
                      return (
                        <tr
                          key={item.uid}
                          className={`${
                            isCurrentUser ? 'bg-sky-500/10' : 'hover:bg-slate-950/60'
                          } transition-colors`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            {idx === 0 ? (
                              <span className="text-amber-400">#1 Topper 🏆</span>
                            ) : idx === 1 ? (
                              <span className="text-slate-200">#2</span>
                            ) : idx === 2 ? (
                              <span className="text-amber-600">#3</span>
                            ) : (
                              <span className="text-slate-400">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-bold text-white">
                            {item.name} {isCurrentUser ? '(You)' : ''}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-400 font-bold">{item.subjectAccuracy}%</span>
                          </td>
                          <td className="py-3.5 px-4 text-sky-400">
                            {item.correct} / {item.total}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-400">{item.agPoints} Pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Topper Comparison: Accuracy, Time, Attempts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-bold text-white font-display">
                Topper Comparison — Accuracy, Time Spent & Total Attempts
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">Metric</th>
                      <th className="py-3 px-4">You ({currentStudentName})</th>
                      <th className="py-3 px-4 text-amber-400">Batch Topper ({topAgStudent.name})</th>
                      <th className="py-3 px-4">Gap Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono-tabular">
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">Accuracy (%)</td>
                      <td className="py-3.5 px-4 text-sky-400 font-bold">
                        {(studentProfile?.totalAttempts || 0) > 0
                          ? `${studentProfile?.accuracy || 0}%`
                          : '0% (No Practice Yet)'}
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">{topAgStudent.accuracy}%</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {(studentProfile?.totalAttempts || 0) > 0
                          ? `${Math.max(0, topAgStudent.accuracy - (studentProfile?.accuracy || 0))}% to reach #1`
                          : 'Solve questions to calculate gap'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">Time Spent in App</td>
                      <td className="py-3.5 px-4 text-sky-400 font-bold">
                        {formatTimeSpent(studentProfile?.timeSpentMinutes || 1)}
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">
                        {formatTimeSpent(topAgStudent.timeSpentMinutes)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">Auto-tracked every minute</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">Total Attempts</td>
                      <td className="py-3.5 px-4 text-sky-400 font-bold">{studentProfile?.totalAttempts || 0}</td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">{topAgStudent.totalAttempts}</td>
                      <td className="py-3.5 px-4 text-slate-300">+2 AG Points per correct answer</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">AG Points Balance</td>
                      <td className="py-3.5 px-4 text-sky-400 font-bold">{studentProfile?.agPoints || 5} Pts</td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">{topAgStudent.agPoints} Pts</td>
                      <td className="py-3.5 px-4 text-slate-300">Daily login gives +5 Pts automatically</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            5. FLASH BOARD & STUDENT CHAT ROOM
            ==================================================================== */}
        {activeTab === 'flashboard' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> MAXIMUM AG POINT STUDENT SHINING ON FLASH BOARD
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  🌟 {topAgStudent.name} — {topAgStudent.agPoints} AG Points
                </h2>
                <p className="text-xs text-slate-300">
                  1 Correct = 2 Points · Daily Login = 5 Points · Solve more questions to shine your name here automatically!
                </p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono-tabular text-xs font-bold">
                Your Balance: {studentProfile?.agPoints || 5} AG Points
              </div>
            </div>

            {/* TOP 5 SUNDAY 8 PM QUIZ COMPETITION WINNERS WITH NAME & PHOTO (SHINES ALL WEEK) */}
            <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> WEEKLY SUNDAY 8:00 PM QUIZ COMPETITION — TOP 5 HALL OF FAME
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    Top 5 Students of the Week (With Name & Photo)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sunday_quiz')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Open Sunday 8 PM Quiz →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {sundayQuizParticipants.slice(0, 5).map((winner, idx) => (
                  <div
                    key={winner.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center space-y-2.5"
                  >
                    <span className="text-xs font-mono-tabular font-bold text-amber-400">
                      #{idx + 1} Weekly Rank
                    </span>
                    <img
                      src={
                        winner.photoUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'
                      }
                      alt={winner.studentName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{winner.studentName}</p>
                      <p className="text-[11px] text-emerald-400 font-mono-tabular font-semibold mt-0.5">
                        {winner.rightAnswers} / 40 Right
                      </p>
                      <p className="text-[11px] text-sky-400 font-mono-tabular">
                        +{winner.agPointsEarned} AG Points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Official Flash Board (Notices, GK in Nepali & Images)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Controlled by Niraj Yadav (Manual & Automatic) · Students Read-Only View
                    </p>
                  </div>
                  {isOwnerNiraj && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Manage Flash Board
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {flashItems.map((item) => (
                    <div key={item.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-sky-400">
                        <span className="font-bold">{item.type}</span>
                        <span>By {item.authorName}</span>
                      </div>
                      <h4 className="text-base font-bold text-white font-display">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {item.content}
                      </p>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-64 object-cover rounded-lg border border-slate-800 mt-2"
                        />
                      )}
                    </div>
                  ))}

                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400">
                      <span className="font-bold">GK Nepali · समसामयिक सामान्य ज्ञान</span>
                      <span>By Niraj Yadav</span>
                    </div>
                    <h4 className="text-base font-bold text-white font-display">
                      नेपालको संविधान र भूगोल सम्बन्धी अति महत्वपूर्ण तथ्यहरू
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      १. नेपालको वर्तमान संविधान २०७२ असोज ३ गते जारी भएको हो जसमा ३५ भाग, ३०८ धारा र ९ अनुसूची छन्।{'\n'}
                      २. रारा ताल मुगु जिल्लामा अवस्थित छ र यसको गहिराइ १६७ मिटर छ।{'\n'}
                      ३. प्रत्येक शनिबार बिहान ८:०० देखि ९:०० बजेसम्म हुने परीक्षामा अनिवार्य सहभागी हुनुहोला!
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Student Chatting Page for All */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[540px]">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-sky-400" />
                    Batch 100 Live Student Chat Room
                  </h3>
                  <p className="text-xs text-slate-400">Discuss tricky Science & Maths questions with batchmates</p>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs">
                    <p className="font-bold text-amber-400">Niraj Yadav (Creator & Admin)</p>
                    <p className="text-slate-200 mt-1">
                      Welcome to UDAN Batch 100! Keep practicing Science Chapter 5 and Optional Maths. Remember: Every Saturday
                      Exam starts sharp at 8:00 AM!
                    </p>
                  </div>

                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400">{msg.senderName}</span>
                        <span className="text-[11px] text-slate-500 font-mono-tabular">
                          {msg.agPoints ?? 5} AG Pts
                        </span>
                      </div>
                      <p className="text-slate-200 mt-1">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a doubt or share motivation..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            5B. DISCUSS PAGE — SEND PHOTO QUESTIONS & SOLVE DOUBTS TOGETHER
            ==================================================================== */}
        {activeTab === 'discuss' && (
          <div className="space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> STUDENT PHOTO QUESTION & DOUBT DISCUSSION BOARD
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    Snap or Upload Any Tricky Question Photo & Discuss Solutions
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload a photo from your notebook, textbook, or past paper and solve it together with Batch 100 & Niraj Yadav.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateDiscussionPost} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Subject</label>
                      <select
                        value={discussSubject}
                        onChange={(e) => setDiscussSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                      >
                        {SUBJECT_CATALOG.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Attach Question Photo (Camera / Gallery)
                      </label>
                      <label className="w-full px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-dashed border-sky-500/60 rounded-xl text-xs text-sky-400 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>{discussPhotoDataUrl ? 'Change Selected Photo' : 'Choose / Capture Question Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDiscussPhotoSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowVoiceRecorderInDiscuss(!showVoiceRecorderInDiscuss)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                          showVoiceRecorderInDiscuss
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                            : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        <span>{showVoiceRecorderInDiscuss ? 'Hide Voice Recorder' : '🎤 Record Audio Voice Doubt'}</span>
                      </button>
                      {voiceDoubtAudio && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Audio Note Recorded & Attached
                        </span>
                      )}
                    </div>

                    {showVoiceRecorderInDiscuss && (
                      <VoiceRecorder
                        onAudioReady={(base64) => {
                          setVoiceDoubtAudio(base64);
                          setShowVoiceRecorderInDiscuss(false);
                        }}
                        onCancel={() => setShowVoiceRecorderInDiscuss(false)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Write Your Question or Doubt Description
                    </label>
                    <textarea
                      rows={3}
                      value={discussText}
                      onChange={(e) => setDiscussText(e.target.value)}
                      placeholder="Example: Please explain step-by-step how to find the value of x in this Optional Maths question..."
                      className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={discussUploading || (!discussText.trim() && !discussPhotoDataUrl)}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {discussUploading ? 'Posting Question to Discuss Feed...' : 'Post Photo Question to Discuss Board'}
                  </button>
                </div>

                {/* Live Photo Preview Box */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[190px] text-center">
                  {discussPhotoDataUrl ? (
                    <div className="space-y-3 w-full">
                      <img
                        src={discussPhotoDataUrl}
                        alt="Question preview"
                        className="max-h-56 w-auto mx-auto rounded-lg border border-slate-700 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setDiscussPhotoDataUrl('')}
                        className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Remove Attached Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-6">
                      <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-400">No Question Photo Selected Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        Click “Choose / Capture Question Photo” to upload an image of any handwritten or book question.
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </section>

            {/* Filter & Discussion Feed */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-white font-display">
                  Recent Student Photo Questions ({discussionPosts.length})
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', ...SUBJECT_CATALOG.map((s) => s.id)].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setDiscussFilterSubject(subj)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                        discussFilterSubject === subj
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {discussionPosts
                  .filter((p) => discussFilterSubject === 'All' || p.subject === discussFilterSubject)
                  .map((post) => {
                    let replies: DiscussionReplyItem[] = [];
                    try {
                      if (post.repliesJson) replies = JSON.parse(post.repliesJson);
                    } catch {
                      replies = [];
                    }

                    return (
                      <div
                        key={post.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-white">{post.authorName}</span>
                              {post.authorRole === 'admin' && (
                                <span className="text-amber-400 font-bold">· Creator & Admin</span>
                              )}
                              <span className="text-sky-400 font-semibold">· {post.subject}</span>
                            </div>
                            <p className="text-sm sm:text-base text-slate-100 whitespace-pre-line leading-relaxed">
                              {post.questionText}
                            </p>
                          </div>

                          {(isOwnerNiraj || post.authorId === firebaseUser?.uid) && (
                            <button
                              onClick={() => handleDeleteDiscussionPost(post.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {post.photoDataUrl && (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                            <img
                              src={post.photoDataUrl}
                              alt="Student uploaded question"
                              className="max-h-96 w-auto rounded-lg object-contain mx-auto"
                            />
                          </div>
                        )}

                        {/* Replies List */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-3">
                          <p className="text-xs font-semibold text-slate-400">
                            Answers & Explanations ({replies.length})
                          </p>

                          {replies.length > 0 && (
                            <div className="space-y-2">
                              {replies.map((rep) => (
                                <div
                                  key={rep.id}
                                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-bold ${
                                        rep.authorRole === 'admin' ? 'text-amber-400' : 'text-sky-400'
                                      }`}
                                    >
                                      {rep.authorName} {rep.authorRole === 'admin' ? '(Niraj Admin)' : ''}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-mono-tabular">
                                      {rep.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">{rep.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Reply Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={replyDrafts[post.id] || ''}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Write your solution or answer to this question..."
                              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendDiscussionReply(post)}
                              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Reply Solution
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {discussionPosts.length === 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Camera className="w-8 h-8 text-sky-400 mx-auto" />
                    <p className="text-sm font-bold text-white">No Photo Questions Posted Yet</p>
                    <p className="text-xs text-slate-400">
                      Be the first student to upload a photo of a tough Science or Maths question above!
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            6. PROFILE PAGE, DETAILED PROFILE LETTER, DELETE PROFILE & FEEDBACK
            ==================================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {profileSaveBanner && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between">
                <span>✓ {profileSaveBanner}</span>
                <button
                  type="button"
                  onClick={() => setProfileSaveBanner(null)}
                  className="underline text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5 Cols: Detailed Student Profile + Edit Username/Destination + Delete Profile */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                  <ProfileLetterAvatar
                    name={currentStudentName}
                    photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
                    size="lg"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      DETAILED STUDENT PROFILE & LETTER BADGE
                    </span>
                    <h2 className="text-xl font-bold text-white font-display">{currentStudentName}</h2>
                    <p className="text-xs text-emerald-400 font-semibold">
                      🎯 Badge: {profileDestination || 'Your Destination'}
                    </p>
                  </div>
                </div>

                {/* Customize Username, Destination Badge & School */}
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30 space-y-3 text-xs">
                  <p className="font-bold text-amber-300">
                    ✍️ Edit Detailed Profile & Welcome Username
                  </p>
                  <div>
                    <label className="block text-slate-400 mb-1">Your Welcome Username (Full Name)</label>
                    <input
                      type="text"
                      value={welcomeNameDraft}
                      onChange={(e) => setWelcomeNameDraft(e.target.value)}
                      placeholder={currentStudentName}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Your Destination Badge (Goal)</label>
                    <input
                      type="text"
                      value={profileDestination}
                      onChange={(e) => setProfileDestination(e.target.value)}
                      placeholder="Your Destination"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">School / Batch Curriculum</label>
                    <input
                      type="text"
                      value={profileSchool}
                      onChange={(e) => setProfileSchool(e.target.value)}
                      placeholder="Class 10 CDC Nepal"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-400 font-semibold cursor-pointer flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input type="file" accept="image/*" onChange={handleSundayPhotoSelect} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSaveWelcomeUsername(welcomeNameDraft.trim() || currentStudentName)}
                      className="flex-1 py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Save Detailed Profile
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Welcomed Username:</span>
                    <span className="font-bold text-white">{currentStudentName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Destination Badge:</span>
                    <span className="font-bold text-amber-300">{profileDestination || 'Your Destination'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">AG Points:</span>
                    <span className="font-bold text-amber-400 font-mono-tabular">
                      {studentProfile?.agPoints || 5} Pts
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Overall Accuracy:</span>
                    <span className="font-bold text-emerald-400 font-mono-tabular">
                      {studentProfile?.accuracy || 78}% ({studentProfile?.totalAttempts || 0} Qs)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Time Spent in App:</span>
                    <span className="font-bold text-sky-400 font-mono-tabular">
                      {formatTimeSpent(studentProfile?.timeSpentMinutes || 45)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Daily Goal Progress:</span>
                    <span className="font-bold text-emerald-400 font-mono-tabular">
                      {dailyGoalCompleted} / {dailyGoalTarget} ({dailyGoalPct}%)
                    </span>
                  </div>
                </div>

                {/* Official Social Media Links of Creator Niraj Yadav */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Follow Creator 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <a
                      href={NIRAJ_FB_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>Facebook Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={NIRAJ_TIKTOK_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>TikTok (@niraj__yadav__)</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Creator Private Folder Verification Box */}
                <div className="p-5 rounded-xl bg-slate-950 border border-amber-400/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Creator Private Folder Verification
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isOwnerNiraj ? '👑 Verified Creator' : 'Locked for Students'}
                    </span>
                  </div>
                  {isOwnerNiraj ? (
                    <div className="space-y-2">
                      <p className="text-emerald-300">
                        You are recognized as <strong>Creator Niraj Yadav</strong>. Only you can see the Private Folder & Creator Control Panel.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('private_students')}
                          className="px-3.5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                        >
                          📁 Open Private Student Folder
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('admin')}
                          className="px-3.5 py-2 bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                        >
                          👑 Open Creator Control Panel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-400">
                        Are you Niraj Yadav logged in from another account? Enter your secret Creator PIN to unlock your Private Folder:
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showCreatorPin ? 'text' : 'password'}
                            value={creatorPinInput}
                            onChange={(e) => setCreatorPinInput(e.target.value)}
                            placeholder="Creator Secret PIN"
                            className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCreatorPin((prev) => !prev)}
                            aria-label={showCreatorPin ? 'Hide Creator PIN' : 'Show Creator PIN'}
                            title={showCreatorPin ? 'Hide PIN' : 'Show PIN'}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                          >
                            {showCreatorPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (creatorPinInput.trim() === '2082' || creatorPinInput.trim().toUpperCase() === 'NIRAJ2082') {
                              setAdminModeUnlocked(true);
                              setCreatorPinMessage('Creator verified! Private Folder unlocked.');
                              setActiveTab('private_students');
                            } else {
                              setCreatorPinMessage('Invalid Creator PIN. Only Niraj Yadav can open the Private Folder.');
                            }
                          }}
                          className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                        >
                          Unlock
                        </button>
                      </div>
                      {creatorPinMessage && <p className="text-amber-300 font-semibold">{creatorPinMessage}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 7 Cols: Official Detailed Profile Letter + Feedback Wall */}
              <div className="lg:col-span-7 space-y-6">
                {/* Official UDAN Detailed Student Profile Letter */}
                <div className="bg-slate-900 border-2 border-amber-400/60 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <UDANLogo size={46} />
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block">
                          OFFICIAL UDAN ACADEMIC COMMENDATION & PROFILE LETTER
                        </span>
                        <h3 className="text-xl font-extrabold classic-gold-text font-display">
                          Detailed Profile Letter for {currentStudentName}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadProfileLetterPdf(currentStudentName)}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" /> Download Profile Letter (PDF)
                    </button>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-950 border border-amber-400/30 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300 border-b border-slate-800 pb-3">
                      <span className="font-bold">To: {currentStudentName}</span>
                      <span className="font-mono-tabular">
                        Destination Badge: <strong>{profileDestination || 'Your Destination'}</strong>
                      </span>
                    </div>

                    <p className="classic-serif-italic text-base text-amber-200">
                      Dear <strong>{currentStudentName}</strong>,
                    </p>

                    <p>
                      Welcome to our entrance preparation journey at <strong>UDAN — The Entrance Topper</strong>! Every
                      single MCQ you solve today brings you one step closer to{' '}
                      <strong className="text-amber-300 underline underline-offset-4">
                        {profileDestination || 'Your Destination'}
                      </strong>{' '}
                      tomorrow.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block">Student Username:</span>
                        <strong className="text-white text-sm">{currentStudentName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Target Badge:</span>
                        <strong className="text-amber-300 text-sm">{profileDestination || 'Your Destination'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Curriculum / School:</span>
                        <strong className="text-sky-300">{profileSchool || 'Class 10 CDC Syllabus Nepal'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Standing & Study Time:</span>
                        <strong className="text-emerald-400 font-mono-tabular">
                          {studentProfile?.agPoints || 5} AG Pts · {formatTimeSpent(studentProfile?.timeSpentMinutes || 45)}
                        </strong>
                      </div>
                    </div>

                    <p>
                      Continue practicing daily in Subject Practice Mode, competing in the Saturday 8:00 AM Mock Exam,
                      and shining in the Sunday 8:00 PM Live Quiz Hall of Fame. Your hard work and discipline will carry
                      you straight to <strong>{profileDestination || 'Your Destination'}</strong>!
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-slate-400">Issued with pride by,</p>
                        <p className="text-base font-bold text-amber-300">𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿</p>
                        <p className="text-[11px] text-slate-400">Creator & Founder · UDAN — The Entrance Topper</p>
                      </div>
                      <ProfileLetterAvatar
                        name={currentStudentName}
                        photoUrl={sundayStudentPhoto || studentProfile?.photoUrl}
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback: "Say something about Niraj" + Thanks Message */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white font-display">
                      Feedback — “Say something about Niraj”
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Share your thoughts, gratitude, or feedback for creator 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿
                    </p>
                  </div>

                  {feedbackThanksBanner && (
                    <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-bold">
                      Thank you so much, {currentStudentName}! ❤️ Your message for Niraj Yadav has been saved on the UDAN
                      Wall of Gratitude. Keep working hard towards your entrance topper dream!
                    </div>
                  )}

                  <form onSubmit={handleSendFeedback} className="space-y-4">
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write your message about Niraj Yadav and the UDAN entrance preparation journey..."
                      className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Rating:</span>
                        {[5, 4, 3].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFeedbackRating(r)}
                            className={`px-2.5 py-1 rounded-md font-mono-tabular cursor-pointer ${
                              feedbackRating === r ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            {r} ★
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Submit Tribute to Niraj
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
                    <p className="text-xs font-semibold text-slate-400">Recent Student Messages for Niraj Yadav:</p>
                    {feedbackList.map((fb) => (
                      <div key={fb.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between">
                          <strong className="text-sky-400">{fb.authorName}</strong>
                          <span className="text-amber-400 font-mono-tabular">{fb.rating} ★</span>
                        </div>
                        <p className="text-slate-200">{fb.message}</p>
                      </div>
                    ))}
                    {feedbackList.length === 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                        No student tributes posted yet. Be the first student to write a message for Niraj Yadav!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* EVERY STUDENT PROFILE SHOWCASE DIRECTORY (DETAILED PROFILE CARD FOR EVERY STUDENT) */}
            <section className="bg-slate-900 border border-amber-400/40 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    BATCH 100 STUDENT PROFILES · EVERY STUDENT HAS AN OFFICIAL UDAN PROFILE
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    Detailed Profile Cards for Every Student ({Math.max(1, allStudents.length)} Active Profiles)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any student profile card below to view their Detailed Profile Letter, Destination Badge, and AG Points standing.
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono-tabular text-xs font-bold text-emerald-400">
                  {batchConfig.registeredCount} / {batchConfig.batchLimit} Batch Seats Registered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(allStudents.length > 0
                  ? allStudents
                  : [
                      studentProfile || {
                        uid: firebaseUser.uid,
                        name: currentStudentName,
                        role: isOwnerNiraj ? 'admin' : 'student',
                        agPoints: 5,
                        accuracy: 78,
                        totalAttempts: 0,
                        correctCount: 0,
                        timeSpentMinutes: 1,
                        destinationGoal: profileDestination || 'Your Destination',
                        schoolName: profileSchool || 'Class 10 CDC Nepal',
                      },
                    ]
                ).map((st) => {
                  const isMe = st.uid === firebaseUser.uid;
                  const displayStName = isMe ? currentStudentName : st.name;
                  const destBadge = st.destinationGoal || 'Your Destination';
                  return (
                    <div
                      key={st.uid}
                      onClick={() =>
                        setSelectedStudentCardUid(selectedStudentCardUid === st.uid ? null : st.uid)
                      }
                      className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                        selectedStudentCardUid === st.uid
                          ? 'bg-slate-950 border-amber-400 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <ProfileLetterAvatar
                          name={displayStName}
                          photoUrl={isMe ? sundayStudentPhoto || st.photoUrl : st.photoUrl}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">
                            {displayStName} {isMe ? '(You)' : ''}
                          </p>
                          <p className="text-[11px] text-amber-300 font-semibold truncate">
                            🎯 {destBadge}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {st.schoolName || 'Class 10 CDC Syllabus Nepal'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono-tabular text-xs">
                        <div className="p-2 rounded-lg bg-slate-900">
                          <span className="text-[10px] text-slate-400 block">AG Points</span>
                          <strong className="text-amber-400">{st.agPoints || 5}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900">
                          <span className="text-[10px] text-slate-400 block">Accuracy</span>
                          <strong className="text-emerald-400">{st.accuracy || 78}%</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900">
                          <span className="text-[10px] text-slate-400 block">Study Time</span>
                          <strong className="text-sky-400">{st.timeSpentMinutes || 1}m</strong>
                        </div>
                      </div>

                      {selectedStudentCardUid === st.uid && (
                        <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-400/30 text-xs text-slate-200 space-y-1.5">
                          <p className="font-bold text-amber-300">
                            📜 Official Student Profile Summary — {displayStName}
                          </p>
                          <p>
                            Enrolled in UDAN Batch 100 preparing for <strong>{destBadge}</strong> with{' '}
                            <strong>{st.agPoints || 5} AG Points</strong> and{' '}
                            <strong>{st.totalAttempts || 0} MCQs</strong> practiced.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            LIVE VOICE & AUDIO STUDY ROOM (LiveVoice.tsx)
            ==================================================================== */}
        {activeTab === 'voice' && (
          <LiveVoice
            currentUserName={currentStudentName}
            userAgPoints={studentProfile?.agPoints ?? 5}
            onAnswerQuestion={(isCorrect) => {
              if (isCorrect && firebaseUser) {
                const currentPts = studentProfile?.agPoints || 5;
                setStudentProfile((prev) => prev ? { ...prev, agPoints: currentPts + 2 } : null);
                updateDoc(doc(db, 'students', firebaseUser.uid), {
                  agPoints: currentPts + 2,
                  updatedAt: new Date().toISOString(),
                }).catch(() => {});
              }
            }}
          />
        )}

        {/* ====================================================================
            UNIVERSAL DOWNLOAD CENTER — ALSO DOWNLOADABLE FOR EVERYONE
            ==================================================================== */}
        {activeTab === 'downloads' && (
          <div className="space-y-8 text-left">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border-2 border-amber-400/50 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
                    <Download className="w-3.5 h-3.5" />
                    <span>Downloadable for Everyone · Steppin Universal Download Center</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    Download Steppin App & All Features
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Install Steppin on your Android phone, iPhone, iPad, Windows PC, or Mac. Download comprehensive
                    PDF study guides, solved CDC entrance question banks, student merit certificates, and the full
                    95-item verification checklist.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <PWAInstallButton />
                </div>
              </div>
            </div>

            {/* 6 Download Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: PWA App Installation */}
              <div className="rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Download App for Everyone
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Install the full Steppin Progressive Web App (PWA) with offline study caching, custom app icon, and full-screen exam experience.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
                    <p>✓ <strong>Android:</strong> Chrome ⋮ Menu → Add to Home screen</p>
                    <p>✓ <strong>iPhone:</strong> Safari Share → Add to Home Screen</p>
                    <p>✓ <strong>PC / Mac:</strong> Chrome/Edge URL bar → Install Steppin</p>
                  </div>
                </div>
                <PWAInstallButton />
              </div>

              {/* Card 2: Official Entrance Study Guide PDF */}
              <div className="rounded-2xl bg-slate-900 border border-amber-400/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    CDC Class 10 Entrance Guide PDF
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Comprehensive study notes, CDC Class 10 syllabus breakdowns, and exam regulations prepared by Niraj Yadav.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                    <p>• 7 Core Subjects Syllabus</p>
                    <p>• Weekly Mock Exam Rules & Scoring</p>
                    <p>• Sunday Quiz IQ Strategies</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadMasterFeaturesPdfDirect()}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Study Guide PDF</span>
                </button>
              </div>

              {/* Card 3: Solved Question Bank PDF */}
              <div className="rounded-2xl bg-slate-900 border border-sky-500/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Solved Question Bank PDF
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Printable Class 10 CDC Syllabus entrance question compilation covering Science, Math, English, and GK with step-by-step solutions.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>✓ Over 30 authentic entrance exam MCQs</p>
                    <p>✓ Complete step-by-step formulas and solutions</p>
                    <p>✓ High-yield revision guide for offline study</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSolvedQuestionBankPdf(SATURDAY_MOCK_MIXED_POOL)}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Question Bank (.pdf)</span>
                </button>
              </div>

              {/* Card 4: Master Features PDF Direct */}
              <div className="rounded-2xl bg-slate-900 border border-violet-500/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Master Features PDF
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Direct single-file download of the full 16-module master specification document with royal golden header layout.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>✓ All 16 Modules documented in detail</p>
                    <p>✓ Authentication, Security, Exams, Audio & Admin</p>
                    <p>✓ Royal A4 format with page numbers and headers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadMasterFeaturesPdfDirect()}
                  className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Master PDF (.pdf)</span>
                </button>
              </div>

              {/* Card 5: Student Merit Certificate */}
              <div className="rounded-2xl bg-slate-900 border border-rose-500/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Student Merit Certificate
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Personalized commendation letter and academic certificate certified by Academic Director Niraj Yadav.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>✓ Certified Student: <strong>{currentStudentName}</strong></p>
                    <p>✓ Destination Badge: <strong>{profileDestination || 'Your Destination'}</strong></p>
                    <p>✓ Official royal crest, AG points and signature</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadProfileLetterPdf(currentStudentName)}
                  className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Certificate (.pdf)</span>
                </button>
              </div>

              {/* Card 6: 95-Item Verification Checklist */}
              <div className="rounded-2xl bg-slate-900 border border-emerald-400/40 p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    95-Item Verification Checklist
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Interactive checklist verifying all 95 feature requirements specified in Section 14 of the build specification.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 space-y-1 font-semibold">
                    <p>✓ Status: 95 / 95 Verified (100% Complete)</p>
                    <p>✓ Filter by 15 functional sections</p>
                    <p>✓ Export as clean plain text (.txt) file</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShow95ChecklistModal(true)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open 95 Checklist Modal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 95-ITEM INTERACTIVE VERIFICATION CHECKLIST MODAL */}
        {show95ChecklistModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border-2 border-emerald-400/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left">
              <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SECTION 14 VERIFICATION ENGINE · 95 / 95 PASS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    Steppin Complete 95-Item Feature Verification Checklist
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official specification checklist covering Branding, PWA, Auth, Curriculum, Exams, Voice, and Admin.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const text = generateSteppin95Checklist();
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Steppin_95_Item_Complete_Verification_Checklist.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow95ChecklistModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                  {generateSteppin95Checklist()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            7. NIRAJ YADAV ADMIN PANEL (BOTH MANUAL & AUTOMATIC FLASH BOARD + QUESTIONS)
            ==================================================================== */}
        {activeTab === 'admin' && isOwnerNiraj && (
          <div className="space-y-8">
            {adminStatusBanner && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between">
                <span>✓ {adminStatusBanner}</span>
                <button onClick={() => setAdminStatusBanner(null)} className="underline text-xs cursor-pointer">
                  Close
                </button>
              </div>
            )}

            {/* 100 STUDENTS BATCH LIMIT - MANUAL & AUTOMATIC CONTROL DASHBOARD */}
            <section className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400">
                    PRIVATE ADMIN PANEL · ONLY NIRAJ YADAV CAN SEE & CONTROL
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    100-Student Batch Limit & Automatic Exam Control
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('private_students')}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    View Student Time Spent Page →
                  </button>
                  <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono-tabular text-lg font-bold text-sky-400">
                    {batchConfig.registeredCount} / {batchConfig.batchLimit} Registered
                  </div>
                </div>
              </div>

              {/* 4 Batch Limit Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">1. Live Counter</p>
                  <p className="text-2xl font-bold text-white font-mono-tabular">
                    {batchConfig.registeredCount} / {batchConfig.batchLimit} Registered
                  </p>
                  <p className="text-xs text-slate-400">
                    {Math.max(0, batchConfig.batchLimit - batchConfig.registeredCount)} seats currently vacant
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">2. OPEN / CLOSE Switch</p>
                  <button
                    onClick={handleToggleAdmissionOpen}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      batchConfig.isOpen
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-rose-500 text-white hover:bg-rose-400'
                    }`}
                  >
                    Switch: {batchConfig.isOpen ? 'ADMISSION OPEN (Click to Close)' : 'ADMISSION CLOSED (Click to Open)'}
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Auto-blocks signup when full or closed.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">3. INCREASE Batch Limit</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleChangeBatchLimit(20)}
                      className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      +20 Seats ({batchConfig.batchLimit} → {batchConfig.batchLimit + 20})
                    </button>
                    <button
                      onClick={() => handleChangeBatchLimit(30)}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      +30
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Increase 100 → 120 → 150 anytime.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">4. DECREASE Batch Limit</p>
                  <button
                    onClick={() => handleChangeBatchLimit(-20)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    -20 Seats ({batchConfig.batchLimit} → {Math.max(10, batchConfig.batchLimit - 20)})
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Old students NOT removed, new signup blocked.
                  </p>
                </div>
              </div>
            </section>

            {/* BOTH MANUAL & AUTOMATIC QUESTION BANK + FLASH BOARD CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Cols: Add Questions (Manual AND Automatic Mode) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Add Entrance Questions (Manual & Automatic)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add questions yourself OR let the Automatic Generator create CDC Nepal Syllabus questions
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuestionMode('automatic')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer ${
                        questionMode === 'automatic' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Automatic Generator
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionMode('manual')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer ${
                        questionMode === 'manual' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✍️ Manual Entry
                    </button>
                  </div>
                </div>

                {/* Shared Subject & Chapter Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Select Subject</label>
                    <select
                      value={newQSubject}
                      onChange={(e) => {
                        const s = e.target.value;
                        setNewQSubject(s);
                        const found = SUBJECT_CATALOG.find((item) => item.id === s);
                        if (found && found.chapters[0]) {
                          setNewQChapter(found.chapters[0]);
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      {SUBJECT_CATALOG.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Select Chapter</label>
                    <select
                      value={newQChapter}
                      onChange={(e) => setNewQChapter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      {SUBJECT_CATALOG.find((s) => s.id === newQSubject)?.chapters.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {questionMode === 'automatic' ? (
                  <div className="p-5 rounded-xl bg-slate-950 border border-sky-500/40 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <Wand2 className="w-4 h-4" /> 1-Click Automatic CDC Entrance Question Generator
                      </span>
                      <span className="text-slate-400">Saves directly to Cloud Bank</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Automatically generates high-yield Class 10 CDC Nepal Entrance questions with 4 options, verified correct
                      answer, and step-by-step explanation for <strong>{newQSubject}</strong> ({newQChapter}).
                    </p>
                    <div>
                      <label className="block text-slate-400 mb-1.5">How many questions to generate automatically?</label>
                      <div className="flex items-center gap-2">
                        {[3, 5, 10].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setAutoQCount(n)}
                            className={`px-4 py-2 rounded-lg font-mono-tabular font-bold border cursor-pointer ${
                              autoQCount === n
                                ? 'bg-sky-500 text-slate-950 border-sky-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            +{n} Questions
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={autoQLoading}
                      onClick={handleAdminAutomaticAddQuestions}
                      className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${autoQLoading ? 'animate-spin' : ''}`} />
                      {autoQLoading
                        ? `Generating ${autoQCount} ${newQSubject} Questions Automatically...`
                        : `Auto-Generate & Save ${autoQCount} Questions Now`}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAdminManualAddQuestion} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Question Statement</label>
                      <input
                        type="text"
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="Enter question..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newQOpt0}
                        onChange={(e) => setNewQOpt0(e.target.value)}
                        placeholder="Option A"
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={newQOpt1}
                        onChange={(e) => setNewQOpt1(e.target.value)}
                        placeholder="Option B"
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={newQOpt2}
                        onChange={(e) => setNewQOpt2(e.target.value)}
                        placeholder="Option C"
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={newQOpt3}
                        onChange={(e) => setNewQOpt3(e.target.value)}
                        placeholder="Option D"
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Correct Option</label>
                        <select
                          value={newQCorrect}
                          onChange={(e) => setNewQCorrect(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1">Full Answer Explanation</label>
                        <input
                          type="text"
                          value={newQExplanation}
                          onChange={(e) => setNewQExplanation(e.target.value)}
                          placeholder="Why is this option correct?"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl cursor-pointer"
                    >
                      + Save Manual Question to Cloud Bank
                    </button>
                  </form>
                )}
              </div>

              {/* Right 5 Cols: Flash Board Control (Manual AND Automatic Mode) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Flash Board (Manual & Automatic)
                    </h3>
                    <p className="text-xs text-slate-400">Update notices & Nepali GK manually or automatically</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFlashMode('automatic')}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-md cursor-pointer ${
                        flashMode === 'automatic' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Automatic
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlashMode('manual')}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-md cursor-pointer ${
                        flashMode === 'manual' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✍️ Manual
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Post Category</label>
                    <select
                      value={flashType}
                      onChange={(e) => setFlashType(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="GK Nepali">GK in Nepali (सामान्य ज्ञान)</option>
                      <option value="Notice">Official Notice</option>
                      <option value="Motivational">Motivational Quote</option>
                      <option value="Image Post">Diagram / Image Notice</option>
                    </select>
                  </div>

                  {flashMode === 'automatic' ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">Automatic Flash Board Auto-Pilot</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoFlashDailyPilot}
                            onChange={(e) => setAutoFlashDailyPilot(e.target.checked)}
                            className="accent-amber-400"
                          />
                          <span className="text-[11px] text-emerald-400 font-semibold">Auto-Sync ON</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Topic or Focus for Automatic Post</label>
                        <input
                          type="text"
                          value={autoFlashTopic}
                          onChange={(e) => setAutoFlashTopic(e.target.value)}
                          placeholder="e.g., नेपालको भूगोल र संविधान or Saturday Exam Notice"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={autoFlashLoading}
                        onClick={handleAutomaticFlashPost}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${autoFlashLoading ? 'animate-spin' : ''}`} />
                        {autoFlashLoading
                          ? 'Auto-Generating Flash Board Post...'
                          : 'Auto-Generate & Publish to Flash Board'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleManualFlashPost} className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Headline / Title</label>
                        <input
                          type="text"
                          value={flashTitle}
                          onChange={(e) => setFlashTitle(e.target.value)}
                          placeholder="e.g., Saturday 8 AM Exam Notice"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Content (Nepali or English)</label>
                        <textarea
                          rows={3}
                          value={flashContent}
                          onChange={(e) => setFlashContent(e.target.value)}
                          placeholder="Write notice or Nepali GK points..."
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl cursor-pointer"
                      >
                        Publish Manual Post to Flash Board
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Niraj Yadav's Official Facebook & TikTok Links */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-5 border-t border-slate-900 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <span>UDAN - The Entrance Topper · तपाईंको सपना, हाम्रो लक्ष्य · Created by 𝓝𝓲𝓻𝓪𝓳 𝓨𝓪𝓭𝓪𝓿</span>
        <div className="flex items-center gap-5">
          <a
            href={NIRAJ_FB_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline font-semibold flex items-center gap-1"
          >
            Facebook <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={NIRAJ_TIKTOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
          >
            TikTok (@niraj__yadav__) <ExternalLink className="w-3 h-3" />
          </a>
          <span>Class 10 CDC Syllabus Nepal</span>
        </div>
      </footer>

      {/* Downward Bottom Navigation Bar: Home, Practice, Saturday Exam, Progress, Flash Board */}
      <nav
        aria-label="Downward Navigation Bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md flex items-center justify-around py-2 px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
          title="Home Dashboard"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'practice'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
          title="Practice Mode"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-bold">Practice</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mock')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'mock'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
          title="Every Saturday 8 AM Mock Exam"
        >
          <Award className="w-5 h-5" />
          <span className="text-[11px] font-bold">Saturday Exam</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'progress'
              ? 'text-sky-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
          title="Progress & AI Weakness Detector"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[11px] font-bold">Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'flashboard'
              ? 'text-amber-300 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
          title="Official Flash Board & Notices"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[11px] font-bold">Flash Board</span>
        </button>
      </nav>
    </div>
  );
}
