import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CharitiesPage() {
  const { toast } = useToast();
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchCharities = async () => {
    setLoading(true);
    const { data } = await supabase.from("charities").select("*").order("created_at", { ascending: false });
    setCharities(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCharities(); }, []);

  const resetForm = () => {
    setName(""); setDescription(""); setWebsiteUrl(""); setImageUrl("");
    setIsActive(true); setIsFeatured(false); setEditing(null);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setName(c.name); setDescription(c.description || ""); setWebsiteUrl(c.website_url || "");
    setImageUrl(c.image_url || ""); setIsActive(c.is_active); setIsFeatured(c.is_featured);
    setDialogOpen(true);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    const payload = {
      name, description: description || null, website_url: websiteUrl || null,
      image_url: imageUrl || null, is_active: isActive, is_featured: isFeatured,
    };

    const { error } = editing
      ? await supabase.from("charities").update(payload).eq("id", editing.id)
      : await supabase.from("charities").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Charity updated" : "Charity added" });
      setDialogOpen(false); resetForm(); fetchCharities();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Charity deleted" }); fetchCharities();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Charities</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Charity</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Charity" : "Add Charity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Charity name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label>Featured</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Charity</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
          ) : charities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No charities yet.</p>
          ) : (
            <div className="divide-y">
              {charities.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.is_active ? "Active" : "Inactive"}
                      {c.is_featured && " • Featured"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
