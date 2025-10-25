import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calculator, Heart, Home, MapIcon, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map() {
  const { user, isAuthenticated } = useAuth();
  const { data: properties, isLoading } = trpc.properties.search.useQuery({});
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  // Default center (US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  // Geocode properties (simplified - using approximate coordinates based on city/state)
  const geocodedProperties = properties?.map((property) => {
    // Simplified geocoding - in production, use a real geocoding service
    const cityCoords: Record<string, [number, number]> = {
      "Austin": [30.2672, -97.7431],
      "Dallas": [32.7767, -96.7970],
      "Houston": [29.7604, -95.3698],
      "San Antonio": [29.4241, -98.4936],
      "Phoenix": [33.4484, -112.0740],
    };

    const coords = cityCoords[property.city || ""] || defaultCenter;

    return {
      ...property,
      lat: coords[0] + (Math.random() - 0.5) * 0.1, // Add small random offset
      lng: coords[1] + (Math.random() - 0.5) * 0.1,
    };
  });

  // Center map on first property if available
  useEffect(() => {
    if (geocodedProperties && geocodedProperties.length > 0) {
      const firstProp = geocodedProperties[0];
      setMapCenter([firstProp.lat, firstProp.lng]);
    }
  }, [properties]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading map...</div>
        </div>
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
            <Link href="/map">
              <a className="flex items-center gap-2 font-medium text-blue-600">
                <MapIcon className="h-4 w-4" />
                Map
              </a>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/watchlist">
                  <a className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <Heart className="h-4 w-4" />
                    Watchlist
                  </a>
                </Link>
                <Link href="/calculator">
                  <a className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <Calculator className="h-4 w-4" />
                    Calculator
                  </a>
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4" />
                {user?.name || "User"}
              </div>
            ) : (
              <Button asChild size="sm">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-80px)]">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geocodedProperties?.map((property) => (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
              eventHandlers={{
                click: () => setSelectedProperty(property.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="mb-2 font-semibold">{property.address}</h3>
                  <p className="mb-1 text-sm text-slate-600">
                    {property.city}, {property.state}
                  </p>
                  <p className="mb-2 text-lg font-bold text-green-600">
                    ${property.currentPrice?.toLocaleString()}
                  </p>
                  <div className="mb-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Est. ARV:</span>
                      <span className="font-medium">${property.estimatedARV?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Profit Potential:</span>
                      <span className="font-medium text-green-600">
                        ${((property.estimatedARV || 0) - (property.currentPrice || 0) - (property.estimatedRenovationCost || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Beds/Baths:</span>
                      <span className="font-medium">
                        {property.beds}/{property.baths}
                      </span>
                    </div>
                  </div>
                  <Link href={`/property/${property.id}`}>
                    <a>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </a>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span>Properties ({geocodedProperties?.length || 0})</span>
              </div>
              <p className="text-xs text-slate-500">Click markers to view property details</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div className="absolute right-4 top-4 z-[1000]">
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Market Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Properties:</span>
                <span className="font-semibold">{geocodedProperties?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Price:</span>
                <span className="font-semibold">
                  $
                  {geocodedProperties && geocodedProperties.length > 0
                    ? Math.round(
                        geocodedProperties.reduce((sum, p) => sum + (p.currentPrice || 0), 0) /
                          geocodedProperties.length
                      ).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Profit:</span>
                <span className="font-semibold text-green-600">
                  $
                  {geocodedProperties && geocodedProperties.length > 0
                    ? Math.round(
                        geocodedProperties.reduce((sum, p) => sum + ((p.estimatedARV || 0) - (p.currentPrice || 0) - (p.estimatedRenovationCost || 0)), 0) /
                          geocodedProperties.length
                      ).toLocaleString()
                    : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

