import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Platform settings and configuration options will be available here. This includes subscription pricing, draw schedules, and notification preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly Price (£)</Label>
              <Input type="number" placeholder="9.99" disabled />
            </div>
            <div className="space-y-2">
              <Label>Yearly Price (£)</Label>
              <Input type="number" placeholder="99.99" disabled />
            </div>
            <p className="text-xs text-muted-foreground">Pricing will be configurable after Stripe integration.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
