import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, DollarSign, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Watchlist() {
  const { user, isAuthenticated } = useAuth();
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});

  const { data: watchlist, isLoading, refetch } = trpc.watchlist.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFromWatchlistMutation = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Property removed from watchlist");
      refetch();
    },
    onError: () => {
      toast.error("Failed to remove property");
    },
  });

  const updateNotesMutation = trpc.watchlist.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes updated");
      refetch();
      setEditingNotes({});
    },
    onError: () => {
      toast.error("Failed to update notes");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">Please sign in to view your watchlist</p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleRemove = (id: number) => {
    if (confirm("Are you sure you want to remove this property from your watchlist?")) {
      removeFromWatchlistMutation.mutate({ id });
    }
  };

  const handleSaveNotes = (id: number, notes: string) => {
    updateNotesMutation.mutate({ id, notes });
  };

  const exportToCSV = () => {
    if (!watchlist || watchlist.length === 0) {
      toast.error("No properties to export");
      return;
    }

    const headers = [
      "Address",
      "City",
      "State",
      "Property Type",
      "Current Price",
      "Est. ARV",
      "Est. Profit",
      "Days on Market",
      "Notes",
    ];

    const rows = watchlist.map((item) => [
      item.property.address,
      item.property.city,
      item.property.state,
      item.property.propertyType,
      item.property.currentPrice,
      item.property.estimatedARV || "",
      item.property.estimatedProfitPotential || "",
      item.property.daysOnMarket || "",
      item.notes || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watchlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Watchlist exported");
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
            <Button onClick={exportToCSV} variant="outline" disabled={!watchlist || watchlist.length === 0}>
              Export to CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">My Watchlist</h1>
          <p className="text-slate-600">Properties you're interested in</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading watchlist...</p>
          </div>
        ) : !watchlist || watchlist.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">Your watchlist is empty</p>
              <Link href="/">
                <Button>Browse Properties</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {watchlist.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/property/${item.property.id}`}>
                        <CardTitle className="cursor-pointer hover:text-blue-600">{item.property.address}</CardTitle>
                      </Link>
                      <CardDescription>
                        {item.property.city}, {item.property.state}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.id)}
                      disabled={removeFromWatchlistMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Property Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current Price</span>
                        <span className="font-semibold">${item.property.currentPrice.toLocaleString()}</span>
                      </div>
                      {item.property.estimatedARV && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Est. ARV</span>
                          <span className="font-semibold">${item.property.estimatedARV.toLocaleString()}</span>
                        </div>
                      )}
                      {item.property.estimatedProfitPotential && (
                        <div className="flex items-center justify-between rounded-md bg-green-50 p-2">
                          <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                            <DollarSign className="h-4 w-4" />
                            Profit Potential
                          </span>
                          <span className="font-bold text-green-700">
                            ${item.property.estimatedProfitPotential.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {item.property.beds && item.property.baths && (
                        <div className="text-sm text-slate-600">
                          {item.property.beds} bed • {item.property.baths} bath
                          {item.property.squareFeet && ` • ${item.property.squareFeet.toLocaleString()} sqft`}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Notes</label>
                      <Textarea
                        placeholder="Add your notes here..."
                        value={editingNotes[item.id] !== undefined ? editingNotes[item.id] : item.notes || ""}
                        onChange={(e) =>
                          setEditingNotes({
                            ...editingNotes,
                            [item.id]: e.target.value,
                          })
                        }
                        rows={3}
                      />
                      {editingNotes[item.id] !== undefined && editingNotes[item.id] !== (item.notes || "") && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(item.id, editingNotes[item.id])}
                          disabled={updateNotesMutation.isPending}
                        >
                          Save Notes
                        </Button>
                      )}
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

