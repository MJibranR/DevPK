export const sampleUsers = [
  {
    id: "1",
    username: "ahmedali",
    full_name: "Ahmed Ali",
    avatar_url: "",
    bio: "Full-stack dev from Lahore. Building the future with Next.js & TypeScript. LUMS '23.",
    role: "Full-Stack Developer",
    university: "LUMS",
    location: "Lahore",
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    github_url: "https://github.com/ahmedali",
    linkedin_url: "https://linkedin.com/in/ahmedali",
    followers_count: 1243,
    following_count: 312,
  },
  {
    id: "2",
    username: "fatimakhan",
    full_name: "Fatima Khan",
    avatar_url: "",
    bio: "UI/UX designer & frontend engineer. Making beautiful things for the web. 🎨",
    role: "UI/UX Designer",
    university: "NUST",
    location: "Islamabad",
    stack: ["Figma", "React", "Tailwind CSS", "Framer"],
    github_url: "https://github.com/fatimakhan",
    linkedin_url: "https://linkedin.com/in/fatimakhan",
    followers_count: 2891,
    following_count: 456,
  },
  {
    id: "3",
    username: "bilalraza",
    full_name: "Bilal Raza",
    avatar_url: "",
    bio: "ML Engineer @ a stealth startup. Python & PyTorch enthusiast. FAST-NUCES '22.",
    role: "ML Engineer",
    university: "FAST-NUCES",
    location: "Karachi",
    stack: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    github_url: "https://github.com/bilalraza",
    linkedin_url: "https://linkedin.com/in/bilalraza",
    followers_count: 987,
    following_count: 201,
  },
  {
    id: "4",
    username: "ayeshanaeem",
    full_name: "Ayesha Naeem",
    avatar_url: "",
    bio: "Freelance developer & open-source contributor. React Native mobile apps.",
    role: "Mobile Developer",
    university: "COMSATS",
    location: "Islamabad",
    stack: ["React Native", "Expo", "Firebase", "TypeScript"],
    github_url: "https://github.com/ayeshanaeem",
    linkedin_url: "https://linkedin.com/in/ayeshanaeem",
    followers_count: 654,
    following_count: 189,
  },
  {
    id: "5",
    username: "hassanjavaid",
    full_name: "Hassan Javaid",
    avatar_url: "",
    bio: "DevOps & Cloud at scale. AWS certified. Building infra for Pakistani startups.",
    role: "DevOps Engineer",
    university: "ITU",
    location: "Lahore",
    stack: ["AWS", "Docker", "Kubernetes", "Terraform"],
    github_url: "https://github.com/hassanjavaid",
    linkedin_url: "https://linkedin.com/in/hassanjavaid",
    followers_count: 1567,
    following_count: 278,
  },
];

export const samplePosts = [
  {
    id: "1",
    user_id: "1",
    content: "Just shipped a new feature for our SaaS product using #nextjs and #typescript. The DX with server components is incredible 🚀\n\nWho else is building with the App Router?",
    image_url: null,
    hashtags: ["nextjs", "typescript"],
    likes_count: 47,
    replies_count: 12,
    reposts_count: 8,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    user_id: "2",
    content: "New design system just dropped 🎨\n\nBuilt with #figma and implemented in #tailwindcss. 40+ components, fully responsive, dark mode ready.\n\nOpen-sourcing it next week! Stay tuned.",
    image_url: null,
    hashtags: ["figma", "tailwindcss"],
    likes_count: 124,
    replies_count: 31,
    reposts_count: 22,
    created_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    user_id: "3",
    content: "Training a custom LLM on Urdu text data. The tokenizer challenges are real but we're making progress 🔥\n\n#ai #nlp #machinelearning\n\nPakistan needs more NLP researchers working on local languages.",
    image_url: null,
    hashtags: ["ai", "nlp", "machinelearning"],
    likes_count: 89,
    replies_count: 23,
    reposts_count: 15,
    created_at: "2024-01-15T08:00:00Z",
  },
  {
    id: "4",
    user_id: "4",
    content: "Tip for React Native devs: Use `expo-router` for file-based routing. It changed my entire workflow.\n\n```\nnpx create-expo-app@latest --template tabs\n```\n\n#reactnative #expo #mobile",
    image_url: null,
    hashtags: ["reactnative", "expo", "mobile"],
    likes_count: 56,
    replies_count: 8,
    reposts_count: 11,
    created_at: "2024-01-14T22:45:00Z",
  },
  {
    id: "5",
    user_id: "5",
    content: "Just passed the AWS Solutions Architect Professional exam! 🎉\n\nStudy plan:\n- 3 months prep\n- Adrian Cantrill's course\n- 500+ practice questions\n- Hands-on labs daily\n\n#aws #devops #cloud",
    image_url: null,
    hashtags: ["aws", "devops", "cloud"],
    likes_count: 203,
    replies_count: 45,
    reposts_count: 34,
    created_at: "2024-01-14T20:00:00Z",
  },
  {
    id: "6",
    user_id: "1",
    content: "Hot take: Pakistan has some of the best untapped dev talent in the world. We just need better platforms to showcase it.\n\nThat's why I'm building on #DevPK 💚",
    image_url: null,
    hashtags: ["DevPK"],
    likes_count: 312,
    replies_count: 67,
    reposts_count: 89,
    created_at: "2024-01-14T18:30:00Z",
  },
  {
    id: "7",
    user_id: "2",
    content: "Redesigned the entire onboarding flow for @bilalraza's ML platform. Reduced drop-off by 34% 📉\n\nKey insight: developers hate forms. Give them a CLI option.\n\n#uiux #design #productdesign",
    image_url: null,
    hashtags: ["uiux", "design", "productdesign"],
    likes_count: 78,
    replies_count: 19,
    reposts_count: 12,
    created_at: "2024-01-14T16:00:00Z",
  },
  {
    id: "8",
    user_id: "3",
    content: "Python tip: Use `functools.lru_cache` for memoization. It's built-in and incredibly powerful.\n\n```python\n@lru_cache(maxsize=128)\ndef fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)\n```\n\n#python #coding #tips",
    image_url: null,
    hashtags: ["python", "coding", "tips"],
    likes_count: 145,
    replies_count: 28,
    reposts_count: 42,
    created_at: "2024-01-14T14:00:00Z",
  },
  {
    id: "9",
    user_id: "4",
    content: "Looking for React Native devs in Pakistan for a freelance project. Expo + TypeScript required. Remote OK.\n\nDM me if interested! 💼\n\n#freelancing #hiring #reactnative",
    image_url: null,
    hashtags: ["freelancing", "hiring", "reactnative"],
    likes_count: 34,
    replies_count: 52,
    reposts_count: 18,
    created_at: "2024-01-14T12:00:00Z",
  },
  {
    id: "10",
    user_id: "5",
    content: "Deployed a Kubernetes cluster for a fintech startup in Lahore today. 12 microservices, zero downtime.\n\nThe Pakistani startup ecosystem is growing fast 🚀\n\n#kubernetes #devops #startups",
    image_url: null,
    hashtags: ["kubernetes", "devops", "startups"],
    likes_count: 91,
    replies_count: 14,
    reposts_count: 7,
    created_at: "2024-01-13T23:00:00Z",
  },
];

