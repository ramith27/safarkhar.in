import Link from "next/link";
import {
  Map,
  Car,
  Wallet,
  BarChart3,
  Shield,
  Users,
  CheckCircle2,
  ArrowRight,
  Plane,
  Train,
  Bus,
  UtensilsCrossed,
  BedDouble,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Map,
    title: "Multi-modal Trips",
    description:
      "Track flights, trains, buses, ferries, taxis, and personal vehicles all in one trip.",
  },
  {
    icon: Wallet,
    title: "Smart Wallets",
    description:
      "Manage FASTag, fuel cards, UPI wallets and credit cards. Balance snapshots on every trip.",
  },
  {
    icon: BarChart3,
    title: "Expense Reports",
    description:
      "Beautiful charts showing monthly spend, category breakdown, and top trips.",
  },
  {
    icon: Car,
    title: "Vehicle Tracking",
    description:
      "Track odometer, fuel levels, battery % and running costs per vehicle.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data stays in your own database. Self-hosted with full control.",
  },
  {
    icon: Users,
    title: "Group Trips",
    description:
      "Add multiple people and automatically split costs per head for every trip.",
  },
];

const transportModes = [
  { icon: Plane, label: "Flight" },
  { icon: Train, label: "Train" },
  { icon: Bus, label: "Bus" },
  { icon: Car, label: "Car" },
  { icon: UtensilsCrossed, label: "Food" },
  { icon: BedDouble, label: "Hotel" },
  { icon: Zap, label: "EV Charging" },
  { icon: Map, label: "Ferry" },
];

const benefits = [
  "Track every rupee across all transport modes",
  "Per-person cost splitting for group travel",
  "Wallet balance snapshots at trip start and end",
  "Monthly and category spend breakdowns",
  "Fuel, toll, parking, and charging records",
  "Full expense audit trail per trip",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Safarkhar</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge className="mb-6 px-3 py-1" variant="secondary">
          Travel expense tracker for India ✈️
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Track every rupee
          <br />
          <span className="text-primary">on every trip</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          From flights to ferries, hotels to highways — Safarkhar helps you log,
          split, and analyze all your travel expenses in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto text-base px-8">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-8"
            >
              View demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Transport modes strip */}
      <section className="border-y border-border/60 bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6">
            SUPPORTS ALL YOUR TRAVEL MODES
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {transportModes.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built for frequent travellers who want a clear picture of where
            their travel money goes.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits checklist */}
      <section className="bg-primary/5 border-y border-border/60 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stop guessing what your trip cost
              </h2>
              <p className="text-muted-foreground mb-8">
                Safarkhar creates a complete expense trail — from the minute you
                leave home to when you return. Every segment, every expense,
                every wallet transaction.
              </p>
              <Link href="/login">
                <Button size="lg">
                  Try it now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to track your next trip?
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Set up takes less than 2 minutes. No credit card required.
        </p>
        <Link href="/login">
          <Button size="lg" className="text-base px-10">
            Get started free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Map className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Safarkhar</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Safarkhar. Track smarter, travel better.
          </p>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
