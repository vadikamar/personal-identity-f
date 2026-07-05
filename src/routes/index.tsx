import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Nfc, Smartphone, Server, UserCircle2, Sparkles, Palette, Globe, QrCode, Wallet, Shuffle } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ProfileView } from "@/components/ProfileView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TapMe — One Tap, Infinite Identities" },
      { name: "description", content: "TapMe turns a single NFC card into contextual digital identities — Professional, Friends, Personal, SOS. Share the right version of you with one tap." },
      { property: "og:title", content: "TapMe — One Tap, Infinite Identities" },
      { property: "og:description", content: "Contextual digital identity powered by NFC." },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "01", title: "Tap the NFC card", desc: "Tap your card on any NFC enabled smartphone.", icon: Nfc },
  { n: "02", title: "Landing page opens", desc: "A crisp landing page with your name and vibe.", icon: Smartphone },
  { n: "03", title: "Choose profile type", desc: "Viewer picks the context they want to see.", icon: UserCircle2 },
  { n: "04", title: "View profile", desc: "That specific profile is displayed — instantly.", icon: Sparkles },
];

const features = [
  { icon: Sparkles, title: "AI Profile Builder", desc: "Generate your profile with AI in seconds." },
  { icon: Palette, title: "Custom Themes", desc: "Choose from beautiful themes." },
  { icon: Globe, title: "Custom Domain", desc: "Use your own domain like vadik.me." },
  { icon: QrCode, title: "QR Code", desc: "Share your profile via QR." },
  { icon: Wallet, title: "Apple Wallet", desc: "Add your profile to Apple Wallet." },
  { icon: Shuffle, title: "Smart Switch", desc: "Switch active profile instantly." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">TAPME</span>
        </Link>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#profiles" className="hover:text-foreground">Profiles</a>
          <a href="#features" className="hover:text-foreground">Features</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/u/vadik" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Live demo</Link>
          <Link to="/app" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
            Open dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pt-10 pb-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> NFC-powered digital identity
          </span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            One tap.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
              Infinite identities.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground">
            TapMe turns a single NFC card into five contextual profiles — professional, casual,
            friends, personal, and emergency. Share the right you, every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/u/vadik" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Try the live demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/app" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-medium hover:bg-card">
              Open dashboard
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              ["5", "Profile modes"],
              ["1", "NFC card"],
              ["0s", "Setup time"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-border bg-card/40 px-3 py-3">
                <div className="text-2xl font-semibold">{n}</div>
                <div className="text-[11px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </dl>
        </div>

        {/* Hero phone */}
        <div className="flex justify-center lg:justify-end">
          <PhoneFrame>
            <ProfileView type="professional" />
          </PhoneFrame>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-background/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Tap. Choose. Connect.</h2>
            </div>
            <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
              A four-step flow that turns any NFC-enabled phone into your personal introduction.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{s.n}</span>
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-6 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile carousel */}
      <section id="profiles" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Five modes</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              A different face for every context.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Same card, five entirely different profiles. The viewer chooses which version of you they see.
            </p>
          </div>
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-6">
            {(["professional", "just-met", "friends", "personal", "sos"] as const).map((k) => (
              <div key={k} className="snap-center">
                <div className="mb-3 text-center text-sm font-medium text-muted-foreground">
                  {k === "just-met" ? "Just Met" : k === "sos" ? "SOS (Emergency)" : k[0].toUpperCase() + k.slice(1)}
                </div>
                <PhoneFrame>
                  <ProfileView type={k} />
                </PhoneFrame>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backend flow */}
      <section className="border-t border-border bg-background/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Under the hood</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Simple by design.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { icon: Nfc, t: "NFC Card", d: "Stores your unique URL." },
              { icon: Smartphone, t: "User Taps", d: "Card on phone." },
              { icon: Server, t: "Our Server", d: "Identifies and fetches active profile." },
              { icon: Sparkles, t: "Profile Displayed", d: "To the viewer." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-gradient-card p-5">
                <x.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-semibold">{x.t}</p>
                <p className="text-xs text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Roadmap</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Extra features.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-gradient-card p-6 transition-colors hover:border-primary/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-border bg-gradient-primary p-10 text-center shadow-glow">
            <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
              Ready to reinvent your first impression?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
              Claim your handle, order a card, and start tapping.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© 2026 TapMe</span>
          <span>Made with a single tap.</span>
        </div>
      </footer>
    </div>
  );
}
