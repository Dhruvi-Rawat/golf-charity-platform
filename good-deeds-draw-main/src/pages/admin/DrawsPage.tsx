import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DrawsPage() {
  const { toast } = useToast();
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawDate, setDrawDate] = useState("");
  const [drawType, setDrawType] = useState<"random" | "algorithmic">("random");
  const [jackpot, setJackpot] = useState("0");

  const fetchDraws = async () => {
    setLoading(true);
    const { data } = await supabase.from("draws").select("*").order("draw_date", { ascending: false });
    setDraws(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDraws(); }, []);

  const createDraw = async () => {
    if (!drawDate) return;
    const { error } = await supabase.from("draws").insert({
      draw_date: drawDate,
      draw_type: drawType,
      jackpot_amount: Number(jackpot) || 0,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Draw created" });
      setDialogOpen(false); setDrawDate(""); setJackpot("0");
      fetchDraws();
    }
  };

  const updateStatus = async (id: string, status: "draft" | "simulated" | "published") => {
    const { error } = await supabase.from("draws").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Draw ${status}` }); fetchDraws();
    }
  };

  const statusColor = (s: string) => {
    if (s === "published") return "default";
    if (s === "simulated") return "secondary";
    return "outline";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Draws</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> New Draw</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Draw</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Draw Date *</Label>
              <Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Draw Type</Label>
              <Select value={drawType} onValueChange={(v: any) => setDrawType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="algorithmic">Algorithmic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jackpot Amount</Label>
              <Input type="number" value={jackpot} onChange={(e) => setJackpot(e.target.value)} />
            </div>
            <Button onClick={createDraw} className="w-full">Create Draw</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
          ) : draws.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No draws yet.</p>
          ) : (
            <div className="divide-y">
              {draws.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{d.draw_date}</div>
                    <div className="text-sm text-muted-foreground">
                      {d.draw_type} • Jackpot: ${d.jackpot_amount}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(d.status) as any}>{d.status}</Badge>
                    {d.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(d.id, "simulated")}>
                        Simulate
                      </Button>
                    )}
                    {d.status === "simulated" && (
                      <Button size="sm" onClick={() => updateStatus(d.id, "published")}>
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
