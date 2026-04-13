import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "ur";

const translations: Record<string, Record<Language, string>> = {
  feed: { en: "Feed", ur: "فیڈ" },
  communities: { en: "Communities", ur: "کمیونٹیز" },
  qa: { en: "Q&A", ur: "سوال و جواب" },
  jobs: { en: "Jobs", ur: "ملازمتیں" },
  showcase: { en: "Showcase", ur: "شوکیس" },
  notifications: { en: "Notifications", ur: "اطلاعات" },
  settings: { en: "Settings", ur: "ترتیبات" },
  follow: { en: "Follow", ur: "فالو کریں" },
  following: { en: "Following", ur: "فالو کر رہے ہیں" },
  post: { en: "Post", ur: "پوسٹ کریں" },
  login: { en: "Log in", ur: "لاگ ان" },
  signup: { en: "Sign up", ur: "سائن اپ" },
  search: { en: "Search DevPK...", ur: "...DevPK تلاش کریں" },
  whatsOnYourMind: { en: "What's on your mind, dev?", ur: "کیا سوچ رہے ہو، ڈویلپر؟" },
  saveChanges: { en: "Save changes", ur: "تبدیلیاں محفوظ کریں" },
  saving: { en: "Saving...", ur: "...محفوظ ہو رہا ہے" },
  posting: { en: "Posting...", ur: "...پوسٹ ہو رہا ہے" },
  trending: { en: "Trending", ur: "ٹرینڈنگ" },
  whoToFollow: { en: "Who to follow", ur: "کسے فالو کریں" },
  posts: { en: "Posts", ur: "پوسٹس" },
  alerts: { en: "Alerts", ur: "الرٹس" },
  groups: { en: "Groups", ur: "گروپس" },
  signOut: { en: "Sign out", ur: "سائن آؤٹ" },
  editProfile: { en: "Edit profile", ur: "پروفائل ترمیم" },
  language: { en: "Language", ur: "زبان" },
  theme: { en: "Theme", ur: "تھیم" },
  comment: { en: "Comment", ur: "تبصرہ" },
  reply: { en: "Reply", ur: "جواب دیں" },
  repost: { en: "Repost", ur: "ری پوسٹ" },
  reposted: { en: "Reposted", ur: "ری پوسٹ ہو گیا" },
  comments: { en: "Comments", ur: "تبصرے" },
  writeComment: { en: "Write a comment...", ur: "...تبصرہ لکھیں" },
  noPostsYet: { en: "No posts yet. Be the first to share something!", ur: "!ابھی کوئی پوسٹ نہیں۔ پہلے بنیں" },
  loadingPosts: { en: "Loading posts...", ur: "...پوسٹس لوڈ ہو رہی ہیں" },
  joinCommunity: { en: "Join the community", ur: "کمیونٹی میں شامل ہوں" },
  exploreFeed: { en: "Explore feed", ur: "فیڈ دیکھیں" },
  getStarted: { en: "Get started — it's free", ur: "شروع کریں — مفت ہے" },
  readyToJoin: { en: "Ready to join?", ur: "شامل ہونے کے لیے تیار؟" },
  profilePicture: { en: "Profile Picture", ur: "پروفائل تصویر" },
  displayName: { en: "Display Name", ur: "ظاہری نام" },
  username: { en: "Username", ur: "صارف نام" },
  bio: { en: "Bio", ur: "تعارف" },
  role: { en: "Role", ur: "کردار" },
  university: { en: "University", ur: "یونیورسٹی" },
  institute: { en: "Institute", ur: "ادارہ" },
  location: { en: "Location", ur: "مقام" },
  techStack: { en: "Tech Stack (comma-separated)", ur: "(ٹیک اسٹیک (کاما سے الگ" },
  members: { en: "members", ur: "ممبرز" },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  isRTL: false,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("devpk-lang") as Language) || "en";
    }
    return "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("devpk-lang", newLang);
  };

  const t = (key: string) => translations[key]?.[lang] || translations[key]?.en || key;
  const isRTL = lang === "ur";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
