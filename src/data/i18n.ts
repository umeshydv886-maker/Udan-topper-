// Steppin I18N Dictionary — English and Nepali (नेपाली) Support
// As specified in Steppin Build Specification & Complete Guide

export type Language = 'en' | 'ne';

export interface TranslationDict {
  appName: string;
  websiteDomain: string;
  tagline: string;
  destinationBadge: string;
  creatorName: string;
  creatorTitle: string;
  nav: {
    dashboard: string;
    practice: string;
    mockTest: string;
    sundayQuiz: string;
    progress: string;
    leaderboard: string;
    voiceRoom: string;
    discuss: string;
    flashboard: string;
    downloadCenter: string;
    profile: string;
    admin: string;
    downloadApp: string;
  };
  auth: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    username: string;
    usernamePlaceholder: string;
    emailOrPhone: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    newPassword: string;
    confirmNewPassword: string;
    showPassword: string;
    hidePassword: string;
    forgotPassword: string;
    loginBtn: string;
    signupBtn: string;
    resetPasswordBtn: string;
    googleSignIn: string;
    gmailCodeLogin: string;
    seatsLeft: string;
    batchFull: string;
    rememberMe: string;
  };
  dashboard: {
    greeting: string;
    dailyGoal: string;
    questionsSolved: string;
    accuracy: string;
    agPoints: string;
    studyTime: string;
    continuePractice: string;
    saturdayMockTest: string;
    sundayLiveQuiz: string;
    voiceStudy: string;
    leaderboardRank: string;
    downloadZipPdf: string;
    installAppBanner: string;
  };
  practice: {
    title: string;
    subtitle: string;
    selectSubject: string;
    selectChapter: string;
    allChapters: string;
    startPractice: string;
    question: string;
    options: string;
    checkAnswer: string;
    nextQuestion: string;
    prevQuestion: string;
    explanation: string;
    listenAudio: string;
    stopAudio: string;
    addToMistakeBank: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    filterWeekly: string;
    filterMonthly: string;
    filterAllTime: string;
    rank: string;
    student: string;
    points: string;
    accuracy: string;
    topperBadge: string;
  };
  voice: {
    title: string;
    subtitle: string;
    liveRoom: string;
    recordDoubt: string;
    startRecording: string;
    stopRecording: string;
    listenPlayback: string;
    aiVoiceTutor: string;
    speakQuestion: string;
    joinVoiceRoom: string;
    leaveVoiceRoom: string;
  };
  download: {
    title: string;
    subtitle: string;
    downloadAppAll: string;
    downloadZipOfPdf: string;
    downloadQuestionsPdf: string;
    downloadOfflineBundle: string;
    downloadCertificate: string;
    androidGuide: string;
    iosGuide: string;
    pcGuide: string;
  };
  common: {
    loading: string;
    success: string;
    error: string;
    submit: string;
    cancel: string;
    close: string;
    offlineMode: string;
    youDestination: string;
  };
}

