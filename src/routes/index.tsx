import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NavbarControls } from "@/components/devpk/NavbarControls";
import { Code2, Users, MessageCircle, Briefcase, Rocket, ArrowRight, Hash, Zap, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevPK — Pakistan's Home for Tech Minds" },
      { name: "description", content: "The social platform for Pakistan's developers, designers, students, and freelancers. Connect, share, and grow with the tech community." },
      { property: "og:title", content: "DevPK — Pakistan's Home for Tech Minds" },
      { property: "og:description", content: "The social platform for Pakistan's developers, designers, students, and freelancers." },
    ],
  }),
  component: LandingPage,
});

const stats = [
  { value: "12K+", label: { en: "Developers", ur: "ڈویلپرز" } },
  { value: "45K+", label: { en: "Posts", ur: "پوسٹس" } },
  { value: "120+", label: { en: "Communities", ur: "کمیونٹیز" } },
  { value: "500+", label: { en: "Projects", ur: "پروجیکٹس" } },
];

const features = [
  { icon: MessageCircle, title: { en: "Dev-First Feed", ur: "ڈویلپر فیڈ" }, desc: { en: "Share posts with code snippets, hashtags, and mentions. Built for technical discussions.", ur: "کوڈ، ہیش ٹیگز اور مینشنز کے ساتھ پوسٹس شیئر کریں۔ تکنیکی مباحث کے لیے بنایا گیا۔" } },
  { icon: Users, title: { en: "Communities", ur: "کمیونٹیز" }, desc: { en: "Join #WebDev, #AI, #Freelancing, university groups, and city-based dev communities.", ur: "#WebDev, #AI, #Freelancing، یونیورسٹی گروپس، اور شہر کی کمیونٹیز میں شامل ہوں۔" } },
  { icon: Briefcase, title: { en: "Jobs Board", ur: "ملازمتیں" }, desc: { en: "Find remote, full-time, and freelance tech jobs across Pakistan.", ur: "پاکستان بھر میں ریموٹ، فل ٹائم اور فری لانس ٹیک جابز تلاش کریں۔" } },
  { icon: Rocket, title: { en: "Project Showcase", ur: "پروجیکٹ شوکیس" }, desc: { en: "Show off your side projects with live demos and GitHub links.", ur: "لائیو ڈیمو اور GitHub لنکس کے ساتھ اپنے پروجیکٹس دکھائیں۔" } },
  { icon: Hash, title: { en: "Q&A Forum", ur: "سوال و جواب" }, desc: { en: "Ask questions, share knowledge, and upvote the best answers.", ur: "سوالات پوچھیں، علم شیئر کریں اور بہترین جوابات کو ووٹ دیں۔" } },
  { icon: Globe, title: { en: "Urdu Support", ur: "اردو سپورٹ" }, desc: { en: "Post in English or Urdu. Full RTL rendering for Urdu content.", ur: "انگریزی یا اردو میں پوسٹ کریں۔ اردو مواد کے لیے مکمل RTL رینڈرنگ۔" } },
];

function LandingPage() {
  const { lang, t } = useLanguage();
  const isUrdu = lang === "ur";

  return (
    <div className="min-h-screen bg-background" dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Dev<span className="text-primary">PK</span></span>
          </div>
          <div className="flex items-center gap-3">
            <NavbarControls />
            <Link to="/login">
              <Button variant="ghost" size="sm">{t("login")}</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1.5">
                {t("signup")} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              {isUrdu ? "پاکستان کی ٹیک کمیونٹی کے لیے بنایا گیا" : "Built for Pakistan's tech community"}
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              {isUrdu ? (
                <>
                  <span className="text-foreground">پاکستان کا</span>{" "}
                  <span className="text-primary">پہلا</span>{" "}
                  <span className="text-foreground">اور</span>{" "}
                  <span className="text-primary">نمبر 1</span>{" "}
                  <span className="text-foreground">ٹیک</span>{" "}
                  <span className="text-primary">سوشل پلیٹ فارم</span>
                </>
              ) : (
                <>
                  <span className="text-foreground">Pakistan's</span>{" "}
                  <span className="text-primary">first</span>{" "}
                  <span className="text-foreground">and</span>{" "}
                  <span className="text-primary">#1</span>{" "}
                  <span className="text-foreground">tech</span>{" "}
                  <span className="text-primary">social platform</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-base text-muted-foreground/80 md:text-lg">
              {isUrdu ? "پاکستان کا اپنا سوشل میڈیا پلیٹ فارم ٹیک کمیونٹی کے لیے — ایک پاکستانی نے بنایا، پاکستانیوں کے لیے۔" : "Pakistan's own social media platform for the tech community — built by a Pakistani, for Pakistanis."}
            </p>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              {isUrdu ? "وہ سوشل پلیٹ فارم جہاں پاکستانی ڈویلپرز، ڈیزائنرز، طلباء اور فری لانسرز جڑتے ہیں، علم بانٹتے ہیں اور مل کر بناتے ہیں۔" : "The social platform where Pakistani developers, designers, students, and freelancers connect, share knowledge, and build together."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2 px-8">
                  {t("joinCommunity")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8">
                  {t("exploreFeed")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label.en} className="px-4 py-8 text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{isUrdu ? stat.label.ur : stat.label.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              {isUrdu ? "سب کچھ ایک جگہ، ڈویلپرز کے لیے" : "Everything devs need, in one place"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {isUrdu ? "کوئی شور نہیں۔ صرف ٹیک۔ ڈویلپرز نے بنایا، ڈویلپرز کے لیے۔" : "No noise. Just tech. Built by developers, for developers."}
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title.en} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30">
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{isUrdu ? f.title.ur : f.title.en}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{isUrdu ? f.desc.ur : f.desc.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("readyToJoin")}</h2>
          <p className="mt-3 text-muted-foreground">
            {isUrdu ? "ہزاروں پاکستانی ڈویلپرز سے جڑیں جو مستقبل بنا رہے ہیں۔" : "Connect with thousands of Pakistani developers building the future."}
          </p>
          <div className="mt-8">
            <Link to="/feed">
              <Button size="lg" className="gap-2 px-8">
                {t("getStarted")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4 text-primary" />
            <span>DevPK</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isUrdu ? "محمد جبران ریحان نے بنایا — پاکستان کا پہلا اور نمبر 1 ٹیک سوشل پلیٹ فارم" : "Made by Muhammad Jibran Rehan — Pakistan's first and #1 tech social platform"}
          </p>
        </div>
      </footer>
    </div>
  );
}
