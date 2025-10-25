import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, DollarSign, Home as HomeIcon, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Portfolio() {
  const { user, isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    purchasePrice: "",
    purchaseDate: "",
    currentValue: "",
    renovationCost: "",
    monthlyRent: "",
    monthlyExpenses: "",
    notes: "",
  });

  const { data: portfolioItems, refetch } = trpc.portfolio.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats } = trpc.portfolio.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("Property added to portfolio");
      setShowAddDialog(false);
      setFormData({
        address: "",
        city: "",
        state: "",
        purchasePrice: "",
        purchaseDate: "",
        currentValue: "",
        renovationCost: "",
        monthlyRent: "",
        monthlyExpenses: "",
        notes: "",
      });
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      address: formData.address,
      city: formData.city || undefined,
      state: formData.state || undefined,
      purchasePrice: parseInt(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
      currentValue: formData.currentValue ? parseInt(formData.currentValue) : undefined,
      renovationCost: formData.renovationCost ? parseInt(formData.renovationCost) : undefined,
      monthlyRent: formData.monthlyRent ? parseInt(formData.monthlyRent) : undefined,
      monthlyExpenses: formData.monthlyExpenses ? parseInt(formData.monthlyExpenses) : undefined,
      notes: formData.notes || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold">
              <HomeIcon className="h-6 w-6" />
              {APP_TITLE}
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Property to Portfolio</DialogTitle>
                <DialogDescription>
                  Track properties you own or have under contract
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renovationCost">Renovation Cost</Label>
                    <Input
                      id="renovationCost"
                      type="number"
                      value={formData.renovationCost}
                      onChange={(e) => setFormData({ ...formData, renovationCost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRent">Monthly Rent</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Property"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {stats && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(stats.totalValue).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${Math.round(stats.totalEquity).toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {stats.roi.toFixed(1)}% ROI
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.round(stats.monthlyCashFlow).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!portfolioItems || portfolioItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold">No Properties Yet</h3>
              <p className="text-center text-slate-600 mb-4">
                Start tracking your real estate investments
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {portfolioItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.address}</CardTitle>
                      <CardDescription>
                        {item.city && item.state ? `${item.city}, ${item.state}` : ""}
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
                      {item.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Purchase Price:</span>
                      <span className="font-medium">${item.purchasePrice.toLocaleString()}</span>
                    </div>
                    {item.currentValue && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Current Value:</span>
                        <span className="font-medium">${item.currentValue.toLocaleString()}</span>
                      </div>
                    )}
                    {item.monthlyRent && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Rent:</span>
                        <span className="font-medium text-green-600">
                          ${item.monthlyRent.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="mt-2 text-slate-600">{item.notes}</p>
                    )}
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

