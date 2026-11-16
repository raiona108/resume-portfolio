const profile = {
  name: "Mairehe Robinson",
  headline: "Aspiring Full-Stack Software Developer | Mining, Transport & Operations Background",
  location: "Mandurah / Peel Region, WA — open to Perth & remote opportunities",
  intro:
    "I’m transitioning into full-stack software development after a hands-on career across customer service, transport, earthmoving, and mining. With a strong foundation in web technologies, backend development studies, a lot of self-taught learning, and the ability to work effectively with AI tools, I bring end-to-end operational understanding—from the yard and the road to site, plant, and production—into building practical, reliable solutions for mining and industrial teams.",
  email: "add-your-email@example.com",
  linkedin: "https://linkedin.com/in/add-your-profile",
};

const story = {
  title: "My Story",
  points: [
    "Started in customer service, then built a hands-on career across transport, earthmoving, quarrying, and mining in WA and New Zealand.",
    "Worked across all parts of operations—from freight/logistics, depot and site admin, parts/mechanics coordination, to plant operation and mine-site workflows.",
    "Strong background in safety, reliability, problem-solving, and working independently or in a team in demanding environments.",
    "After a 10-year break from paid work, I’m transitioning into full-stack software development (self-taught and currently studying a Diploma in Backend Web Development at EQC, Equinim College, West Perth).",
    "Comfortable with web/full-stack tools, databases (including MongoDB), Linux terminal, and working with AI tools to learn and build.",
    "Looking for software development opportunities with mining/industrial teams in Mandurah, Peel, Perth, or remote (ABN available for freelance/contract).",
  ],
};

const experience = [
  {
    title: "Chiropractic Receptionist (Part-time)",
    org: "Chiropractic clinic",
    period: "Last year (3 months)",
    summary:
      "Recent part-time role supporting clinic operations and patient experience in a customer-facing administrative environment.",
    bullets: [
      "Managed front-desk reception duties, patient communication, and day-to-day administrative support.",
      "Applied strong customer service, organisation, and reliability in a professional healthcare setting.",
      "Great reference available from the clinic chiropractor on request.",
    ],
  },
  {
    title: "Software Development Journey (Self-Taught & Formal Study)",
    org: "Diploma in Backend Web Development (in progress), EQC (Equinim College), West Perth | Independent learning",
    period: "Current / recent learning",
    summary:
      "Building full-stack development capability through self-directed learning and formal study, with a growing focus on backend systems and databases.",
    bullets: [
      "Studying a Diploma in Backend Web Development with full-stack coverage at EQC (Equinim College) in West Perth.",
      "Built experience with HTML, CSS, Bootstrap, Tailwind CSS, JavaScript, TypeScript, Node.js, Express.js, React, Next.js, npm modules, and Python (including machine learning foundations).",
      "Developed a strong interest in databases—especially through backend studies and hands-on course work with MongoDB—and comfortable working in Linux terminal environments while using AI tools to learn, problem-solve, and build software.",
    ],
  },
  {
    title: "Mining & Resource Operations",
    org: "Gold mine, coal mine (NZ), quarry & site rehabilitation work",
    period: "Earlier career (dates to add)",
    summary:
      "Hands-on experience across mining and resource environments, including production support, equipment operation, and recovery work after severe weather.",
    bullets: [
      "Worked as a ROM loader at an open-cut gold mine in the Pilbara, and carried out production digging and exploration digging at an open-cut coal mine in New Zealand—both operations starting from mountain tops.",
      "Ran quarries and supported operational requirements across changing site conditions.",
      "Contributed to salt mine rehabilitation after cyclone damage, adapting quickly in a high-impact recovery environment.",
    ],
  },
  {
    title: "Transport, Logistics & Depot Operations",
    org: "Long-haul, regional distribution, yard & depot roles (WA/Pilbara)",
    period: "Earlier career (dates to add)",
    summary:
      "Progressed through transport and logistics roles with responsibility for freight movement, equipment handling, and team support.",
    bullets: [
      "Drove triple road trains (2-up) from Perth to Karratha/Port Hedland, carting general and oversized freight (HC Licence, Western Australia).",
      "Unloaded triple road trains with general freight, refrigerated pans, and oversized loads, then reloaded and distributed goods to Pilbara towns including Onslow.",
      "Worked as a general yard hand, forklift operator (Forklift Ticket), town truck driver, prime mover mover, and relief depot manager; worked closely with mechanics, handled parts purchasing, and supported site administration.",
    ],
  },
  {
    title: "Earthmoving, Civil Works & Customer-Facing Roles",
    org: "Bulk earthworks, subdivisions, local driving & garden centre",
    period: "Earlier career (dates to add)",
    summary:
      "Built broad practical capability across machinery operation, site work, and customer service—developing a strong work ethic and transferable problem-solving skills.",
    bullets: [
      "Operated a wide range of earthmoving equipment (dozers, diggers, loaders and more) on bulk earthworks and subdivision projects (White Card).",
      "Completed local truck driving work and applied practical coordination and reliability across varied jobs.",
      "Started in customer service and later ran a garden centre, building communication, organisation, and people skills.",
    ],
  },
];

