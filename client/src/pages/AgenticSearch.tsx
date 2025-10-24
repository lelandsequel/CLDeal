import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AgenticSearch() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchMode, setSearchMode] = useState<"single" | "multi">("single");
  const [singleLocation, setSingleLocation] = useState("");
  const [multiLocations, setMultiLocations] = useState("");
  const [propertyType, setPropertyType] = useState<"single-family" | "multifamily" | "both">("both");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxPriceToARVRatio, setMaxPriceToARVRatio] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  const runSearchMutation = trpc.agenticSearch.runSearch.useMutation({
    onSuccess: (data) => {
      setSearchResults(data);
      toast.success(`Found ${data.propertiesFound} properties!`);
      // Refresh the page after a delay to show new properties
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });

  const runMultiSearchMutation = trpc.agenticSearch.runMultiSearch.useMutation({
    onSuccess: (data) => {
      setSearchResults(data);
      const totalProperties = data.reduce((sum: number, result: any) => sum + result.propertiesFound, 0);
      toast.success(`Found ${totalProperties} properties across ${data.length} locations!`);
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">Please sign in to use agentic search</p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    if (searchMode === "single") {
      if (!singleLocation.trim()) {
        toast.error("Please enter a location");
        return;
      }

      runSearchMutation.mutate({
        location: singleLocation,
        propertyType,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        maxPriceToARVRatio: maxPriceToARVRatio ? parseInt(maxPriceToARVRatio) : undefined,
      });
    } else {
      const locations = multiLocations
        .split("\n")
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0);

      if (locations.length === 0) {
        toast.error("Please enter at least one location");
        return;
      }

      runMultiSearchMutation.mutate({
        locations,
        propertyType,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        maxPriceToARVRatio: maxPriceToARVRatio ? parseInt(maxPriceToARVRatio) : undefined,
      });
    }
  };

  const isSearching = runSearchMutation.isPending || runMultiSearchMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Agentic Property Search</h1>
          </div>
          <p className="text-lg text-slate-600">
            AI-powered autonomous search across the web to find distressed investment properties
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Configure Search
              </CardTitle>
              <CardDescription>
                The agent will search multiple platforms using various keywords to find distressed properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Mode */}
              <div className="space-y-2">
                <Label>Search Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={searchMode === "single" ? "default" : "outline"}
                    onClick={() => setSearchMode("single")}
                    className="flex-1"
                  >
                    Single Location
                  </Button>
                  <Button
                    variant={searchMode === "multi" ? "default" : "outline"}
                    onClick={() => setSearchMode("multi")}
                    className="flex-1"
                  >
                    Multiple Locations
                  </Button>
                </div>
              </div>

              {/* Location Input */}
              {searchMode === "single" ? (
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Austin, TX"
                    value={singleLocation}
                    onChange={(e) => setSingleLocation(e.target.value)}
                  />
                  <p className="text-sm text-slate-500">Enter a city and state</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="locations">Locations (one per line) *</Label>
                  <Textarea
                    id="locations"
                    placeholder="Austin, TX&#10;Dallas, TX&#10;Houston, TX"
                    rows={6}
                    value={multiLocations}
                    onChange={(e) => setMultiLocations(e.target.value)}
                  />
                  <p className="text-sm text-slate-500">Enter one location per line</p>
                </div>
              )}

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={propertyType} onValueChange={(value: any) => setPropertyType(value)}>
                  <SelectTrigger id="propertyType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="single-family">Single Family</SelectItem>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price (Optional)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="e.g., 500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Max Price to ARV Ratio */}
              <div className="space-y-2">
                <Label htmlFor="maxPriceToARVRatio">Max Price % of ARV (Optional)</Label>
                <Input
                  id="maxPriceToARVRatio"
                  type="number"
                  placeholder="e.g., 60"
                  value={maxPriceToARVRatio}
                  onChange={(e) => setMaxPriceToARVRatio(e.target.value)}
                />
                <p className="text-sm text-slate-500">
                  e.g., 60 = only find properties where price is max 60% of ARV (70% rule)
                </p>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={isSearching} className="w-full gap-2" size="lg">
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run Agentic Search
                  </>
                )}
              </Button>

              {/* Info Box */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">How it works:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• AI agent generates multiple search queries with distressed property keywords</li>
                  <li>• Searches across various platforms (Zillow, Realtor.com, foreclosure sites, etc.)</li>
                  <li>• Extracts property data including pricing, condition, and profit potential</li>
                  <li>• Calculates profit scores and saves properties to your database</li>
                  <li>• Typically finds 10-15 properties per location</li>
                </ul>
              </div>

              {/* Search Results */}
              {searchResults && !isSearching && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h4 className="mb-2 font-semibold text-green-900">Search Complete!</h4>
                  {Array.isArray(searchResults) ? (
                    <div className="space-y-2">
                      {searchResults.map((result: any, index: number) => (
                        <div key={index} className="text-sm text-green-800">
                          <strong>{result.location}:</strong> Found {result.propertiesFound} properties from{" "}
                          {result.queriesExecuted} queries
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-800">
                      Found {searchResults.propertiesFound} properties from {searchResults.queriesExecuted} search
                      queries
                    </p>
                  )}
                  <p className="mt-2 text-sm text-green-700">Redirecting to home page...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Example Searches */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Example Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg border p-3">
                  <p className="font-medium text-slate-900">Texas Investment Properties</p>
                  <p className="text-sm text-slate-600">
                    Locations: Austin, TX; Dallas, TX; Houston, TX; San Antonio, TX
                  </p>
                  <p className="text-sm text-slate-600">Type: Both | Max Price: $400,000</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium text-slate-900">Florida Foreclosures</p>
                  <p className="text-sm text-slate-600">
                    Locations: Miami, FL; Tampa, FL; Orlando, FL; Jacksonville, FL
                  </p>
                  <p className="text-sm text-slate-600">Type: Single Family | Max Price: $300,000</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium text-slate-900">California Multifamily Deals</p>
                  <p className="text-sm text-slate-600">
                    Locations: Sacramento, CA; Fresno, CA; Bakersfield, CA
                  </p>
                  <p className="text-sm text-slate-600">Type: Multifamily | Max Price: $600,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

