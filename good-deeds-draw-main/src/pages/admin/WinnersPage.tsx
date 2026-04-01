import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export default function WinnersPage() {
  const { toast } = useToast();
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("winners")
      .select("*, draws(draw_date)")
      .order("created_at", { ascending: false });
    
    // Fetch profile names separately
    const userIds = [...new Set((data || []).map((w) => w.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name]));
    const enriched = (data || []).map((w) => ({ ...w, user_name: profileMap[w.user_id] || "Unknown" }));
    
    setWinners(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchWinners(); }, []);

  const updateVerification = async (id: string, status: "pending" | "approved" | "rejected") => {
    const { error } = await supabase.from("winners").update({ verification_status: status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Winner ${status}` }); fetchWinners();
    }
  };

  const updatePayout = async (id: string, status: "pending" | "paid") => {
    const { error } = await supabase.from("winners").update({ payout_status: status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Payout marked as ${status}` }); fetchWinners();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Winners</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
          ) : winners.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No winners yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.user_name}</TableCell>
                    <TableCell>{w.draws?.draw_date || "—"}</TableCell>
                    <TableCell>{w.match_type}-match</TableCell>
                    <TableCell>${w.prize_amount}</TableCell>
                    <TableCell>
                      <Badge variant={w.verification_status === "approved" ? "default" : w.verification_status === "rejected" ? "destructive" : "secondary"}>
                        {w.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.payout_status === "paid" ? "default" : "outline"}>
                        {w.payout_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {w.verification_status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateVerification(w.id, "approved")} className="gap-1">
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateVerification(w.id, "rejected")} className="gap-1">
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}
                        {w.verification_status === "approved" && w.payout_status === "pending" && (
                          <Button size="sm" onClick={() => updatePayout(w.id, "paid")}>Mark Paid</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
