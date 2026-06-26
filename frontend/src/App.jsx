import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight, Code2, Github, Mail, MapPin, Server, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const fallbackPortfolio = {
  name: "Mayank",
  role: "Software Engineer | Full-Stack & Backend",
  github: "https://github.com/Mayank-0399",
  avatar: "https://github.com/Mayank-0399.png",
  intro:
    "I build scalable and robust full-stack web apps with clean interfaces, useful APIs, and practical user flows. My work spans backend & frontend systems, AI-integration, RAG, dashboards, and modern React experiences.",
  skills: [
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Postgres",
    "Prisma",
    "C++",
    "Python",
    "JavaScript",
    "TypeScript",
    "Python",
    "REST APIs",
    "Authentication",
    "AI/RAG",
    "AWS",
    "Cloudflare",
  ],
  contact: {
    email: "mayanksingh230651@gmail.com",
    location: "India",
    github: "https://github.com/Mayank-0399",
    linkedin: "https://www.linkedin.com/in/mayanksingh63/"
  },
  projects: []
};

const projectIcons = [Github, Code2, TerminalSquare, Server, Code2];

function TypingHeading() {
  const text = "Built by me.";

  return (
    <span className="inline-flex min-h-8 items-center text-base font-semibold text-zinc-700 sm:text-lg">
      <span className="typewriter">{text}</span>
    </span>
  );
}