export const sampleCommunities = [
  { id: "1", name: "Web Development", slug: "webdev", description: "Frontend, backend, and everything in between", icon: "🌐", member_count: 4521 },
  { id: "2", name: "Artificial Intelligence", slug: "ai", description: "ML, DL, NLP, and AI research", icon: "🤖", member_count: 3102 },
  { id: "3", name: "Freelancing", slug: "freelancing", description: "Tips, gigs, and freelance life in Pakistan", icon: "💼", member_count: 2876 },
  { id: "4", name: "UI/UX Design", slug: "uiux", description: "Design systems, user research, and visual design", icon: "🎨", member_count: 1987 },
  { id: "5", name: "Karachi Devs", slug: "karachi-devs", description: "Tech community in Karachi", icon: "🏙️", member_count: 1543 },
  { id: "6", name: "FAST-NUCES", slug: "fast-nuces", description: "FASTians connecting and collaborating", icon: "🎓", member_count: 2134 },
  { id: "7", name: "Cybersecurity", slug: "cybersecurity", description: "InfoSec, pentesting, and security research", icon: "🔒", member_count: 1210 },
  { id: "8", name: "Mobile Dev", slug: "mobile", description: "iOS, Android, React Native, Flutter", icon: "📱", member_count: 1876 },
];

export const sampleJobs = [
  {
    id: "1",
    company: "Airlift Technologies",
    title: "Senior Frontend Engineer",
    description: "Build the next generation of quick-commerce in Pakistan.",
    type: "Full-time",
    city: "Lahore",
    stack: ["React", "TypeScript", "Next.js", "GraphQL"],
    apply_url: "#",
    posted_at: "2024-01-14T00:00:00Z",
  },
  {
    id: "2",
    company: "Careem",
    title: "ML Engineer Intern",
    description: "Work on real-time demand prediction models.",
    type: "Internship",
    city: "Karachi",
    stack: ["Python", "TensorFlow", "AWS", "SQL"],
    apply_url: "#",
    posted_at: "2024-01-13T00:00:00Z",
  },
  {
    id: "3",
    company: "Upwork (Remote)",
    title: "React Native Developer",
    description: "Freelance mobile development for US-based clients.",
    type: "Freelance",
    city: "Remote",
    stack: ["React Native", "Expo", "Firebase", "TypeScript"],
    apply_url: "#",
    posted_at: "2024-01-12T00:00:00Z",
  },
];

export const sampleProjects = [
  {
    id: "1",
    user_id: "1",
    title: "PakWeather",
    description: "Real-time weather app for Pakistani cities with Urdu support",
    cover_image: "",
    live_url: "https://pakweather.app",
    github_url: "https://github.com/ahmedali/pakweather",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "OpenWeather API"],
    likes_count: 89,
  },
  {
    id: "2",
    user_id: "2",
    title: "DesignPK Components",
    description: "Open-source UI component library inspired by Pakistani aesthetics",
    cover_image: "",
    live_url: "https://designpk.dev",
    github_url: "https://github.com/fatimakhan/designpk",
    stack: ["React", "Storybook", "Tailwind CSS", "Radix UI"],
    likes_count: 234,
  },
  {
    id: "3",
    user_id: "3",
    title: "UrduGPT",
    description: "Fine-tuned language model for Urdu text generation and translation",
    cover_image: "",
    live_url: "https://urdugpt.ai",
    github_url: "https://github.com/bilalraza/urdugpt",
    stack: ["Python", "PyTorch", "Hugging Face", "FastAPI"],
    likes_count: 567,
  },
];

export const trendingHashtags = [
  { tag: "nextjs", count: 1243 },
  { tag: "typescript", count: 987 },
  { tag: "ai", count: 876 },
  { tag: "freelancing", count: 654 },
  { tag: "DevPK", count: 543 },
];

export function getUserById(id: string) {
  return sampleUsers.find((u) => u.id === id);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

export function formatCount(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}
