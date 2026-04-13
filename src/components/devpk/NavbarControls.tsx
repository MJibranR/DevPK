import { Languages, Sun, Moon, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme, type Theme } from "@/hooks/useTheme";

export function NavbarControls() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "midnight", icon: Sparkles, label: "Midnight" },
  ];

  const nextTheme = () => {
    const order: Theme[] = ["dark", "light", "midnight"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const ThemeIcon = themeOptions.find((t) => t.value === theme)?.icon || Moon;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang(lang === "en" ? "ur" : "en")}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title={lang === "en" ? "اردو میں تبدیل کریں" : "Switch to English"}
      >
        <Languages className="h-4 w-4" />
      </button>
      <button
        onClick={nextTheme}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title={`Theme: ${themeOptions.find((t) => t.value === theme)?.label}`}
      >
        <ThemeIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
