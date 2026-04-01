import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Trophy, DollarSign } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, charities: 0, draws: 0, winners: 0 });

  useEffect(() => {
    async function load() {
      const [profiles, charities, draws, winners] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("charities").select("id", { count: "exact", head: true }),
        supabase.from("draws").select("id", { count: "exact", head: true }),
        supabase.from("winners").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: profiles.count || 0,
        charities: charities.count || 0,
        draws: draws.count || 0,
        winners: winners.count || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { label: "Charities", value: stats.charities, icon: Heart, color: "text-primary" },
    { label: "Draws", value: stats.draws, icon: Trophy, color: "text-amber-500" },
    { label: "Winners", value: stats.winners, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
