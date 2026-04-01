import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Monthly",
    price: "£9.99",
    period: "/month",
    features: [
      "Enter monthly draws",
      "5 rolling scores",
      "Choose your charity",
      "10%+ to charity",
      "Winner dashboard",
    ],
    popular: false,
  },
  {
    name: "Yearly",
    price: "£99",
    period: "/year",
    features: [
      "Everything in Monthly",
      "Save 17%",
      "Priority support",
      "Exclusive yearly draws",
      "Bonus charity impact report",
    ],
    popular: true,
  },
];

export default function Subscribe() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-secondary py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold text-secondary-foreground mb-4">Choose Your Plan</h1>
          <p className="text-secondary-foreground/70 max-w-lg mx-auto">
            Subscribe to enter monthly draws and support charities. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="container max-w-3xl">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Star className="h-3 w-3" /> Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Stripe payments will be integrated in Phase 2. Prices are illustrative.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