function SectionHeading({ kicker, title, align = "left", tone = "light" }) {
  const isDark = tone === "dark";

  return (
    <motion.div
      className={`mb-10 max-w-4xl ${align === "right" ? "ml-auto text-right" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <p className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{kicker}</p>
      <h2 className={`text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl ${isDark ? "text-white" : "text-zinc-950"}`}>
        {title}
      </h2>
    </motion.div>
  );
}

function App() {
  const [portfolio, setPortfolio] = useState(fallbackPortfolio);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    fetch(`${apiUrl}/api/portfolio`)
      .then((response) => response.json())
      .then(setPortfolio)
      .catch(() => setPortfolio(fallbackPortfolio));
  }, [apiUrl]);

  const projects = useMemo(() => {
    const realProjects = portfolio.projects?.length ? portfolio.projects : fallbackPortfolio.projects;
    return realProjects.slice(0, 5);
  }, [portfolio.projects]);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-stone-50 font-display text-zinc-950">
      <motion.div className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-zinc-950" style={{ scaleX: progress }} />

      <div className="sticky top-0 z-40 flex min-h-12 items-center justify-center bg-zinc-950 px-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
        Open to MERN projects | AI tools | Product builds
      </div>

      <nav className="sticky top-12 z-30 border-b border-zinc-200 bg-stone-50/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a className="text-lg font-black tracking-tight sm:text-xl" href="#home">
            {portfolio.name}
          </a>
          <TypingHeading />
          <div className="flex items-center gap-2">
            <a className="grid size-11 place-items-center rounded-full border border-zinc-300 transition hover:bg-zinc-950 hover:text-white" href={portfolio.github} aria-label="GitHub profile">
              <Github size={20} />
            </a>
            <a className="grid size-11 place-items-center rounded-full border border-zinc-300 transition hover:bg-zinc-950 hover:text-white" href={`mailto:${portfolio.contact.email}`} aria-label="Email Mayank">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </nav>

      <section id="home" className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Portfolio / 2026</p>
          <h1 className="max-w-4xl text-6xl font-black leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
            {portfolio.name}
            <span className="mt-4 block text-3xl text-zinc-700 sm:text-4xl lg:text-5xl">{portfolio.role}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-700">{portfolio.intro}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:-translate-y-1 hover:bg-emerald-700"
              type="button"
              onClick={scrollToProjects}
            >
              View Projects <ArrowDown size={18} />
            </button>
            <a
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-zinc-300 px-6 text-sm font-bold uppercase tracking-[0.12em] transition hover:-translate-y-1 hover:border-zinc-950"
              href={portfolio.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub Profile <ArrowUpRight size={18} />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-zinc-950 p-5 shadow-2xl shadow-zinc-300/70 sm:min-h-[480px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/30 to-transparent" />
          <div className="relative flex h-full flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-950">22 repos</span>
              <span className="text-sm font-bold text-zinc-300">Mayank-0399</span>
            </div>
            <img
              className="mx-auto size-44 rounded-full border-4 border-white object-cover grayscale sm:size-56"
              src={portfolio.avatar}
              alt="Mayank GitHub avatar"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Focus</p>
              <p className="mt-3 text-3xl font-black leading-tight sm:text-4xl">React interfaces, Node APIs, and useful product flows.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-zinc-200 px-5 py-16 sm:px-8 lg:px-12" id="intro">
        <div className="mx-auto max-w-7xl">
          <SectionHeading kicker="Introduction" title="Full-stack projects with motion, structure, and intent." />
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <motion.p
              className="rounded-3xl border border-zinc-200 bg-white p-7 text-xl leading-9 text-zinc-700 shadow-sm sm:p-9"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.4 }}
            >
              My focus is building practical, fast, and polished applications: React on the front,
              Express and Node on the back, and MongoDB for the data layer. I like interfaces that move
              with purpose and APIs that stay clean under pressure.
            </motion.p>
            <div className="rounded-3xl border border-zinc-200 bg-emerald-50 p-7">
              <span className="text-6xl font-black text-emerald-800">22</span>
              <p className="mt-5 text-lg leading-7 text-zinc-700">public GitHub repositories connected through one profile.</p>
            </div>
          </div>
        </div>
      </section>


      <section className="overflow-hidden border-t border-zinc-200 bg-zinc-950 px-5 py-16 text-white sm:px-8 lg:px-12" id="skills">
        <div className="mx-auto max-w-7xl">
          <SectionHeading kicker="Skills" title="Frontend sharpness. Backend structure. AI curiosity." align="right" tone="dark" />
          <div className="skill-track flex w-max gap-3">
            {[...portfolio.skills, ...portfolio.skills].map((skill, index) => (
              <span className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-zinc-950" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="scroll-mt-32 border-t border-zinc-200 px-5 py-16 sm:px-8 lg:px-12" id="projects">
        <div className="mx-auto max-w-7xl">
          <SectionHeading kicker="GitHub Projects" title="Project cards you can actually read and click." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => {
              const Icon = projectIcons[index] || Github;
              return (
                <motion.article
                  className="group flex overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-2 hover:border-zinc-950 hover:shadow-xl"
                  key={project.repo}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="flex w-full flex-col">
                    <a
                      className="relative block aspect-[16/10] overflow-hidden bg-zinc-100"
                      href={project.liveUrl || project.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open live app for ${project.name}`}
                    >
                      <img
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        src={project.image}
                        alt={`${project.name} project preview`}
                      />
                      <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-950 shadow-lg">
                        Live <ArrowUpRight size={15} />
                      </span>
                    </a>

                    <div className="flex min-h-80 flex-1 flex-col p-6">
                      <div className="flex items-center justify-between">
                        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                          <Icon size={24} />
                        </span>
                        <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-700">
                          {project.language}
                        </span>
                      </div>
                      <h3 className="mt-8 text-2xl font-black leading-tight tracking-tight">{project.name}</h3>
                      <p className="mt-4 leading-7 text-zinc-600">{project.description}</p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-8">
                        <a
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                          href={project.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Github size={17} />
                          Repository
                        </a>
                        <a
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-3 text-sm font-bold transition hover:border-zinc-950"
                          href={project.liveUrl || project.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open App <ArrowUpRight size={17} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-950 px-5 py-20 text-white sm:px-8 lg:px-12" id="contact">
        <div className="mx-auto max-w-7xl">
          <SectionHeading kicker="Contact" title="Let's build something useful." align="right" tone="dark" />
          <div className="grid overflow-hidden rounded-3xl border border-white/10 sm:grid-cols-3">
            <a className="flex min-h-28 items-center gap-3 bg-white/5 p-6 transition hover:bg-white hover:text-zinc-950" href={`mailto:${portfolio.contact.email}`}>
              <Mail size={22} />
              <span className="break-all">{portfolio.contact.email}</span>
            </a>
            <a className="flex min-h-28 items-center gap-3 bg-white/5 p-6 transition hover:bg-white hover:text-zinc-950" href={portfolio.github} target="_blank" rel="noreferrer">
              <Github size={22} />
              <span>github.com/Mayank-0399</span>
            </a>
            <span className="flex min-h-28 items-center gap-3 bg-white/5 p-6">
              <MapPin size={22} />
              {portfolio.contact.location}
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-5 py-7 text-center text-sm text-zinc-400">
        Built with React, Tailwind, Node, Express, MongoDB-ready architecture, and scroll motion.
      </footer>
    </main>
  );
}

export default App;
