import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  ExternalLink,
  Heart,
  MapPin,
  Ruler,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const propertyId = parseInt(id || "0");
  const { data: property, isLoading } = trpc.properties.getById.useQuery({ id: propertyId });
  const { data: inWatchlist } = trpc.watchlist.isInWatchlist.useQuery(
    { propertyId },
    { enabled: isAuthenticated }
  );

  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: () => {
      setIsInWatchlist(true);
      toast.success("Property added to watchlist");
    },
    onError: () => {
      toast.error("Failed to add to watchlist");
    },
  });

  useEffect(() => {
    if (inWatchlist !== undefined) {
      setIsInWatchlist(inWatchlist);
    }
  }, [inWatchlist]);

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToWatchlistMutation.mutate({ propertyId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <p className="text-center text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-slate-600">Property not found</p>
              <Link href="/">
                <Button className="mt-4">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profitCalculation = {
    arv: property.estimatedARV || 0,
    purchasePrice: property.currentPrice,
    renovationCost: property.estimatedRenovationCost || 0,
    holdingCosts: Math.round(property.currentPrice * 0.02), // Estimate 2% of purchase price
    closingCosts: Math.round(property.currentPrice * 0.03), // Estimate 3% of purchase price
  };

  const totalCosts =
    profitCalculation.purchasePrice +
    profitCalculation.renovationCost +
    profitCalculation.holdingCosts +
    profitCalculation.closingCosts;
  const estimatedProfit = profitCalculation.arv - totalCosts;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.address}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {property.city}, {property.state} {property.zipCode}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAddToWatchlist}
                    disabled={isInWatchlist || addToWatchlistMutation.isPending}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`} />
                    {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Property Type</span>
                      <span className="font-medium capitalize">{property.propertyType}</span>
                    </div>
                    {property.mlsNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">MLS #</span>
                        <span className="font-medium">{property.mlsNumber}</span>
                      </div>
                    )}
                    {property.beds && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Bedrooms</span>
                        <span className="font-medium">{property.beds}</span>
                      </div>
                    )}
                    {property.baths && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Bathrooms</span>
                        <span className="font-medium">{property.baths}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {property.squareFeet && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Square Feet</span>
                        <span className="font-medium">{property.squareFeet.toLocaleString()}</span>
                      </div>
                    )}
                    {property.lotSize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Lot Size</span>
                        <span className="font-medium">{property.lotSize.toLocaleString()} sqft</span>
                      </div>
                    )}
                    {property.daysOnMarket && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Days on Market</span>
                        <span className="font-medium">{property.daysOnMarket}</span>
                      </div>
                    )}
                    {property.sellerType && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Seller Type</span>
                        <span className="font-medium">{property.sellerType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit Calculator
                </CardTitle>
                <CardDescription>Estimated investment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">After Repair Value (ARV)</span>
                    <span className="font-semibold">${profitCalculation.arv.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Purchase Price</span>
                    <span className="text-red-600">-${profitCalculation.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Renovation Costs</span>
                    <span className="text-red-600">-${profitCalculation.renovationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Holding Costs (est.)</span>
                    <span className="text-red-600">-${profitCalculation.holdingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Closing Costs (est.)</span>
                    <span className="text-red-600">-${profitCalculation.closingCosts.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Estimated Profit</span>
                      <span className={`text-lg font-bold ${estimatedProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                        ${estimatedProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Condition */}
            {property.propertyCondition && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Condition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{property.propertyCondition}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${property.currentPrice.toLocaleString()}</p>
                {property.estimatedARV && (
                  <div className="mt-4 rounded-lg bg-green-50 p-3">
                    <p className="text-sm text-green-700">Est. ARV</p>
                    <p className="text-xl font-semibold text-green-800">${property.estimatedARV.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing Link */}
            {property.listingUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>View Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full gap-2">
                    <a href={property.listingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Listing
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Seller Contact */}
            {property.sellerContactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{property.sellerContactInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Data Source */}
            {property.dataSource && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{property.dataSource}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