const skills = [
  "HTML",
  "CSS",
  "Bootstrap",
  "Tailwind CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "npm",
  "Python",
  "Python (Machine Learning foundations)",
  "C-family languages (foundations)",
  "MS-DOS",
  "Linux Terminal",
  "MongoDB",
  "Databases",
  "Full-Stack Web Development",
  "Backend Web Development (Diploma in progress, EQC Equinim College)",
  "Self-Taught Learning",
  "Working with AI Tools",
  "End-to-End Operations Understanding",
  "Solid Health & Safety Knowledge",
  "Problem Solving",
  "Logistics & Coordination",
  "Leadership (Relief Manager)",
  "Able to work independently or within a team",
  "Forklift Ticket",
  "White Card",
  "HC Licence (Western Australia)",
  "ABN (Freelance/Contract work)",
];

const highlights = [
  {
    label: "Highlight 01",
    title: "End-to-end operational understanding",
    text: "Worked through all parts of transport, earthmoving, quarrying, and mining operations—from customer service and freight logistics to plant, site work, and production support in WA and NZ—with solid health and safety knowledge.",
  },
  {
    label: "Highlight 02",
    title: "Full-stack development foundation",
    text: "Built a broad, largely self-taught technical base across frontend and backend web development, comfortable working with AI tools, and currently completing a Diploma in Backend Web Development with full-stack coverage.",
  },
  {
    label: "Highlight 03",
    title: "Practical value for mining-focused tech",
    text: "Combining hands-on industry experience with growing software skills to contribute to practical, reliable solutions for mining and industrial teams near Mandurah, Peel, Perth, or remote.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [bg-size:48px_48px] mask-[radial-gradient(circle_at_center,black,transparent_85%)]" />

      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-mono text-sm tracking-[0.2em] text-accent-2 uppercase">
            {profile.name}
          </a>
          <div className="hidden gap-5 text-sm text-muted sm:flex">
            <a href="#story" className="transition hover:text-foreground">Story</a>
            <a href="#experience" className="transition hover:text-foreground">Experience</a>
            <a href="#skills" className="transition hover:text-foreground">Skills</a>
            <a href="#contact" className="transition hover:text-foreground">Contact</a>
          </div>
        </nav>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-20">
        <section className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-1 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              Portfolio & Resume Template
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              <span className="block">{profile.name}</span>
              <span className="mt-2 block bg-linear-to-b from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent">
                {profile.headline}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              {profile.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02]"
              >
                Get in touch
              </a>
              <a
                href="#experience"
                className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:border-accent-2 hover:text-accent-2"
              >
                See experience & impact
              </a>
              <a
                href="/prestart"
                className="rounded-full border border-accent-3/40 bg-accent-3/10 px-6 py-3 text-sm font-semibold text-accent-3 transition hover:border-accent-3"
              >
                View prestart app demo
              </a>
            </div>
          </div>

          <aside className="relative rounded-3xl border border-border bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/30 blur-2xl" />
            <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-accent-2/20 blur-2xl" />
            <p className="font-mono text-xs tracking-[0.2em] text-accent-3 uppercase">At a glance</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted">Based in</dt>
                <dd className="mt-1 text-base font-medium">{profile.location}</dd>
              </div>
              <div>
                <dt className="text-muted">Target</dt>
                <dd className="mt-1 text-base font-medium">Full-stack software development roles with mining companies (Mandurah, Peel, Perth, or remote)</dd>
              </div>
              <div>
                <dt className="text-muted">Background</dt>
                <dd className="mt-1 text-base font-medium">End-to-end understanding of operations across customer service, transport & logistics, earthmoving, quarrying, and mining</dd>
              </div>
              <div>
                <dt className="text-muted">Licences & Tickets</dt>
                <dd className="mt-1 text-base font-medium">Forklift Ticket, White Card, HC Licence (Western Australia)</dd>
              </div>
              <div>
                <dt className="text-muted">Availability</dt>
                <dd className="mt-1 text-base font-medium">ABN available for freelance or contract work</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section id="story" className="mt-20 grid gap-8 rounded-3xl border border-border bg-card p-8 sm:p-10 lg:grid-cols-[0.35fr_1fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">01</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{story.title}</h2>
          </div>
          <ul className="space-y-3 text-lg leading-8 text-muted">
            {story.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="experience" className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-accent-2 uppercase">02</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Experience & Impact</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">
              A combined view of paid work, life experience, learning, and contribution—because all of it counts.
            </p>
          </div>
          <div className="grid gap-6">
            {experience.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition hover:border-accent/50"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-accent via-accent-2 to-accent-3 opacity-70" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-1 text-base text-accent-2">{item.org}</p>
                  </div>
                  <p className="rounded-full border border-border px-3 py-1 text-sm text-muted">{item.period}</p>
                </div>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{item.summary}</p>
                <ul className="mt-5 grid gap-3 text-sm leading-6 text-foreground/90 sm:grid-cols-3">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl border border-border/80 bg-background/30 p-4">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="mt-20 grid gap-8 lg:grid-cols-[0.4fr_1fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent-3 uppercase">03</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Skills & Strengths</h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-muted">
              Replace these with the transferable, practical, and technical skills that reflect your real experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 rounded-3xl border border-border bg-card p-8">
            {skills.map((skill, index) => (
              <span
                key={skill}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  index % 3 === 0
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : index % 3 === 1
                      ? "border-accent-2/40 bg-accent-2/10 text-accent-2"
                      : "border-accent-3/40 bg-accent-3/10 text-accent-3"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">04</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Highlights</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.label} className="rounded-3xl border border-border bg-card p-6">
                <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">{item.label}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-20 rounded-4xl border border-border bg-linear-to-r from-accent/15 via-accent-2/10 to-accent-3/10 p-8 sm:p-10">
          <p className="font-mono text-xs tracking-[0.2em] text-foreground/80 uppercase">05</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s connect</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            I’m seeking opportunities to begin a full-stack software development career with mining or industrial teams in the Mandurah, Peel, Perth region, or remote. I also have an ABN and am available for freelance or contract work. If you&apos;re looking for someone who understands operations across these sectors from the ground up and brings a growing full-stack skill set, I&apos;d love to connect.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-foreground px-5 py-3 text-background transition hover:opacity-90"
            >
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background/30 px-5 py-3 transition hover:border-accent-2 hover:text-accent-2"
            >
              LinkedIn profile
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}