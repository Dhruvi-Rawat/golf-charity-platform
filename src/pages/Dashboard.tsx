import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, Trophy, Heart, CreditCard, Plus, Trash2 } from "lucide-react";

interface Score {
  id: string;
  score: number;
  played_date: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  charity_percentage: number;
  selected_charity_id: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<Score[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newScore, setNewScore] = useState("");
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [scoresRes, profileRes] = await Promise.all([
      supabase.from("scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("full_name, charity_percentage, selected_charity_id").eq("id", user.id).single(),
    ]);
    setScores(scoresRes.data || []);
    setProfile(profileRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addScore = async () => {
    const scoreNum = parseInt(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      toast({ title: "Invalid score", description: "Score must be between 1 and 45.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("scores").insert({
      user_id: user!.id,
      score: scoreNum,
      played_date: playedDate,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewScore("");
      toast({ title: "Score added!" });
      fetchData();
    }
  };

  const deleteScore = async (id: string) => {
    await supabase.from("scores").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container flex-1 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || "Golfer"}!</p>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{scores.length}/5</div>
                <div className="text-sm text-muted-foreground">Scores Entered</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Trophy className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">—</div>
                <div className="text-sm text-muted-foreground">Draws Won</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profile?.charity_percentage || 10}%</div>
                <div className="text-sm text-muted-foreground">Charity Donation</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">—</div>
                <div className="text-sm text-muted-foreground">Subscription</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Add Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stableford Score (1–45)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={45}
                    placeholder="36"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Played</Label>
                  <Input
                    type="date"
                    value={playedDate}
                    onChange={(e) => setPlayedDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={addScore} disabled={loading} className="w-full gap-2">
                <Plus className="h-4 w-4" /> {loading ? "Adding..." : "Add Score"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Only your latest 5 scores are kept. Oldest scores are automatically replaced.
              </p>
            </CardContent>
          </Card>

          {/* Your Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Your Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No scores yet. Add your first score!
                </p>
              ) : (
                <div className="space-y-3">
                  {scores.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {s.score}
                        </div>
                        <div>
                          <div className="text-sm font-medium">Score #{i + 1}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(s.played_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteScore(s.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
