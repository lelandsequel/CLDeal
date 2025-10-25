import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BarChart3, Home as HomeIcon, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Analytics() {
  const [nlQuery, setNlQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: topMarkets } = trpc.analytics.topMarkets.useQuery();

  const nlSearchMutation = trpc.nlSearch.parse.useMutation({
    onSuccess: (data) => {
      toast.success(`Search interpreted: ${data.interpretation}`);
      // Navigate to home with search params
      const params = new URLSearchParams();
      if (data.propertyType) params.set("propertyType", data.propertyType);
      if (data.minPrice) params.set("minPrice", data.minPrice.toString());
      if (data.maxPrice) params.set("maxPrice", data.maxPrice.toString());
      if (data.city) params.set("city", data.city);
      if (data.state) params.set("state", data.state);
      if (data.maxPriceToARVRatio) params.set("maxPriceToARVRatio", data.maxPriceToARVRatio.toString());
      setLocation(`/?${params.toString()}`);
    },
  });

  const handleNLSearch = () => {
    if (!nlQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    nlSearchMutation.mutate({ query: nlQuery });
  };

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
        <h1 className="mb-6 text-3xl font-bold">Market Analytics</h1>

        <Tabs defaultValue="nl-search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="nl-search">Natural Language Search</TabsTrigger>
            <TabsTrigger value="markets">Top Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="nl-search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search with Natural Language
                </CardTitle>
                <CardDescription>
                  Describe what you're looking for in plain English
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder='Try: "Find single family homes in Austin under 300k at 60% ARV"'
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNLSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleNLSearch}
                    disabled={nlSearchMutation.isPending}
                  >
                    {nlSearchMutation.isPending ? "Parsing..." : "Search"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Example queries:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Properties in Phoenix under 350k with 50k profit",
                      "Single family homes at 60% ARV in Texas",
                      "Multifamily properties with high profit potential",
                      "Distressed properties on market 60+ days",
                    ].map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        onClick={() => setNlQuery(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Markets
                </CardTitle>
                <CardDescription>
                  Markets with the highest average profit potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!topMarkets || topMarkets.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">
                    No market data available yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topMarkets.map((market, index) => (
                      <div
                        key={market.location}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{market.location}</h3>
                            <p className="text-sm text-slate-600">
                              {market.propertyCount} properties
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${market.avgProfit.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600">Avg. Profit</p>
                          <p className="text-xs text-slate-500">
                            {market.roi}% ROI
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

