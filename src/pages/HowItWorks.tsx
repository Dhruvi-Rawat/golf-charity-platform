import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Target, Trophy, Heart, ArrowRight, Percent, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const steps = [
  { icon: UserPlus, title: "1. Create an Account", desc: "Sign up and choose a monthly or yearly subscription plan." },
  { icon: Target, title: "2. Enter Your Scores", desc: "Submit your latest Stableford scores (1–45). Keep your best 5 rolling." },
  { icon: Calendar, title: "3. Monthly Draw", desc: "Each month, 5 random numbers are drawn (1–45). Your scores are your entries." },
  { icon: Trophy, title: "4. Match & Win", desc: "Match 3, 4, or all 5 numbers to win a share of the prize pool." },
  { icon: Heart, title: "5. Give Back", desc: "At least 10% of your subscription goes to your chosen charity." },
];

const prizeBreakdown = [
  { match: "5 Numbers", share: "40%", note: "Rolls over if no winner" },
  { match: "4 Numbers", share: "35%", note: "Split among winners" },
  { match: "3 Numbers", share: "25%", note: "Split among winners" },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-secondary py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold text-secondary-foreground mb-4">How It Works</h1>
          <p className="text-secondary-foreground/70 max-w-lg mx-auto">
            A simple concept: your golf scores become your lottery numbers, and your subscription supports charities.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            {steps.map((step) => (
              <motion.div key={step.title} variants={fadeUp}>
                <Card className="border-none bg-muted/50">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-2">Prize Pool Breakdown</h2>
          <p className="text-muted-foreground mb-8 text-sm">The prize pool is funded by subscriptions and split among winners each month.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {prizeBreakdown.map((p) => (
              <Card key={p.match} className="border-none bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-extrabold text-primary mb-1">{p.share}</div>
                  <div className="font-semibold mb-1">{p.match}</div>
                  <div className="text-xs text-muted-foreground">{p.note}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Percent className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Charity Contribution</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            A minimum of 10% from every subscription goes directly to the charity you choose.
            You can increase this percentage anytime from your dashboard.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Join Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
