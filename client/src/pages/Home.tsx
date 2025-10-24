import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, DollarSign, Heart, Search, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useState({
    propertyType: "all" as "all" | "single-family" | "multifamily",
    minPrice: "",
    maxPrice: "",
    minARV: "",
    maxARV: "",
    minProfit: "",
    city: "",
    state: "",
    minDaysOnMarket: "",
  });

  const { data: properties, isLoading, refetch } = trpc.properties.search.useQuery(
    {
      propertyType: searchParams.propertyType === "all" ? undefined : (searchParams.propertyType as "single-family" | "multifamily"),
      minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
      minARV: searchParams.minARV ? parseInt(searchParams.minARV) : undefined,
      maxARV: searchParams.maxARV ? parseInt(searchParams.maxARV) : undefined,
      minProfit: searchParams.minProfit ? parseInt(searchParams.minProfit) : undefined,
      city: searchParams.city || undefined,
      state: searchParams.state || undefined,
      minDaysOnMarket: searchParams.minDaysOnMarket ? parseInt(searchParams.minDaysOnMarket) : undefined,
    },
    { enabled: true }
  );

  const { data: recentProperties } = trpc.properties.getRecent.useQuery({ limit: 20 });

  const handleSearch = () => {
    refetch();
  };

  const displayProperties = properties || recentProperties || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/watchlist">
                  <Button variant="ghost" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Watchlist
                  </Button>
                </Link>
                <Link href="/alerts">
                  <Button variant="ghost" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Alerts
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-slate-600">Hi, {user?.name}</span>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold">Find Your Next Investment Property</h2>
          <p className="mb-8 text-xl text-blue-100">
            Discover distressed properties with high profit potential across the nation
          </p>
          <Link href="/agentic-search">
            <Button size="lg" variant="secondary" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Run AI Property Search
            </Button>
          </Link>
        </div>
      </section>

      {/* Search Filters */}
      <section className="container mx-auto -mt-8 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Properties
            </CardTitle>
            <CardDescription>Filter properties by your investment criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={searchParams.propertyType}
                  onValueChange={(value) => setSearchParams({ ...searchParams, propertyType: value as "all" | "single-family" | "multifamily" })}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single-family">Single Family</SelectItem>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="$0"
                  value={searchParams.minPrice}
                  onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="$1,000,000"
                  value={searchParams.maxPrice}
                  onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minARV">Min ARV</Label>
                <Input
                  id="minARV"
                  type="number"
                  placeholder="$0"
                  value={searchParams.minARV}
                  onChange={(e) => setSearchParams({ ...searchParams, minARV: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxARV">Max ARV</Label>
                <Input
                  id="maxARV"
                  type="number"
                  placeholder="$2,000,000"
                  value={searchParams.maxARV}
                  onChange={(e) => setSearchParams({ ...searchParams, maxARV: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minProfit">Min Profit</Label>
                <Input
                  id="minProfit"
                  type="number"
                  placeholder="$50,000"
                  value={searchParams.minProfit}
                  onChange={(e) => setSearchParams({ ...searchParams, minProfit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Austin"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g., TX"
                  value={searchParams.state}
                  onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDaysOnMarket">Min Days on Market</Label>
                <Input
                  id="minDaysOnMarket"
                  type="number"
                  placeholder="60"
                  value={searchParams.minDaysOnMarket}
                  onChange={(e) => setSearchParams({ ...searchParams, minDaysOnMarket: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Filter Buttons */}
      <section className="container mx-auto mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSearchParams({ ...searchParams, minDaysOnMarket: "60" });
              setTimeout(handleSearch, 100);
            }}
          >
            60+ Days on Market
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchParams({ ...searchParams, minProfit: "50000" });
              setTimeout(handleSearch, 100);
            }}
          >
            High Profit Potential
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchParams({ ...searchParams, propertyType: "single-family" });
              setTimeout(handleSearch, 100);
            }}
          >
            Single Family Only
          </Button>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto pb-16">
        <h3 className="mb-6 text-2xl font-bold text-slate-900">
          {properties ? `Search Results (${displayProperties.length})` : "Recent Properties"}
        </h3>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading properties...</p>
          </div>
        ) : displayProperties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No properties found. Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayProperties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="text-lg">{property.address}</span>
                      {property.daysOnMarket && property.daysOnMarket >= 60 && (
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                          {property.daysOnMarket}d
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {property.city}, {property.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current Price</span>
                        <span className="font-semibold">${property.currentPrice.toLocaleString()}</span>
                      </div>
                      {property.estimatedARV && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Est. ARV</span>
                          <span className="font-semibold">${property.estimatedARV.toLocaleString()}</span>
                        </div>
                      )}
                      {property.estimatedProfitPotential && (
                        <div className="flex items-center justify-between rounded-md bg-green-50 p-2">
                          <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                            <DollarSign className="h-4 w-4" />
                            Profit Potential
                          </span>
                          <span className="font-bold text-green-700">
                            ${property.estimatedProfitPotential.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {property.beds && property.baths && (
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>
                            {property.beds} bed • {property.baths} bath
                          </span>
                          {property.squareFeet && <span>{property.squareFeet.toLocaleString()} sqft</span>}
                        </div>
                      )}
                      {property.propertyCondition && (
                        <div className="text-sm">
                          <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
                            {property.propertyCondition}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

