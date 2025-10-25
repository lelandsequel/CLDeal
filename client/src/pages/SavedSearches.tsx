import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, Calculator, Heart, Home, MapIcon, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function SavedSearches() {
  const { user, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchCriteria, setSearchCriteria] = useState({
    propertyType: "all" as "all" | "single-family" | "multifamily",
    minPrice: "",
    maxPrice: "",
    minARV: "",
    maxARV: "",
    maxPriceToARVRatio: "",
    minProfit: "",
    city: "",
    state: "",
    minDaysOnMarket: "",
    notificationFrequency: "daily" as "instant" | "daily" | "weekly",
  });

  const { data: savedSearches, refetch } = trpc.savedSearches.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createSearchMutation = trpc.savedSearches.create.useMutation({
    onSuccess: () => {
      toast.success("Search saved successfully");
      setIsDialogOpen(false);
      setSearchName("");
      refetch();
    },
    onError: () => {
      toast.error("Failed to save search");
    },
  });

  const deleteSearchMutation = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      toast.success("Search deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete search");
    },
  });

  const toggleNotificationsMutation = trpc.savedSearches.toggleNotifications.useMutation({
    onSuccess: () => {
      toast.success("Notifications updated");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update notifications");
    },
  });

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast.error("Please enter a search name");
      return;
    }

    createSearchMutation.mutate({
      searchName,
      propertyType: searchCriteria.propertyType === "all" ? undefined : searchCriteria.propertyType,
      minPrice: searchCriteria.minPrice ? parseInt(searchCriteria.minPrice) : undefined,
      maxPrice: searchCriteria.maxPrice ? parseInt(searchCriteria.maxPrice) : undefined,
      minARV: searchCriteria.minARV ? parseInt(searchCriteria.minARV) : undefined,
      maxARV: searchCriteria.maxARV ? parseInt(searchCriteria.maxARV) : undefined,
      maxPriceToARVRatio: searchCriteria.maxPriceToARVRatio ? parseInt(searchCriteria.maxPriceToARVRatio) : undefined,
      minProfit: searchCriteria.minProfit ? parseInt(searchCriteria.minProfit) : undefined,
      city: searchCriteria.city || undefined,
      state: searchCriteria.state || undefined,
      minDaysOnMarket: searchCriteria.minDaysOnMarket ? parseInt(searchCriteria.minDaysOnMarket) : undefined,
      notificationsEnabled: true,
      notificationFrequency: searchCriteria.notificationFrequency,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage saved searches</CardDescription>
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
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold">
              <Home className="h-6 w-6" />
              {APP_TITLE}
            </a>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <a className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <Search className="h-4 w-4" />
                Search
              </a>
            </Link>
            <Link href="/watchlist">
              <a className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <Heart className="h-4 w-4" />
                Watchlist
              </a>
            </Link>
            <Link href="/saved-searches">
              <a className="flex items-center gap-2 font-medium text-blue-600">
                <Bell className="h-4 w-4" />
                Saved Searches
              </a>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Searches</h1>
            <p className="text-slate-600">Get notified when new properties match your criteria</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Saved Search
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Saved Search</DialogTitle>
                <DialogDescription>
                  Set your search criteria and get notified when matching properties are found
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    placeholder="e.g., Austin Single Family Under 300K"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type</Label>
                    <Select
                      value={searchCriteria.propertyType}
                      onValueChange={(value: any) =>
                        setSearchCriteria({ ...searchCriteria, propertyType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="multifamily">Multifamily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notification Frequency</Label>
                    <Select
                      value={searchCriteria.notificationFrequency}
                      onValueChange={(value: any) =>
                        setSearchCriteria({ ...searchCriteria, notificationFrequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Price</Label>
                    <Input
                      type="number"
                      placeholder="$0"
                      value={searchCriteria.minPrice}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, minPrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Max Price</Label>
                    <Input
                      type="number"
                      placeholder="$1,000,000"
                      value={searchCriteria.maxPrice}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      placeholder="e.g., Austin"
                      value={searchCriteria.city}
                      onChange={(e) => setSearchCriteria({ ...searchCriteria, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      placeholder="e.g., TX"
                      maxLength={2}
                      value={searchCriteria.state}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, state: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSearch} disabled={createSearchMutation.isPending} className="w-full">
                  {createSearchMutation.isPending ? "Saving..." : "Save Search"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {savedSearches && savedSearches.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold">No Saved Searches Yet</h3>
              <p className="mb-4 text-center text-slate-600">
                Create a saved search to get notified when properties match your criteria
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Search
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedSearches?.map((search) => (
            <Card key={search.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{search.searchName}</CardTitle>
                    <CardDescription className="mt-1">
                      {search.notificationFrequency === "instant" && "Instant notifications"}
                      {search.notificationFrequency === "daily" && "Daily digest"}
                      {search.notificationFrequency === "weekly" && "Weekly summary"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleNotificationsMutation.mutate({
                        id: search.id,
                        enabled: search.notificationsEnabled === 0,
                      })
                    }
                  >
                    {search.notificationsEnabled === 1 ? (
                      <Bell className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {search.propertyType && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium capitalize">{search.propertyType}</span>
                    </div>
                  )}
                  {(search.minPrice || search.maxPrice) && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-medium">
                        ${search.minPrice?.toLocaleString() || "0"} - $
                        {search.maxPrice?.toLocaleString() || "∞"}
                      </span>
                    </div>
                  )}
                  {(search.city || search.state) && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Location:</span>
                      <span className="font-medium">
                        {search.city}
                        {search.city && search.state && ", "}
                        {search.state}
                      </span>
                    </div>
                  )}
                  {search.maxPriceToARVRatio && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Max % ARV:</span>
                      <span className="font-medium">{search.maxPriceToARVRatio}%</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => deleteSearchMutation.mutate({ id: search.id })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

