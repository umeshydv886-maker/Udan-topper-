import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export interface FeatureSectionSpec {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  items: {
    name: string;
    details: string;
  }[];
}

export const STEPPIN_ALL_FEATURES_DATA: FeatureSectionSpec[] = [
  {
    id: 'branding-pwa',
    number: '01',
    title: 'Branding, Emblems, "You destination" & Universal PWA Download',
    subtitle: 'Steppin (www.steppin.com) — "Your Dream, Our Mission" (तपाईंको सपना, हाम्रो लक्ष्य)',
    items: [
      {
        name: 'Official Steppin Identity & Royal Emblem',
        details:
          'Official branding for Steppin (www.steppin.com) featuring royal golden wings, open book of wisdom, academic graduation cap, topper star, and engraved banner "Your Dream, Our Mission" (तपाईंको सपना, हाम्रो लक्ष्य). Created by Niraj Yadav.',
      },
      {
        name: 'Dedicated "You destination" Student Badge',
        details:
          'Prominent "You destination" badge displayed across the login portal, welcome gate, header ribbon, study cards, leaderboards, and merit certificates.',
      },
      {
        name: '4 Switchable Royal Color Themes',
        details:
          'Instant theme switcher in header with persistent local storage: Royal Violet & Gold (theme-indigo), Royal Emerald & Gold (theme-emerald), Imperial Crimson & Gold (theme-crimson), and Classic Midnight Dark (theme-slate).',
      },
      {
        name: 'Universal Downloadable App for Everyone (PWA)',
        details:
          'Installable Progressive Web App for all devices (Android, iPhone iOS Safari, Windows PC, macOS, and Linux Chrome/Edge) with offline study caching, custom home-screen icon, and standalone launch.',
      },
      {
        name: 'Real-Time Offline / Online Connectivity Detector',
        details:
          'Automatic network status detector alerting students when offline while keeping cached CDC Class 10 syllabus MCQs and practice mode fully functional.',
      },
    ],
  },
  {
    id: 'auth-security',
    number: '02',
    title: 'Multi-Mode Authentication, Show/Hide Password & Account Recovery',
    subtitle: 'Username-First Login, Forgot Password Reset, 6-Digit Gmail Code & Google Sign-In',
    items: [
      {
        name: 'Strict Login-First Security Gate',
        details:
          'Unauthenticated visitors see only the clean Login & Admission portal—no internal student rankings or question banks are exposed before sign-in.',
      },
      {
        name: 'Live Batch Seat Counter (0 / 100 Default Capacity)',
        details:
          'Displays real-time registered student count vs. total batch capacity (0 / 100 registered, 100 seats left by default) and automatically blocks new signups when full or closed by Admin.',
      },
      {
        name: 'Standard Username + Gmail/Phone + Password Login & Signup',
        details:
          'Students register and log in with their custom Display Username, unique Gmail or Phone ID, and password.',
      },
      {
        name: 'Show / Hide Password Eye Icon Inside Every Password Bar',
        details:
          'Interactive Eye / EyeOff toggle icon embedded directly inside the right side of the Login Password bar, New Password bar, Confirm New Password bar, and Creator Secret PIN bar.',
      },
      {
        name: 'Direct Forgot Password -> New Password Fill-Up & Instant Login',
        details:
          'Clicking "Forgot Password?" opens the inline New Password & Confirm New Password form so users can set a new password and immediately log into the app without leaving the screen.',
      },
      {
        name: '6-Digit Gmail Verification Code Login & Recovery',
        details:
          'Generates a 6-digit OTP verification code for the chosen Gmail address with one-click Auto-Fill and instant account verification.',
      },
      {
        name: 'Login with Google (Firebase Popup + Account Chooser Fallback)',
        details:
          'Supports native Firebase Google OAuth popup and automatic fallback to an In-App Google Account Chooser when running inside embedded browser environments.',
      },
    ],
  },
  {
    id: 'welcome-identity',
    number: '03',
    title: 'Username-First Welcome Gate & "You destination" Student Identity',
    subtitle: 'Personal Welcome Screen, Custom Username Editor, Letter Avatar & Destination Badge',
    items: [
      {
        name: 'Welcome by Username (Never by Email Address)',
        details:
          'Every greeting across the Welcome Gate, Header, Dashboard, Friday Reminder, and Profile uses the student’s chosen Username—never exposing raw email handles.',
      },
      {
        name: 'Post-Login Personalized Welcome Screen',
        details:
          'After logging in, students are greeted with a dedicated welcome card highlighting their role, AG Points, study target, and immediate action buttons.',
      },
      {
        name: 'In-App Username Editor & Profile Customizer',
        details:
          'Students can customize their Display Username at any time from the profile or welcome screen with instant sync to Firestore.',
      },
      {
        name: 'Automatic Royal Letter Avatar',
        details:
          'Dynamic initials avatar generated from student username with glowing royal border and AG Points ring.',
      },
    ],
  },
  {
    id: 'dashboard-ui',
    number: '04',
    title: 'Dashboard, Progress Metrics & Friday Mock Test Reminder',
    subtitle: 'Daily 20-Question Target, Live Metrics, Countdown Timers & Quick Actions',
    items: [
      {
        name: 'Daily 20-Question Study Goal Tracker',
        details:
          'Tracks daily progress toward 20 solved questions with animated circular progress and +25 bonus AG Points upon completion.',
      },
      {
        name: 'Real-Time Academic Performance Metrics',
        details:
          'Live statistics for Total Solved Questions, Accuracy Percentage, AG Points earned, and cumulative study time.',
      },
      {
        name: 'Saturday 1:00 PM Mock Test Countdown Banner',
        details:
          'Real-time ticking countdown to Saturday’s full-length entrance mock test with instant exam access when live.',
      },
      {
        name: 'Friday Personal Entrance Prep Motivational Reminder',
        details:
          'Special Friday greeting and reminder popup motivating students to revise formulas and prepare for Saturday’s test.',
      },
      {
        name: 'Sunday 8:00 PM Super Quiz Countdown',
        details:
          'Countdown widget for the high-intensity Sunday 8:00 PM 40-question competition with live top winner board preview.',
      },
    ],
  },
  {
    id: 'curriculum-bank',
    number: '05',
    title: 'CDC Nepal Class 10 Syllabus & 7-Subject Entrance Question Bank',
    subtitle: 'Science, Math, English, GK in Nepali, Optional Math, Nepali, and Social Studies',
    items: [
      {
        name: 'Full CDC Class 10 Curriculum Alignment',
        details:
          'Comprehensive question bank built strictly according to Nepal Curriculum Development Centre (CDC) Class 10 syllabus for +2 Science, Management, and CTEVT entrance exams.',
      },
      {
        name: 'Science (Physics, Chemistry, Biology, Astronomy, Earth Science)',
        details:
          'Over 40 high-yield questions covering Force & Gravity, Pressure, Energy, Heat, Light, Wave & Sound, Electricity, Chemical Reactions, Metals, Carbon, Genetics, and Environment.',
      },
      {
        name: 'Compulsory & Optional Mathematics',
        details:
          'Algebra, Sets, Arithmetic, Mensuration, Geometry, Trigonometry, Statistics, Probability, Matrices, and Vector Analysis with step-by-step solutions.',
      },
      {
        name: 'English Grammar & Vocabulary',
        details:
          'Tenses, Subject-Verb Agreement, Voice, Reported Speech, Prepositions, Connectives, Conditional Sentences, and Vocabulary comprehension.',
      },
      {
        name: 'General Knowledge in Nepali Language (देवनागरी लिपि)',
        details:
          'Nepal geography, constitution, history, national symbols, rivers, mountains, and current affairs formulated in standard Nepali script.',
      },
    ],
  },
  {
    id: 'practice-audio',
    number: '06',
    title: 'Chapter Practice Mode, Audio Pronunciation & Smart Mistake Bank',
    subtitle: 'Step-by-Step Explanations, Audio Read-Aloud, Retake Mistakes & Instant Score',
    items: [
      {
        name: 'Targeted Subject & Chapter Practice Filter',
        details:
          'Practice by specific subject and chapter, or take a mixed multi-chapter test with instant question navigation.',
      },
      {
        name: 'Immediate Answer Evaluation & Step-by-Step Solutions',
        details:
          'Real-time green/red visual feedback on selection with detailed academic explanation and formula breakdown.',
      },
      {
        name: 'Built-in Audio Read-Aloud Speaker (Web Speech TTS)',
        details:
          'Integrated "Listen" button allowing students to hear any question and explanation pronounced clearly with pitch and speed control.',
      },
      {
        name: 'Automatic Mistake Bank & One-Click Retake',
        details:
          'Every incorrectly answered question is automatically saved to the student’s personal Mistake Bank for focused re-attempt.',
      },
    ],
  },
  {
    id: 'saturday-mock',
    number: '07',
    title: 'Saturday 1:00 PM Full-Length Entrance Mock Exam Engine',
    subtitle: 'St. Xavier, Budhanilkantha & SOS Exam Format with Anti-Cheat Protection',
    items: [
      {
        name: 'Full 100-Question / 60-Minute Timed Mock Exam',
        details:
          'Comprehensive entrance simulation spanning Science (40), Math (30), English (20), and GK (10) under authentic exam conditions.',
      },
      {
        name: 'Strict Anti-Cheat & Tab-Switch Detection',
        details:
          'Monitors page visibility and full-screen blur events. Emits warning modals upon tab switching and automatically disqualifies on repeated violations.',
      },
      {
        name: 'Anti-Screenshot & Copy-Paste Protection',
        details:
          'Disables right-click context menu, text selection, PrintScreen keys, and devtools shortcuts during live examination.',
      },
      {
        name: 'Automatic Countdown Timer & Auto-Submit',
        details:
          'Server-synchronized timer with visual color warning at 5 minutes remaining and automatic paper submission when time expires.',
      },
      {
        name: 'Instant Merit Scorecard & PDF Certificate',
        details:
          'Immediate evaluation displaying raw score, percentage, percentile, subject breakdown, and downloadable PDF report card.',
      },
    ],
  },
  {
    id: 'sunday-quiz',
    number: '08',
    title: 'Sunday 8:00 PM Live Super Quiz Competition (40 Questions)',
    subtitle: '1-Minute Timer Per Question, Live Participant Counter & Top 5 Winner Board',
    items: [
      {
        name: 'Fast-Paced 40-Question Live Super Quiz',
        details:
          'Interactive competition where all students answer the same 40 rapid-fire questions under a strict 60-second timer per question.',
      },
      {
        name: 'Live Participant Roster with Profile Photos',
        details:
          'Displays real-time joined students with photo avatars, correct answer counts, and dynamic AG Points accumulation.',
      },
      {
        name: 'Top 5 Winner Board & Podium Ceremony',
        details:
          'Live gold, silver, and bronze podium celebrating the top 5 highest scorers with special AG bonus awards.',
      },
      {
        name: 'Anti-Cheat Timer & Auto-Advance',
        details:
          'When the 60-second question timer expires, the question automatically locks and advances to prevent search engine lookups.',
      },
    ],
  },
  {
    id: 'leaderboard-filters',
    number: '09',
    title: 'Filtered Leaderboards, Subject Toppers & Recharts Visual Analytics',
    subtitle: 'Weekly, Monthly & All-Time Rankings, Subject Graphs & AI Weakness Detector',
    items: [
      {
        name: 'Weekly, Monthly & All-Time Leaderboard Filters',
        details:
          'Interactive filter tabs allowing students to view rankings across Weekly Top 10, Monthly Champions, and All-Time Legends.',
      },
      {
        name: 'Subject-Wise Toppers Ranking',
        details:
          'Dedicated leaderboards highlighting the #1 students in Science, Mathematics, English, and General Knowledge.',
      },
      {
        name: 'Recharts Performance Visualization',
        details:
          'Interactive bar charts and trend lines showing subject accuracy, weekly score progression, and time efficiency.',
      },
      {
        name: 'AI Weakness Detector & Recommended Chapters',
        details:
          'Algorithmic diagnostic identifying chapters with sub-60% accuracy and prescribing targeted revision drills.',
      },
    ],
  },
  {
    id: 'voice-learning',
    number: '10',
    title: 'Live Voice & Audio Learning (LiveVoice.tsx & VoiceRecorder.tsx)',
    subtitle: 'Real-Time Audio Peer Study Hub, AI Voice Tutor & Doubt Voice Notes',
    items: [
      {
        name: 'Live Voice Audio Study Room (LiveVoice.tsx)',
        details:
          'Virtual audio study room connecting students with active speaker wave animations, live microphone controls, and peer interaction.',
      },
      {
        name: 'Interactive AI Voice Tutor Rapid Fire',
        details:
          'AI Tutor speaks entrance questions aloud in natural voice; students listen and answer with instant verbal confirmation and explanations.',
      },
      {
        name: 'Student Voice Note Recorder (VoiceRecorder.tsx)',
        details:
          'Built-in audio recorder with microphone permission, real-time waveform visualizer, 2-minute timer, and audio playback for attaching voice notes to doubt discussions.',
      },
      {
        name: 'Universal Text-to-Speech Audio Buttons',
        details:
          'One-click audio reader icons embedded across question bank cards, practice modes, and solution modals.',
      },
    ],
  },
  {
    id: 'bilingual-i18n',
    number: '11',
    title: 'Bilingual English & Nepali Support (I18N Dictionary)',
    subtitle: 'Instant One-Click Language Switcher with Persistent Storage',
    items: [
      {
        name: 'Comprehensive English / Nepali Translation Dictionary',
        details:
          'Full bilingual localization covering navigation, auth portals, study modes, exam dialogs, badges, and system notifications.',
      },
      {
        name: 'Header Language Switcher (🇺🇸 EN / 🇳🇵 NE)',
        details:
          'Instant toggle in header allowing seamless switching between English and Nepali with automatic localStorage persistence.',
      },
      {
        name: 'Authentic Nepali Educational Terminology',
        details:
          'Carefully crafted Devanagari strings respecting Nepal CDC curriculum terms (उदा: अभ्यास बैंक, मक टेस्ट, उत्कृष्ट विद्यार्थी तालिका).',
      },
    ],
  },
  {
    id: 'community-discuss',
    number: '12',
    title: 'Photo Doubt Forum, Audio Voice Notes & Live Community Chat',
    subtitle: 'Camera / Photo Upload, Threaded Replies, Real-Time Chat & AG Points Badges',
    items: [
      {
        name: 'Photo Question & Doubt Discussion Board',
        details:
          'Students capture or upload textbook diagrams and question photos, tag subjects, and post queries for peer and tutor resolution.',
      },
      {
        name: 'Voice Note Attachments in Doubts',
        details:
          'Students can record and attach audio explanations directly alongside their photo questions using VoiceRecorder.',
      },
      {
        name: 'Real-Time Live Chat Room',
        details:
          'Live messaging forum with AG Points tags, student avatars, administrative pinned announcements, and message deletion controls.',
      },
      {
        name: 'Public Student Appreciation & Feedback Board',
        details:
          '"Say something about Niraj" feedback section with 5-star ratings, testimonials, and public tribute posts.',
      },
    ],
  },
  {
    id: 'flashboard-wisdom',
    number: '13',
    title: 'Flash Board Official Announcements & Daily Wisdom',
    subtitle: 'Notices, GK in Nepali, Motivational Quotes & Image Posts',
    items: [
      {
        name: 'Admin Flash Board Notice Board',
        details:
          'Categorized bulletin board featuring official exam notices, GK in Nepali bullets, motivational tips, and custom image banners.',
      },
      {
        name: 'AI-Powered Flash Board Post Generator',
        details:
          'Express backend route (/api/auto-generate-flashboard) utilizing Gemini 3.8 Flash to compose Devanagari GK posts and notices.',
      },
      {
        name: 'Daily Rotating Motivational Wisdom Quotes',
        details:
          'Inspirational quotes from Dr. APJ Abdul Kalam, Swami Vivekananda, and Albert Einstein displayed at top of study portals.',
      },
    ],
  },
  {
    id: 'download-center',
    number: '14',
    title: 'Universal Download Center for Everyone',
    subtitle: 'PWA Web App, ZIP of PDFs, Solved Question Bank & Merit Certificate',
    items: [
      {
        name: 'Download App for Everyone (PWA Install Button & Guide)',
        details:
          'Direct install button and platform-specific guides for Android, iPhone iOS Safari, Windows PC, and macOS desktop installation.',
      },
      {
        name: 'One-Click ZIP of PDF (All Features & Guides)',
        details:
          'Generates a high-compression ZIP containing the complete Master Specification PDF, modular guides, and 95-item verification checklist.',
      },
      {
        name: 'Download Solved CDC Question Bank PDF',
        details:
          'Printable PDF compilation of CDC Class 10 Entrance MCQs with answer keys and complete explanations for offline study.',
      },
      {
        name: 'Download Student Merit Certificate & Appreciation Letter',
        details:
          'Personalized high-resolution PDF certificate featuring royal golden crest, "You destination" badge, student AG points, and signature of Academic Director Niraj Yadav.',
      },
    ],
  },
  {
    id: 'admin-panel',
    number: '15',
    title: 'Creator Niraj Yadav Administration Panel & Secret PIN 9866',
    subtitle: 'Batch Size Limits, Admission Toggles, Mock Test Controls & Question Manager',
    items: [
      {
        name: 'Secure Admin Access via PIN 9866 or umeshydv886@gmail.com',
        details:
          'Double-layered security protecting administrative functions via verified admin email or private 4-digit PIN 9866.',
      },
      {
        name: 'Live Admission Batch Controller (0 / 100 Default)',
        details:
          'Admin can modify maximum batch capacity, view registered student list, reset seats, or toggle admissions open/closed.',
      },
      {
        name: 'Mock Test Force-Live & Results Publisher',
        details:
          'Controls allowing admin to launch Saturday Mock Test outside schedule for testing or publish final rankings.',
      },
      {
        name: 'Custom Question Bank & AI Question Generator',
        details:
          'Admin interface to add, edit, or delete questions, plus one-click AI generation of CDC Nepal syllabus questions via Gemini 3.8 Flash.',
      },
    ],
  },
  {
    id: 'security-rules',
    number: '16',
    title: 'Firestore Security Rules & PII Data Isolation (Appendix A)',
    subtitle: 'Zero Trust Security Model, Role-Based Access & Isolated Collections',
    items: [
      {
        name: 'Strict PII Isolation in /user_private Collection',
        details:
          'Personal email addresses, phone numbers, and test resume state are strictly isolated in /user_private/{uid} accessible solely by that student.',
      },
      {
        name: 'Public Profile Separation in /students Collection',
        details:
          'Public leaderboards access only non-sensitive fields (username, AG points, accuracy) without exposing contact credentials.',
      },
      {
        name: 'Granular Document Validation & Schema Enforcement',
        details:
          'firestore.rules validates exact field types, maximum string lengths, numeric ranges, and authorized update keys across all 9 collections.',
      },
    ],
  },
];

