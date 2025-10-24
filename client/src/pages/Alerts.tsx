import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Alerts() {
  const { isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: "",
    propertyType: "both" as "single-family" | "multifamily" | "both",
    minPrice: "",
    maxPrice: "",
    minProfitMargin: "",
    location: "",
  });

  const { data: alerts, isLoading, refetch } = trpc.alerts.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createAlertMutation = trpc.alerts.create.useMutation({
    onSuccess: () => {
      toast.success("Alert created successfully");
      refetch();
      setIsDialogOpen(false);
      setNewAlert({
        name: "",
        propertyType: "both",
        minPrice: "",
        maxPrice: "",
        minProfitMargin: "",
        location: "",
      });
    },
    onError: () => {
      toast.error("Failed to create alert");
    },
  });

  const deleteAlertMutation = trpc.alerts.delete.useMutation({
    onSuccess: () => {
      toast.success("Alert deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete alert");
    },
  });

  const updateAlertMutation = trpc.alerts.update.useMutation({
    onSuccess: () => {
      toast.success("Alert updated");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update alert");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">Please sign in to manage your alerts</p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateAlert = () => {
    if (!newAlert.name) {
      toast.error("Please enter an alert name");
      return;
    }

    createAlertMutation.mutate({
      name: newAlert.name,
      propertyType: newAlert.propertyType,
      minPrice: newAlert.minPrice ? parseInt(newAlert.minPrice) : undefined,
      maxPrice: newAlert.maxPrice ? parseInt(newAlert.maxPrice) : undefined,
      minProfitMargin: newAlert.minProfitMargin ? parseInt(newAlert.minProfitMargin) : undefined,
      location: newAlert.location || undefined,
    });
  };

  const handleDeleteAlert = (id: number) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteAlertMutation.mutate({ id });
    }
  };

  const handleToggleAlert = (id: number, isActive: number) => {
    updateAlertMutation.mutate({ id, isActive: isActive ? 0 : 1 });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription>
                    Set up criteria to be notified when matching properties are found
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alertName">Alert Name</Label>
                    <Input
                      id="alertName"
                      placeholder="e.g., Austin High Profit Deals"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alertPropertyType">Property Type</Label>
                    <Select
                      value={newAlert.propertyType}
                      onValueChange={(value: any) => setNewAlert({ ...newAlert, propertyType: value })}
                    >
                      <SelectTrigger id="alertPropertyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="multifamily">Multifamily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="alertMinPrice">Min Price</Label>
                      <Input
                        id="alertMinPrice"
                        type="number"
                        placeholder="$0"
                        value={newAlert.minPrice}
                        onChange={(e) => setNewAlert({ ...newAlert, minPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertMaxPrice">Max Price</Label>
                      <Input
                        id="alertMaxPrice"
                        type="number"
                        placeholder="$1,000,000"
                        value={newAlert.maxPrice}
                        onChange={(e) => setNewAlert({ ...newAlert, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alertMinProfit">Min Profit Margin</Label>
                    <Input
                      id="alertMinProfit"
                      type="number"
                      placeholder="$50,000"
                      value={newAlert.minProfitMargin}
                      onChange={(e) => setNewAlert({ ...newAlert, minProfitMargin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alertLocation">Location</Label>
                    <Input
                      id="alertLocation"
                      placeholder="e.g., Austin, TX"
                      value={newAlert.location}
                      onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAlert} disabled={createAlertMutation.isPending}>
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Deal Alerts</h1>
          <p className="text-slate-600">Get notified when properties match your criteria</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading alerts...</p>
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">You haven't created any alerts yet</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Alert</DialogTitle>
                    <DialogDescription>
                      Set up criteria to be notified when matching properties are found
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alertName2">Alert Name</Label>
                      <Input
                        id="alertName2"
                        placeholder="e.g., Austin High Profit Deals"
                        value={newAlert.name}
                        onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertPropertyType2">Property Type</Label>
                      <Select
                        value={newAlert.propertyType}
                        onValueChange={(value: any) => setNewAlert({ ...newAlert, propertyType: value })}
                      >
                        <SelectTrigger id="alertPropertyType2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="single-family">Single Family</SelectItem>
                          <SelectItem value="multifamily">Multifamily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="alertMinPrice2">Min Price</Label>
                        <Input
                          id="alertMinPrice2"
                          type="number"
                          placeholder="$0"
                          value={newAlert.minPrice}
                          onChange={(e) => setNewAlert({ ...newAlert, minPrice: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alertMaxPrice2">Max Price</Label>
                        <Input
                          id="alertMaxPrice2"
                          type="number"
                          placeholder="$1,000,000"
                          value={newAlert.maxPrice}
                          onChange={(e) => setNewAlert({ ...newAlert, maxPrice: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertMinProfit2">Min Profit Margin</Label>
                      <Input
                        id="alertMinProfit2"
                        type="number"
                        placeholder="$50,000"
                        value={newAlert.minProfitMargin}
                        onChange={(e) => setNewAlert({ ...newAlert, minProfitMargin: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertLocation2">Location</Label>
                      <Input
                        id="alertLocation2"
                        placeholder="e.g., Austin, TX"
                        value={newAlert.location}
                        onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAlert} disabled={createAlertMutation.isPending}>
                      Create Alert
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{alert.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {alert.propertyType === "both"
                          ? "All property types"
                          : alert.propertyType === "single-family"
                            ? "Single Family"
                            : "Multifamily"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive === 1}
                        onCheckedChange={() => handleToggleAlert(alert.id, alert.isActive)}
                        disabled={updateAlertMutation.isPending}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {alert.minPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Min Price</span>
                        <span className="font-medium">${alert.minPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {alert.maxPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Max Price</span>
                        <span className="font-medium">${alert.maxPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {alert.minProfitMargin && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Min Profit</span>
                        <span className="font-medium">${alert.minProfitMargin.toLocaleString()}</span>
                      </div>
                    )}
                    {alert.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Location</span>
                        <span className="font-medium">{alert.location}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          alert.isActive === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {alert.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

