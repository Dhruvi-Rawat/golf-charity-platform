import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Charities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .then(({ data }) => {
        setCharities(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-secondary py-16">
        <div className="container text-center">
          <Heart className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h1 className="text-4xl font-extrabold text-secondary-foreground mb-4">Our Charities</h1>
          <p className="text-secondary-foreground/70 max-w-lg mx-auto">
            Choose a charity to support with your subscription. At least 10% goes directly to them.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="container">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : charities.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">No charities listed yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {charities.map((charity) => (
                <motion.div key={charity.id} variants={fadeUp}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    {charity.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img src={charity.image_url} alt={charity.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg">{charity.name}</h3>
                        {charity.is_featured && (
                          <Badge className="bg-accent text-accent-foreground shrink-0">Featured</Badge>
                        )}
                      </div>
                      {charity.description && (
                        <p className="text-sm text-muted-foreground mb-3">{charity.description}</p>
                      )}
                      {charity.website_url && (
                        <a
                          href={charity.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Visit website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
