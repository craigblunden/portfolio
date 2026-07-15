/* eslint-disable react/jsx-no-comment-textnodes */
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Code2,
  Contact,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  heroRole,
  highlights,
  priorRoles,
  skills,
  values,
  type HighlightItem,
  type Role,
} from "@/features/resume/data/resumeData";

export function ResumePage() {
  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 py-8 font-mono text-[#e9eef5] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <Header />
        <HeroRoleCard role={heroRole} />
        <HighlightStrip />
        <ExperienceSection roles={priorRoles} />
        <SkillsSection />
        <ValuesFooter />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
        // resume
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl">
            Craig Blunden<span className="text-[#f0805c]">.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8b97a7]">
            Full-stack engineer with 13+ years shipping product across web,
            mobile and backend. Currently at Repeat.gg (Sony) — a big fan of
            TypeScript, React and cleanly-designed systems.
          </p>
        </div>
        <ContactRow />
      </div>
    </header>
  );
}

function ContactRow() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#8b97a7]">
      <ContactLink
        icon={Mail}
        label="craig.blunden89@gmail.com"
        href="mailto:craig.blunden89@gmail.com"
      />
      <ContactLink icon={Phone} label="0401 723 688" href="tel:+61401723688" />
      <ContactLink
        icon={Contact}
        label="in/craigblunden"
        href="https://www.linkedin.com/in/craigblunden/"
      />
      <ContactLink
        icon={Code2}
        label="craigblunden"
        href="https://github.com/craigblunden"
      />
    </div>
  );
}

function ContactLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#232b36] bg-[#151a22] px-2.5 py-1.5 transition hover:border-[#f0805c]/50 hover:text-[#e9eef5]"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </Link>
  );
}

function HeroRoleCard({ role }: { role: Role }) {
  const primaryAchievements = role.primaryAchievements ?? [];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#f0805c]/30 bg-linear-to-br from-[#1a1410] via-[#151a22] to-[#0e1218] p-6 shadow-[0_0_60px_-30px_rgba(240,128,92,0.35)] sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#f0805c]/10 blur-3xl"
      />
      <div className="relative space-y-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0805c]/40 bg-[#f0805c]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f0805c]">
            <Star className="size-3 fill-[#f0805c]" />
            current role
          </span>
          <span className="text-[11px] text-[#8b97a7]">{role.period}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {role.title}{" "}
              <span className="text-[#f0805c]">@ {role.company}</span>
            </h2>
            {role.location ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-[#8b97a7]">
                <MapPin className="size-3.5" />
                {role.location}
              </p>
            ) : null}
          </div>
          {role.link ? (
            <Link
              href={role.link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-fit items-center gap-1 rounded-md border border-[#232b36] bg-[#151a22] px-3 py-1.5 text-[12px] text-[#e9eef5] transition hover:border-[#f0805c]/50"
            >
              {role.link.label}
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-[#c9d2df]">
          {role.summary}
        </p>

        <ul className="grid gap-2 sm:grid-cols-2">
          {role.highlights.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-2 rounded-lg border border-[#232b36]/60 bg-[#0e1218]/60 p-3 text-[13px] text-[#c9d2df]"
            >
              <Icon className="mt-0.5 size-3.5 shrink-0 text-[#f0805c]" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {primaryAchievements.length > 0 ? (
          <div className="space-y-3 rounded-xl border border-[#f0805c]/20 bg-[#0e1218]/60 p-4">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-[#f0805c]" />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e9eef5]">
                primary achievements
              </h3>
              <span className="text-[11px] text-[#404a59]">
                [{primaryAchievements.length}]
              </span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {primaryAchievements.map(
                ({ icon: Icon, text }: HighlightItem) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-lg border border-[#232b36]/60 bg-[#151a22]/60 p-3"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-[#f0805c]/30 bg-[#f0805c]/10 text-[#f0805c]">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="text-[12.5px] leading-relaxed text-[#c9d2df]">
                      {text}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : null}

        <StackList items={role.stack} tone="hero" />
      </div>
    </section>
  );
}

function HighlightStrip() {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {highlights.map((h) => (
        <div
          key={h.label}
          className="rounded-xl border border-[#232b36] bg-[#0e1218] p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#57a773]">
            // {h.label}
          </p>
          <p className="mt-2 text-lg font-extrabold tracking-tight text-[#e9eef5]">
            {h.value}
          </p>
          <p className="text-[11px] text-[#8b97a7]">{h.note}</p>
        </div>
      ))}
    </section>
  );
}

function ExperienceSection({ roles }: { roles: Role[] }) {
  return (
    <section className="space-y-5">
      <SectionHeading
        icon={Briefcase}
        label="experience"
        count={roles.length}
      />
      <ol className="relative space-y-4 border-l border-dashed border-[#232b36] pl-5">
        {roles.map((role) => (
          <li key={`${role.company}-${role.period}`} className="relative">
            <span className="absolute -left-6.75 top-4 size-3 rounded-full border-2 border-[#0a0d12] bg-[#404a59]" />
            <RoleCard role={role} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function RoleCard({ role }: { role: Role }) {
  return (
    <article className="rounded-xl border border-[#232b36] bg-[#0e1218] p-5 transition hover:border-[#f0805c]/30">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#e9eef5]">
            {role.company}
          </h3>
          <p className="text-[13px] text-[#8b97a7]">{role.title}</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#57a773]">
          {role.period}
        </span>
      </header>

      <p className="mt-3 text-[13px] leading-relaxed text-[#c9d2df]">
        {role.summary}
      </p>

      <ul className="mt-3 space-y-1.5">
        {role.highlights.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-start gap-2 text-[12.5px] text-[#c9d2df]"
          >
            <Icon className="mt-0.5 size-3.5 shrink-0 text-[#f0805c]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <StackList items={role.stack} />
    </article>
  );
}

function StackList({
  items,
  tone = "default",
}: {
  items: string[];
  tone?: "default" | "hero";
}) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={
            tone === "hero"
              ? "rounded-md border border-[#f0805c]/25 bg-[#f0805c]/5 px-2 py-0.5 text-[11px] text-[#f0805c]"
              : "rounded-md border border-[#232b36] bg-[#151a22] px-2 py-0.5 text-[11px] text-[#8b97a7]"
          }
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SkillsSection() {
  return (
    <section className="space-y-5">
      <SectionHeading icon={Sparkles} label="skills" count={skills.length} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <div
            key={group.label}
            className="rounded-xl border border-[#232b36] bg-[#0e1218] p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#57a773]">
              // {group.label}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-[#232b36] bg-[#151a22] px-2 py-0.5 text-[11px] text-[#c9d2df]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-[#f0805c]" />
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e9eef5]">
        {label}
      </h2>
      {typeof count === "number" ? (
        <span className="text-[11px] text-[#404a59]">[{count}]</span>
      ) : null}
    </div>
  );
}

function ValuesFooter() {
  return (
    <section className="rounded-xl border border-[#232b36] bg-[#0e1218] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#57a773]">
        // values
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {values.map((value) => (
          <li
            key={value}
            className="rounded-lg border border-[#232b36]/60 bg-[#151a22] p-3 text-[12.5px] text-[#c9d2df]"
          >
            {value}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-[#404a59]">
        Available for interesting roles — reach out any time.
      </p>
    </section>
  );
}