export const I18N: Record<Language, TranslationDict> = {
  en: {
    appName: 'Steppin',
    websiteDomain: 'www.steppin.com',
    tagline: 'Your Dream, Our Mission',
    destinationBadge: 'You destination',
    creatorName: 'Niraj Yadav',
    creatorTitle: 'Founder & Academic Director',
    nav: {
      dashboard: 'Dashboard',
      practice: 'Practice Bank',
      mockTest: 'Saturday Mock',
      sundayQuiz: 'Sunday 8PM Quiz',
      progress: 'Progress & AI',
      leaderboard: 'Leaderboard',
      voiceRoom: 'Live Voice & Audio',
      discuss: 'Doubt & Photo Forum',
      flashboard: 'Flash Board',
      downloadCenter: 'Download Center',
      profile: 'My Profile',
      admin: 'Admin Panel',
      downloadApp: 'Download App',
    },
    auth: {
      welcomeTitle: 'Step In To Your Future',
      welcomeSubtitle: 'Nepal Class 10 CDC Syllabus Entrance Portal',
      username: 'Full Name / Display Username',
      usernamePlaceholder: 'Enter your name (e.g. Aayush Sharma)',
      emailOrPhone: 'Gmail or Phone Number',
      emailPlaceholder: 'student@gmail.com or 98xxxxxxxx',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      forgotPassword: 'Forgot Password?',
      loginBtn: 'Sign In to Steppin',
      signupBtn: 'Register for 2026 Batch',
      resetPasswordBtn: 'Set New Password & Login',
      googleSignIn: 'Continue with Google',
      gmailCodeLogin: 'Login via 6-Digit Gmail OTP',
      seatsLeft: 'Seats Left',
      batchFull: 'Admission Closed — Batch Limit Reached',
      rememberMe: 'Remember my login',
    },
    dashboard: {
      greeting: 'Welcome back',
      dailyGoal: 'Daily Target (20 Qs)',
      questionsSolved: 'Questions Solved',
      accuracy: 'Average Accuracy',
      agPoints: 'AG Academic Points',
      studyTime: 'Total Study Time',
      continuePractice: 'Jump into Practice',
      saturdayMockTest: 'Saturday Mock Test (1:00 PM)',
      sundayLiveQuiz: 'Sunday Super Quiz (8:00 PM)',
      voiceStudy: 'Live Voice Audio Room',
      leaderboardRank: 'Leaderboard Rank',
      downloadZipPdf: 'Download ZIP of PDFs',
      installAppBanner: 'Install Steppin App on your device for lightning-fast offline learning',
    },
    practice: {
      title: 'CDC Entrance Question Bank',
      subtitle: 'Targeted Practice for +2 Science, Management & CTEVT',
      selectSubject: 'Select Subject',
      selectChapter: 'Select Chapter',
      allChapters: 'All Chapters (Comprehensive)',
      startPractice: 'Start Chapter Test',
      question: 'Question',
      options: 'Select the best option',
      checkAnswer: 'Check Answer',
      nextQuestion: 'Next Question',
      prevQuestion: 'Previous Question',
      explanation: 'Detailed Step-by-Step Solution',
      listenAudio: 'Listen Question Aloud',
      stopAudio: 'Stop Audio',
      addToMistakeBank: 'Saved to Mistake Bank',
    },
    leaderboard: {
      title: 'Entrance Champions Board',
      subtitle: 'Top Performers Ranked by AG Academic Points & Accuracy',
      filterWeekly: 'Weekly Top 10',
      filterMonthly: 'Monthly Champions',
      filterAllTime: 'All-Time Legends',
      rank: 'Rank',
      student: 'Student',
      points: 'AG Points',
      accuracy: 'Accuracy',
      topperBadge: 'CDC Topper',
    },
    voice: {
      title: 'Live Voice & Audio Room',
      subtitle: 'Real-Time Audio Peer Study & AI Voice Tutor Pronunciation',
      liveRoom: 'Audio Discussion Room',
      recordDoubt: 'Record Voice Doubt Note',
      startRecording: 'Start Recording Voice Note',
      stopRecording: 'Stop Recording & Attach',
      listenPlayback: 'Play Recorded Audio',
      aiVoiceTutor: 'AI Voice Entrance Tutor',
      speakQuestion: 'Read Aloud with Natural Pronunciation',
      joinVoiceRoom: 'Join Live Study Room',
      leaveVoiceRoom: 'Leave Audio Room',
    },
    download: {
      title: 'Universal Download Center',
      subtitle: 'Steppin is available for everyone on Android, iPhone, Windows, Mac & Web',
      downloadAppAll: 'Download App for Everyone (PWA)',
      downloadZipOfPdf: 'Download ZIP of PDF (All Features)',
      downloadQuestionsPdf: 'Download Solved Question Bank (PDF)',
      downloadOfflineBundle: 'Download Complete Offline Study Bundle',
      downloadCertificate: 'Download Student Merit Certificate (PDF)',
      androidGuide: 'Android Installation Guide (Chrome / Brave)',
      iosGuide: 'iPhone & iPad Guide (Safari)',
      pcGuide: 'PC & Mac Desktop Guide (Chrome / Edge)',
    },
    common: {
      loading: 'Loading Steppin...',
      success: 'Operation Successful',
      error: 'An error occurred',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      offlineMode: 'Offline Mode — Using Cached Steppin Data',
      youDestination: 'You destination',
    },
  },
  ne: {
    appName: 'Steppin',
    websiteDomain: 'www.steppin.com',
    tagline: 'तपाईंको सपना, हाम्रो लक्ष्य',
    destinationBadge: 'You destination',
    creatorName: 'नीरज यादव',
    creatorTitle: 'संस्थापक तथा शैक्षिक निर्देशक',
    nav: {
      dashboard: 'ड्यासबोर्ड',
      practice: 'अभ्यास बैंक',
      mockTest: 'शनिबारको मक टेस्ट',
      sundayQuiz: 'आइतबार ८ बजेको क्विज',
      progress: 'प्रगति र विश्लेषण (Progress & AI)',
      leaderboard: 'उत्कृष्ट विद्यार्थी तालिका',
      voiceRoom: 'प्रत्यक्ष अडियो तथा आवाज',
      discuss: 'तस्वीर तथा जिज्ञासा छलफल',
      flashboard: 'सूचना पाटी (फ्ल्यास बोर्ड)',
      downloadCenter: 'डाउनलोड केन्द्र',
      profile: 'मेरो प्रोफाइल',
      admin: 'व्यवस्थापक प्यानल',
      downloadApp: 'एप डाउनलोड गर्नुहोस्',
    },
    auth: {
      welcomeTitle: 'तपाईंको सुनौलो भविष्यको सुरुआत',
      welcomeSubtitle: 'कक्षा १० पाठ्यक्रम विकास केन्द्र (CDC) प्रवेश परीक्षा तयारी पोर्टल',
      username: 'विद्यार्थीको पूरा नाम / प्रयोगकर्ता नाम',
      usernamePlaceholder: 'तपाईंको नाम लेख्नुहोस् (उदा: आयुष शर्मा)',
      emailOrPhone: 'जिमेल वा मोबाइल नम्बर',
      emailPlaceholder: 'student@gmail.com वा ९८xxxxxxxx',
      password: 'पासवर्ड',
      passwordPlaceholder: 'पासवर्ड प्रविष्ट गर्नुहोस्',
      newPassword: 'नयाँ पासवर्ड',
      confirmNewPassword: 'नयाँ पासवर्ड पुनः पुष्टि गर्नुहोस्',
      showPassword: 'पासवर्ड देखाउनुहोस्',
      hidePassword: 'पासवर्ड लुकाउनुहोस्',
      forgotPassword: 'पासवर्ड बिर्सनुभयो?',
      loginBtn: 'स्टेप-इनमा लगइन गर्नुहोस्',
      signupBtn: '२०२६ ब्याचका लागि दर्ता गर्नुहोस्',
      resetPasswordBtn: 'नयाँ पासवर्ड राख्नुहोस् र सिधै लगइन गर्नुहोस्',
      googleSignIn: 'गुगल मार्फत निरन्तरता दिनुहोस्',
      gmailCodeLogin: '६-अङ्कको जिमेल कोड मार्फत लगइन',
      seatsLeft: 'बाँकी सिट संख्या',
      batchFull: 'भर्ना बन्द — अधिकतम सिट संख्या पूरा भयो',
      rememberMe: 'मलाई सम्झिराख्नुहोस्',
    },
    dashboard: {
      greeting: 'स्वागत छ',
      dailyGoal: 'दैनिक लक्ष्य (२० प्रश्न)',
      questionsSolved: 'समाधान गरिएका प्रश्न',
      accuracy: 'औसत शुद्धता प्रतिशत',
      agPoints: 'एजी अंक (AG Points)',
      studyTime: 'कुल अध्ययन समय',
      continuePractice: 'अभ्यास सुरु गर्नुहोस्',
      saturdayMockTest: 'शनिबार १:०० बजेको पूर्ण मक टेस्ट',
      sundayLiveQuiz: 'आइतबार ८:०० बजेको सुपर क्विज',
      voiceStudy: 'प्रत्यक्ष अडियो अध्ययन कक्ष',
      leaderboardRank: 'स्थान / श्रेणी',
      downloadZipPdf: 'सबै सुविधाहरूको जिप पीडीएफ डाउनलोड',
      installAppBanner: 'स्टेप-इन एप आफ्नो मोबाइल वा कम्प्युटरमा इन्स्टल गरी अफलाइन अध्ययन गर्नुहोस्',
    },
    practice: {
      title: 'सीडीसी प्रवेश परीक्षा प्रश्न बैंक',
      subtitle: '+२ विज्ञान, व्यवस्थापन र सिटिइभिटी (CTEVT) का लागि विशेष तयारी',
      selectSubject: 'विषय छान्नुहोस्',
      selectChapter: 'पाठ छान्नुहोस्',
      allChapters: 'सबै पाठहरू (समग्र अभ्यास)',
      startPractice: 'अभ्यास परीक्षा सुरु गर्नुहोस्',
      question: 'प्रश्न',
      options: 'सही विकल्प रोज्नुहोस्',
      checkAnswer: 'उत्तर जाँच्नुहोस्',
      nextQuestion: 'अर्को प्रश्न',
      prevQuestion: 'अघिल्लो प्रश्न',
      explanation: 'विस्तृत समाधान र व्याख्या',
      listenAudio: 'प्रश्न आवाजमा सुन्नुहोस्',
      stopAudio: 'आवाज बन्द गर्नुहोस्',
      addToMistakeBank: 'गल्ती सूचीमा सुरक्षित गरियो',
    },
    leaderboard: {
      title: 'प्रवेश परीक्षा शीर्ष विद्यार्थी तालिका',
      subtitle: 'एजी प्राज्ञिक अंक र शुद्धताको आधारमा शीर्ष विद्यार्थीहरू',
      filterWeekly: 'साप्ताहिक शीर्ष १०',
      filterMonthly: 'मासिक विजेताहरू',
      filterAllTime: 'सबै समयका उत्कृष्ट विद्यार्थी',
      rank: 'स्थान',
      student: 'विद्यार्थी',
      points: 'एजी अंक',
      accuracy: 'शुद्धता',
      topperBadge: 'सीडीसी टपर',
    },
    voice: {
      title: 'प्रत्यक्ष अडियो तथा आवाज अध्ययन कक्ष',
      subtitle: 'वास्तविक समयमा साथीहरूसँग अडियो छलफल र एआई आवाज शिक्षक',
      liveRoom: 'प्रत्यक्ष अडियो छलफल कक्ष',
      recordDoubt: 'आफ्नो आवाजमा प्रश्न रेकर्ड गर्नुहोस्',
      startRecording: 'आवाज रेकर्ड सुरु गर्नुहोस्',
      stopRecording: 'रेकर्ड रोक्नुहोस् र जोड्नुहोस्',
      listenPlayback: 'रेकर्ड गरिएको आवाज सुन्नुहोस्',
      aiVoiceTutor: 'एआई आवाज प्रवेश परीक्षा शिक्षक',
      speakQuestion: 'शुद्ध उच्चारण सहित प्रश्न सुन्नुहोस्',
      joinVoiceRoom: 'अडियो अध्ययन कक्षमा प्रवेश गर्नुहोस्',
      leaveVoiceRoom: 'अडियो कक्षबाट बाहिरिनुहोस्',
    },
    download: {
      title: 'सबैका लागि एप तथा सामग्री डाउनलोड केन्द्र',
      subtitle: 'स्टेप-इन एन्ड्रोइड, आईफोन, विन्डोज र म्याक सबैका लागि निःशुल्क उपलब्ध छ',
      downloadAppAll: 'सबैका लागि एप डाउनलोड (PWA / Web App)',
      downloadZipOfPdf: 'सबै सुविधाहरूको जिप पीडीएफ डाउनलोड',
      downloadQuestionsPdf: 'समाधान सहितको प्रश्न बैंक (PDF)',
      downloadOfflineBundle: 'पूर्ण अफलाइन अध्ययन प्याकेज डाउनलोड',
      downloadCertificate: 'विद्यार्थी योग्यता प्रमाणपत्र (PDF)',
      androidGuide: 'एन्ड्रोइड प्रयोगकर्ताका लागि इन्स्टल विधि',
      iosGuide: 'आईफोन / आईप्याड प्रयोगकर्ताका लागि विधि',
      pcGuide: 'कम्प्युटर (PC / Mac) का लागि विधि',
    },
    common: {
      loading: 'लोड हुँदैछ...',
      success: 'सफलतापूर्वक सम्पन्न भयो',
      error: 'त्रुटि देखापर्यो',
      submit: 'पेश गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      close: 'बन्द गर्नुहोस्',
      offlineMode: 'अफलाइन मोड — सुरक्षित गरिएको डेटा प्रयोग हुँदैछ',
      youDestination: 'You destination',
    },
  },
};
