import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "single-family" as "single-family" | "multifamily",
    currentPrice: "",
    estimatedARV: "",
    estimatedRenovationCost: "",
    propertyCondition: "",
    daysOnMarket: "",
    sellerType: "",
    listingUrl: "",
    mlsNumber: "",
    beds: "",
    baths: "",
    squareFeet: "",
    lotSize: "",
    sellerContactInfo: "",
    dataSource: "",
    latitude: "",
    longitude: "",
  });

  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success("Property added successfully");
      // Reset form
      setFormData({
        address: "",
        city: "",
        state: "",
        zipCode: "",
        propertyType: "single-family",
        currentPrice: "",
        estimatedARV: "",
        estimatedRenovationCost: "",
        propertyCondition: "",
        daysOnMarket: "",
        sellerType: "",
        listingUrl: "",
        mlsNumber: "",
        beds: "",
        baths: "",
        squareFeet: "",
        lotSize: "",
        sellerContactInfo: "",
        dataSource: "",
        latitude: "",
        longitude: "",
      });
      // Redirect to home
      setTimeout(() => setLocation("/"), 1000);
    },
    onError: (error) => {
      toast.error(`Failed to add property: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-slate-600">Please sign in to access the admin panel</p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-slate-600">You don't have permission to access this page</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate profit potential
    const arv = parseInt(formData.estimatedARV) || 0;
    const price = parseInt(formData.currentPrice) || 0;
    const renovation = parseInt(formData.estimatedRenovationCost) || 0;
    const holdingCosts = Math.round(price * 0.02);
    const closingCosts = Math.round(price * 0.03);
    const profitPotential = arv - price - renovation - holdingCosts - closingCosts;

    // Calculate profit score (0-100)
    const profitMargin = price > 0 ? (profitPotential / price) * 100 : 0;
    const profitScore = Math.min(100, Math.max(0, Math.round(profitMargin)));

    createPropertyMutation.mutate({
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode || undefined,
      propertyType: formData.propertyType,
      currentPrice: parseInt(formData.currentPrice),
      estimatedARV: formData.estimatedARV ? parseInt(formData.estimatedARV) : undefined,
      estimatedRenovationCost: formData.estimatedRenovationCost ? parseInt(formData.estimatedRenovationCost) : undefined,
      estimatedProfitPotential: profitPotential > 0 ? profitPotential : undefined,
      propertyCondition: formData.propertyCondition || undefined,
      daysOnMarket: formData.daysOnMarket ? parseInt(formData.daysOnMarket) : undefined,
      sellerType: formData.sellerType || undefined,
      listingUrl: formData.listingUrl || undefined,
      mlsNumber: formData.mlsNumber || undefined,
      beds: formData.beds ? parseInt(formData.beds) : undefined,
      baths: formData.baths ? parseInt(formData.baths) : undefined,
      squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
      lotSize: formData.lotSize ? parseInt(formData.lotSize) : undefined,
      sellerContactInfo: formData.sellerContactInfo || undefined,
      dataSource: formData.dataSource || undefined,
      profitScore,
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Property
            </CardTitle>
            <CardDescription>Enter property details to add it to the database</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      placeholder="e.g., TX"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value: any) => setFormData({ ...formData, propertyType: value })}
                    >
                      <SelectTrigger id="propertyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="multifamily">Multifamily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Information</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">Current Price *</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      required
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedARV">Estimated ARV</Label>
                    <Input
                      id="estimatedARV"
                      type="number"
                      value={formData.estimatedARV}
                      onChange={(e) => setFormData({ ...formData, estimatedARV: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedRenovationCost">Renovation Cost</Label>
                    <Input
                      id="estimatedRenovationCost"
                      type="number"
                      value={formData.estimatedRenovationCost}
                      onChange={(e) => setFormData({ ...formData, estimatedRenovationCost: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds">Bedrooms</Label>
                    <Input
                      id="beds"
                      type="number"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baths">Bathrooms</Label>
                    <Input
                      id="baths"
                      type="number"
                      value={formData.baths}
                      onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squareFeet">Square Feet</Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      value={formData.squareFeet}
                      onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size (sqft)</Label>
                    <Input
                      id="lotSize"
                      type="number"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyCondition">Property Condition</Label>
                  <Textarea
                    id="propertyCondition"
                    rows={2}
                    value={formData.propertyCondition}
                    onChange={(e) => setFormData({ ...formData, propertyCondition: e.target.value })}
                  />
                </div>
              </div>

              {/* Listing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Listing Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="daysOnMarket">Days on Market</Label>
                    <Input
                      id="daysOnMarket"
                      type="number"
                      value={formData.daysOnMarket}
                      onChange={(e) => setFormData({ ...formData, daysOnMarket: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerType">Seller Type</Label>
                    <Input
                      id="sellerType"
                      placeholder="e.g., Bank-owned, Foreclosure"
                      value={formData.sellerType}
                      onChange={(e) => setFormData({ ...formData, sellerType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mlsNumber">MLS Number</Label>
                    <Input
                      id="mlsNumber"
                      value={formData.mlsNumber}
                      onChange={(e) => setFormData({ ...formData, mlsNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataSource">Data Source</Label>
                    <Input
                      id="dataSource"
                      placeholder="e.g., MLS, Zillow"
                      value={formData.dataSource}
                      onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="listingUrl">Listing URL</Label>
                    <Input
                      id="listingUrl"
                      type="url"
                      value={formData.listingUrl}
                      onChange={(e) => setFormData({ ...formData, listingUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sellerContactInfo">Seller Contact Info</Label>
                    <Textarea
                      id="sellerContactInfo"
                      rows={2}
                      value={formData.sellerContactInfo}
                      onChange={(e) => setFormData({ ...formData, sellerContactInfo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Coordinates (Optional)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createPropertyMutation.isPending} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {createPropertyMutation.isPending ? "Adding..." : "Add Property"}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

