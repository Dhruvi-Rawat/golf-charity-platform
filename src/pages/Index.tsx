import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Heart, Target, Users, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const stats = [
  { label: "Active Players", value: "2,500+", icon: Users },
  { label: "Donated to Charity", value: "£125K+", icon: Heart },
  { label: "Prizes Awarded", value: "£85K+", icon: Trophy },
  { label: "Charities Supported", value: "30+", icon: Star },
];

const steps = [
  {
    icon: Users,
    title: "Subscribe",
    description: "Choose a monthly or yearly plan to join the community.",
  },
  {
    icon: Target,
    title: "Submit Scores",
    description: "Enter your latest 5 Stableford scores (1–45 points).",
  },
  {
    icon: Trophy,
    title: "Monthly Draw",
    description: "Your scores become your lottery numbers. Match & win!",
  },
  {
    icon: Heart,
    title: "Support Charity",
    description: "At least 10% of every subscription goes to your chosen charity.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Heart className="h-4 w-4" /> Golf meets charity
            </motion.div>
            <motion.h1 variants={fadeUp} className="mb-6 text-4xl font-extrabold tracking-tight text-secondary-foreground md:text-6xl">
              Play Golf.{" "}
              <span className="text-primary">Win Prizes.</span>{" "}
              <br className="hidden md:block" />
              Change Lives.
            </motion.h1>
            <motion.p variants={fadeUp} className="mb-8 text-lg text-secondary-foreground/70 md:text-xl">
              Your Stableford scores become your lottery numbers. Every subscription supports charities you care about.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg" className="text-base px-8 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/5">
                  How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-12">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Four simple steps to play, win, and make a difference.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-4"
          >
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp}>
                <Card className="h-full border-none bg-muted/50 hover:bg-muted transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">
                      Step {i + 1}
                    </div>
                    <h3 className="mb-2 font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Ready to Make a Difference?
          </h2>
          <p className="mb-8 text-primary-foreground/80 max-w-lg mx-auto">
            Join thousands of golfers who are winning prizes and supporting charities they love.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-8">
              Start Your Journey <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