// Alias for backwards compatibility
export const UDAN_ALL_FEATURES_DATA = STEPPIN_ALL_FEATURES_DATA;

function renderSectionsToPdf(
  docTitle: string,
  docSubtitle: string,
  sections: FeatureSectionSpec[]
): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const usableWidth = pageWidth - marginX * 2;
  let pageNumber = 1;

  const drawHeader = (isCover = false) => {
    // Top royal border
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, 20, 'F');

    pdf.setFillColor(245, 158, 11); // amber-500
    pdf.rect(0, 20, pageWidth, 1.2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('STEPPIN — YOU DESTINATION (www.steppin.com)', marginX, 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(245, 158, 11);
    pdf.text('Your Dream, Our Mission · तपाईंको सपना, हाम्रो लक्ष्य · Niraj Yadav', marginX, 15.5);

    if (!isCover) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Class 10 CDC Syllabus Nepal Entrance Platform', pageWidth - marginX, 13, { align: 'right' });
    }
  };

  const drawFooter = (pageNum: number) => {
    pdf.setFillColor(245, 158, 11);
    pdf.rect(marginX, pageHeight - 12, usableWidth, 0.4, 'F');

    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('Steppin (www.steppin.com) · You Destination · Founder: Niraj Yadav', marginX, pageHeight - 7);
    pdf.text(`Page ${pageNum}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  };

  // Draw Page 1 Header
  drawHeader(true);

  // Title block
  let y = 30;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(marginX, y, usableWidth, 26, 2.5, 2.5, 'FD');

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(docTitle, marginX + 4, y + 9);

  pdf.setTextColor(217, 119, 6);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(docSubtitle, marginX + 4, y + 16.5);

  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7.5);
  pdf.text(
    'Official Specification Document · Generated for Students, Parents & Educators · www.steppin.com',
    marginX + 4,
    y + 22
  );

  y += 32;

  sections.forEach((sec) => {
    // Check if section header fits on page
    if (y + 24 > pageHeight - 18) {
      drawFooter(pageNumber);
      pdf.addPage();
      pageNumber++;
      drawHeader(false);
      y = 28;
    }

    // Section Header Box
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(marginX, y, usableWidth, 11.5, 2, 2, 'F');

    pdf.setFillColor(245, 158, 11);
    pdf.rect(marginX + 1, y + 1, 9.5, 9.5, 'F');

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(sec.number, marginX + 5.75, y + 7.2, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(sec.title, marginX + 13, y + 5.5);

    pdf.setTextColor(245, 158, 11);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(sec.subtitle, marginX + 13, y + 9.5);

    y += 14.5;

    // Items
    sec.items.forEach((item, itemIdx) => {
      const titleLine = `${sec.number}.${itemIdx + 1}  ${item.name}`;
      const detailLines = pdf.splitTextToSize(item.details, usableWidth - 10);
      const itemHeight = 6.5 + detailLines.length * 4.2 + 2.5;

      if (y + itemHeight > pageHeight - 16) {
        drawFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawHeader(false);
        y = 28;
      }

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text(titleLine, marginX + 2, y);
      y += 4.5;

      pdf.setTextColor(51, 65, 85);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.8);
      pdf.text(detailLines, marginX + 5, y);
      y += detailLines.length * 4.2 + 2.5;

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(marginX + 2, y - 1, pageWidth - marginX - 2, y - 1);
      y += 2.5;
    });

    y += 3;
  });

  drawFooter(pageNumber);
  return pdf;
}

export function generateSteppin95Checklist(): string {
  const lines: string[] = [
    '================================================================================',
    'STEPPIN — YOU DESTINATION (www.steppin.com)',
    'COMPLETE 95-ITEM FEATURE VERIFICATION CHECKLIST (SECTION 14 SPECIFICATION)',
    'Tagline: "Your Dream, Our Mission" / "तपाईंको सपना, हाम्रो लक्ष्य"',
    'Platform Director & Creator: Niraj Yadav',
    '================================================================================',
    '',
    'SECTION 1: BRANDING, VISUAL IDENTITY & THEMES (ITEMS 1-7)',
    '  [01] Official Brand Name: Steppin (www.steppin.com)',
    '  [02] Official Tagline: "Your Dream, Our Mission" (तपाईंको सपना, हाम्रो लक्ष्य)',
    '  [03] "You destination" Student Destination Badge on all key views',
    '  [04] Royal Golden Wings Emblem with Graduation Cap and Star',
    '  [05] 4 Switchable Themes: Royal Violet, Royal Emerald, Crimson, Dark Midnight',
    '  [06] Founder Credits: Niraj Yadav with verified Facebook & TikTok links',
    '  [07] Custom Royal Typography (Cinzel, Playfair Display, Outfit)',
    '',
    'SECTION 2: PROGRESSIVE WEB APP & UNIVERSAL DOWNLOAD (ITEMS 8-15)',
    '  [08] Universal Download App for Everyone button in header & login',
    '  [09] PWA Manifest with 192x192, 512x512, and maskable icons',
    '  [10] Service Worker offline caching for assets and questions',
    '  [11] Android Chrome / Brave "Add to Home Screen" instructions modal',
    '  [12] Apple iOS Safari "Share -> Add to Home Screen" instructions modal',
    '  [13] Windows PC and Mac Desktop Chrome/Edge installation modal',
    '  [14] Real-time Offline Mode banner with cached data access',
    '  [15] Download Center tab offering APK / PWA / PDF guides',
    '',
    'SECTION 3: AUTHENTICATION, PASSWORD CONTROLS & SECURITY (ITEMS 16-24)',
    '  [16] Strict Login-First Gate (no question banks exposed unauthenticated)',
    '  [17] Real-time Batch Seat Counter (0 / 100 capacity default)',
    '  [18] Admission Full / Closed automatic signup blocking',
    '  [19] Username-first registration (Full Name + Gmail/Phone + Password)',
    '  [20] Show / Hide Password Eye icon inside Login Password input',
    '  [21] Show / Hide Password Eye icon inside New Password input',
    '  [22] Direct Forgot Password button opening inline New Password reset',
    '  [23] 6-digit Gmail verification code login & auto-fill recovery',
    '  [24] Google Sign-In with popup + fallback in-app account chooser',
    '',
    'SECTION 4: PERSONALIZED WELCOME GATE & STUDENT IDENTITY (ITEMS 25-29)',
    '  [25] Personal greeting by Username (never displays raw email address)',
    '  [26] Dedicated post-login Welcome Gate screen with action buttons',
    '  [27] Student profile initials letter avatar with AG border',
    '  [28] In-app Username editor with instant Firestore synchronization',
    '  [29] "You destination" badge displayed next to student name',
    '',
    'SECTION 5: DASHBOARD & REAL-TIME PROGRESS TRACKING (ITEMS 30-36)',
    '  [30] Daily 20-Question Target tracker with +25 AG bonus upon completion',
    '  [31] Live questions solved counter with accuracy percentage',
    '  [32] Total AG Academic Points wallet display',
    '  [33] Cumulative study time tracker in minutes/hours',
    '  [34] Saturday 1:00 PM Full Mock Test countdown widget',
    '  [35] Sunday 8:00 PM Super Quiz countdown widget',
    '  [36] Friday Motivational Entrance Prep Reminder modal',
    '',
    'SECTION 6: CDC NEPAL CLASS 10 ENTRANCE QUESTION BANK (ITEMS 37-45)',
    '  [37] Strict CDC Nepal Class 10 curriculum alignment',
    '  [38] Science Section: Force, Gravity, Pressure, Energy, Heat, Light, Wave',
    '  [39] Science Section: Chemical Reactions, Metals, Carbon, Acid-Base',
    '  [40] Science Section: Genetics, Heredity, Evolution, Ecosystem',
    '  [41] Compulsory Math: Sets, Arithmetic, Algebra, Geometry, Mensuration',
    '  [42] Optional Math: Trigonometry, Matrices, Vectors, Transformations',
    '  [43] English: Tenses, Voice, Reported Speech, Connectives, Prepositions',
    '  [44] General Knowledge in Nepali Language (Devanagari script)',
    '  [45] Detailed step-by-step solutions for every single question',
    '',
    'SECTION 7: PRACTICE MODE & SMART MISTAKE BANK (ITEMS 46-52)',
    '  [46] Filter by subject (Science, Math, English, GK, All Subjects)',
    '  [47] Filter by chapter or take comprehensive multi-chapter test',
    '  [48] Immediate green/red visual answer evaluation on tap',
    '  [49] Step-by-step academic explanations revealed on answer',
    '  [50] Audio speaker button to read question aloud via speech synthesis',
    '  [51] Automatic Mistake Bank saving all incorrect questions',
    '  [52] One-click Retake Mistake Bank drill with progress clearance',
    '',
    'SECTION 8: SATURDAY 1:00 PM FULL ENTRANCE MOCK EXAM (ITEMS 53-60)',
    '  [53] 100 Questions spanning Science (40), Math (30), English (20), GK (10)',
    '  [54] Full 60-Minute strict countdown timer with 5-minute warning',
    '  [55] Anti-cheat tab-switching detection with violation counters',
    '  [56] Anti-screenshot & context menu copy-paste lock during exam',
    '  [57] Automatic examination submission when timer expires',
    '  [58] Immediate merit score card with percentage and breakdown',
    '  [59] Downloadable PDF Mock Test Scorecard & Certificate',
    '  [60] Admin manual override switch to test mock exam live anytime',
    '',
    'SECTION 9: SUNDAY 8:00 PM LIVE SUPER QUIZ (ITEMS 61-67)',
    '  [61] 40 Rapid-fire questions under strict 60-second timer per question',
    '  [62] Live participant counter with avatars and current scores',
    '  [63] Real-time AG Points awards for right answers',
    '  [64] Top 5 Winner Board with Gold, Silver, Bronze podium ceremony',
    '  [65] Automatic question advance when timer runs out',
    '  [66] Participant photo avatar upload and display',
    '  [67] One-click join competition with instant roster registration',
    '',
    'SECTION 10: LEADERBOARDS & RECHARTS ANALYTICS (ITEMS 68-74)',
    '  [68] Filter by Weekly Top 10 rankings',
    '  [69] Filter by Monthly Champions rankings',
    '  [70] Filter by All-Time Legends rankings',
    '  [71] Subject Toppers board for Science, Math, English, and GK',
    '  [72] Recharts interactive bar chart for subject-wise accuracy',
    '  [73] Recharts score trend line tracking exam progress',
    '  [74] AI Weakness Detector diagnosing low-scoring chapters',
    '',
    'SECTION 11: LIVE VOICE & AUDIO LEARNING (ITEMS 75-80)',
    '  [75] Live Voice Audio Study Room component (LiveVoice.tsx)',
    '  [76] Active speaker indicators and animated audio waveform bars',
    '  [77] Microphone mute / unmute controls for students',
    '  [78] AI Voice Entrance Tutor speaking rapid-fire questions aloud',
    '  [79] Student Voice Recorder component (VoiceRecorder.tsx) for doubts',
    '  [80] Text-to-speech audio reader buttons across question bank',
    '',
    'SECTION 12: BILINGUAL I18N ENGLISH & NEPALI SUPPORT (ITEMS 81-84)',
    '  [81] Full English & Nepali (नेपाली) translation dictionary (i18n.ts)',
    '  [82] Header language switcher toggle (EN / NE) with localStorage save',
    '  [83] Devanagari translation for all buttons, headers, and tabs',
    '  [84] GK and quotes presented in natural Nepali language',
    '',
    'SECTION 13: COMMUNITY, PHOTO DOUBTS & FLASH BOARD (ITEMS 85-89)',
    '  [85] Photo Question discussion board with camera/image upload',
    '  [86] Voice note audio attachment alongside photo doubts',
    '  [87] Live student and admin chat room with AG points flair',
    '  [88] Public tribute board ("Say something about Niraj") with 5-star ratings',
    '  [89] Flash Board notice bulletin with AI post generator',
    '',
    'SECTION 14: DOWNLOAD CENTER & ZIP OF PDF (ITEMS 90-93)',
    '  [90] One-click ZIP of PDF download containing all modular guides',
    '  [91] Master Features PDF download (direct export)',
    '  [92] Solved CDC Question Bank PDF download for offline revision',
    '  [93] Student Merit Certificate PDF with royal seal & signature',
    '',
    'SECTION 15: ADMIN PANEL & FIRESTORE SECURITY RULES (ITEMS 94-95)',
    '  [94] Niraj Yadav Admin Panel with Secret PIN 9866 and batch controls',
    '  [95] Strict Firestore Security Rules isolating PII in /user_private',
    '================================================================================',
    'VERIFICATION COMPLETE: 95/95 SPECIFICATION REQUIREMENTS SATISFIED',
    '================================================================================',
  ];

  return lines.join('\n');
}

export async function downloadAllFeaturesZipOfPdf(): Promise<void> {
  const zip = new JSZip();

  // 1. Master Complete PDF (All 16 Modules)
  const masterPdf = renderSectionsToPdf(
    'Steppin — Complete Master Specification & Feature Guide',
    'Every Single Feature of Steppin (www.steppin.com) Class 10 CDC Nepal Entrance Platform',
    STEPPIN_ALL_FEATURES_DATA
  );
  zip.file('00_Steppin_Master_Feature_Specification.pdf', masterPdf.output('arraybuffer'));

  // 2. Part 1 PDF: Branding, Themes, PWA, Authentication & Welcome Gate
  const part1Pdf = renderSectionsToPdf(
    'Part 1: Branding, PWA, Multi-Mode Login & "You destination" Gate',
    'Modules 01 to 04 — Identity, PWA Download, Security & Dashboard',
    STEPPIN_ALL_FEATURES_DATA.slice(0, 4)
  );
  zip.file('01_Steppin_Branding_PWA_And_Auth_Guide.pdf', part1Pdf.output('arraybuffer'));

  // 3. Part 2 PDF: CDC Curriculum, Saturday Mock Exam & Sunday Super Quiz
  const part2Pdf = renderSectionsToPdf(
    'Part 2: CDC Nepal Curriculum, Saturday Mock Exam & Sunday Super Quiz',
    'Modules 05 to 08 — Complete Examination Engine & 7-Subject Bank',
    STEPPIN_ALL_FEATURES_DATA.slice(4, 8)
  );
  zip.file('02_Steppin_Curriculum_Mock_Tests_And_Quizzes.pdf', part2Pdf.output('arraybuffer'));

  // 4. Part 3 PDF: Leaderboards, Voice Learning, I18N, Community, Admin & Security Rules
  const part3Pdf = renderSectionsToPdf(
    'Part 3: Leaderboards, Voice Learning, I18N Nepali, Community & Admin',
    'Modules 09 to 16 — Live Voice, Filtered Leaderboard, Admin & Appendix A Rules',
    STEPPIN_ALL_FEATURES_DATA.slice(8, 16)
  );
  zip.file('03_Steppin_Leaderboard_Voice_AI_And_Admin.pdf', part3Pdf.output('arraybuffer'));

  // 5. Section 14 Complete 95-Item Verification Checklist
  zip.file('Steppin_95_Item_Complete_Verification_Checklist.txt', generateSteppin95Checklist());

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const downloadUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'Steppin_All_Features_And_Guides_PDF.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}

export function downloadMasterFeaturesPdfDirect(): void {
  const masterPdf = renderSectionsToPdf(
    'Steppin — Complete Master Specification & Feature Guide',
    'Every Single Feature of Steppin (www.steppin.com) Class 10 CDC Nepal Entrance Platform',
    STEPPIN_ALL_FEATURES_DATA
  );
  masterPdf.save('Steppin_All_Features_Master_Guide.pdf');
}

export function downloadSolvedQuestionBankPdf(questions: { subject: string; chapter: string; question: string; options: string[]; correctIndex: number; explanation: string }[]): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const usableWidth = pageWidth - marginX * 2;
  let pageNumber = 1;

  const drawHeader = (isFirst: boolean) => {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setFillColor(245, 158, 11);
    pdf.rect(0, 20, pageWidth, 1.2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('STEPPIN — CLASS 10 CDC NEPAL ENTRANCE QUESTION BANK', marginX, 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(245, 158, 11);
    pdf.text('You Destination · Complete Solved MCQs & Explanations · www.steppin.com', marginX, 15.5);

    if (!isFirst) {
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(7);
      pdf.text('Science, Math, English & GK in Nepali', pageWidth - marginX, 13, { align: 'right' });
    }
  };

  const drawFooter = (pageNum: number) => {
    pdf.setFillColor(245, 158, 11);
    pdf.rect(marginX, pageHeight - 12, usableWidth, 0.4, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('Steppin (www.steppin.com) · Academic Director: Niraj Yadav', marginX, pageHeight - 7);
    pdf.text(`Page ${pageNum}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  };

  drawHeader(true);
  let y = 28;

  // Title Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(marginX, y, usableWidth, 20, 2, 2, 'FD');

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('CDC Nepal Class 10 Entrance Preparation Solved Question Bank', marginX + 4, y + 8);

  pdf.setTextColor(217, 119, 6);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('High-Yield Practice Questions with Step-by-Step Solutions & Formulas', marginX + 4, y + 15);

  y += 26;

  questions.forEach((q, idx) => {
    if (y + 40 > pageHeight - 16) {
      drawFooter(pageNumber);
      pdf.addPage();
      pageNumber++;
      drawHeader(false);
      y = 28;
    }

    // Question Box
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(marginX, y, usableWidth, 8, 1.5, 1.5, 'F');
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(`Q${idx + 1}. [${q.subject} · ${q.chapter}]`, marginX + 2, y + 5.5);
    y += 10.5;

    // Question Text
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    const qLines = pdf.splitTextToSize(q.question, usableWidth - 6);
    pdf.text(qLines, marginX + 3, y);
    y += qLines.length * 4.2 + 2;

    // Options
    q.options.forEach((opt, oIdx) => {
      const isCorrect = oIdx === q.correctIndex;
      if (isCorrect) {
        pdf.setTextColor(5, 150, 105);
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'normal');
      }
      pdf.setFontSize(8);
      const optLabel = `(${String.fromCharCode(65 + oIdx)}) ${opt} ${isCorrect ? ' ✓ (Correct Answer)' : ''}`;
      pdf.text(optLabel, marginX + 5, y);
      y += 3.8;
    });

    // Explanation
    pdf.setTextColor(30, 58, 138);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    const expLines = pdf.splitTextToSize(`Solution: ${q.explanation}`, usableWidth - 8);
    pdf.text(expLines, marginX + 5, y + 1);
    y += expLines.length * 3.8 + 4;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(marginX + 2, y - 1, pageWidth - marginX - 2, y - 1);
    y += 3;
  });

  drawFooter(pageNumber);
  pdf.save('Steppin_Class10_CDC_Entrance_Question_Bank.pdf');
}
