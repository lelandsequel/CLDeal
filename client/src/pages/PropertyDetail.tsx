import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  DollarSign,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquare,
  Ruler,
  Send,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showCMA, setShowCMA] = useState(false);
  const [cmaReport, setCmaReport] = useState<string | null>(null);

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

  const generateCMAMutation = trpc.cma.generate.useMutation({
    onSuccess: (data) => {
      setCmaReport(data.cmaReport);
      setShowCMA(true);
      toast.success("CMA report generated");
    },
    onError: () => {
      toast.error("Failed to generate CMA");
    },
  });

  const handleGenerateCMA = () => {
    generateCMAMutation.mutate({ propertyId });
  };

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Profit Calculator
                    </CardTitle>
                    <CardDescription>Estimated investment breakdown</CardDescription>
                  </div>
                  <Button
                    onClick={handleGenerateCMA}
                    disabled={generateCMAMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {generateCMAMutation.isPending ? "Generating..." : "Generate CMA"}
                  </Button>
                </div>
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

            {/* Acquisition Actions */}
            <AcquisitionActionsCard propertyId={propertyId} property={property} />
          </div>
        </div>

        {/* CMA Report Section */}
        {showCMA && cmaReport && (
          <div className="container mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparative Market Analysis
                </CardTitle>
                <CardDescription>AI-generated market analysis and valuation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{cmaReport}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Property Notes Section */}
        {isAuthenticated && <PropertyNotesSection propertyId={propertyId} />}
      </div>
    </div>
  );
}

// Property Notes Component
function PropertyNotesSection({ propertyId }: { propertyId: number }) {
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<"general" | "inspection" | "contractor" | "financing" | "offer">("general");
  
  const { data: notes, refetch } = trpc.propertyNotes.getByProperty.useQuery({ propertyId });
  
  const createNoteMutation = trpc.propertyNotes.create.useMutation({
    onSuccess: () => {
      toast.success("Note added successfully");
      setNoteText("");
      refetch();
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });
  
  const deleteNoteMutation = trpc.propertyNotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Note deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });
  
  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }
    
    createNoteMutation.mutate({
      propertyId,
      noteText: noteText.trim(),
      noteType,
      isPrivate: 1,
    });
  };
  
  const handleDeleteNote = (noteId: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate({ noteId });
    }
  };
  
  const noteTypeColors = {
    general: "bg-slate-100 text-slate-700",
    inspection: "bg-blue-100 text-blue-700",
    contractor: "bg-orange-100 text-orange-700",
    financing: "bg-green-100 text-green-700",
    offer: "bg-purple-100 text-purple-700",
  };
  
  return (
    <div className="container mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Property Notes
          </CardTitle>
          <CardDescription>Add private notes, track inspections, and document your analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add Note Form */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="inspection">Inspection</option>
                <option value="contractor">Contractor</option>
                <option value="financing">Financing</option>
                <option value="offer">Offer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this property..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <Button onClick={handleAddNote} disabled={createNoteMutation.isPending} size="sm">
              <Send className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
          
          {/* Notes List */}
          <div className="space-y-3">
            {notes && notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="rounded-lg border bg-slate-50 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${noteTypeColors[note.noteType]}`}>
                      {note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-700">{note.noteText}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500">No notes yet. Add your first note above!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



// Acquisition Actions Component
function AcquisitionActionsCard({ propertyId, property }: { propertyId: number; property: any }) {
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showCMAFormatDialog, setShowCMAFormatDialog] = useState(false);
  const [showAnalysisFormatDialog, setShowAnalysisFormatDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState(Math.round(property.currentPrice * 0.9).toString());
  const [buyerName, setBuyerName] = useState("");
  const [motivatedScore, setMotivatedScore] = useState<number | null>(null);
  const [showMotivation, setShowMotivation] = useState(false);

  const downloadFile = (content: string, filename: string, format: string) => {
    const mimeTypes: Record<string, string> = {
      html: 'text/html',
      pdf: 'text/html', // HTML that can be printed to PDF
      md: 'text/markdown',
      txt: 'text/plain'
    };
    const extensions: Record<string, string> = {
      html: '.html',
      pdf: '.html',
      md: '.md',
      txt: '.txt'
    };
    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + extensions[format];
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCMAPDFMutation = trpc.acquisition.generateCMAPDF.useMutation({
    onSuccess: (data) => {
      const filename = `CMA-${property.address.replace(/\s+/g, '-')}`;
      downloadFile(data.content, filename, data.format);
      toast.success(`CMA Report downloaded as ${data.format.toUpperCase()}`);
      setShowCMAFormatDialog(false);
    },
    onError: () => {
      toast.error("Failed to generate CMA report");
    },
  });

  const generateAnalysisPDFMutation = trpc.acquisition.generateAnalysisPDF.useMutation({
    onSuccess: (data) => {
      const filename = `Analysis-${property.address.replace(/\s+/g, '-')}`;
      downloadFile(data.content, filename, data.format);
      setMotivatedScore(data.motivationScore);
      toast.success(`Property Analysis downloaded as ${data.format.toUpperCase()}`);
      setShowAnalysisFormatDialog(false);
    },
    onError: () => {
      toast.error("Failed to generate analysis");
    },
  });

  const generateOfferLetterMutation = trpc.acquisition.generateOfferLetter.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.offerLetter], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offer-Letter-${property.address.replace(/\s+/g, '-')}.txt`;
      a.click();
      toast.success("Offer letter generated");
      setShowOfferDialog(false);
    },
    onError: () => {
      toast.error("Failed to generate offer letter");
    },
  });

  const calculateMotivationMutation = trpc.acquisition.calculateMotivatedScore.useMutation({
    onSuccess: (data) => {
      setMotivatedScore(data.score);
      setShowMotivation(true);
      toast.success("Seller motivation analyzed");
    },
    onError: () => {
      toast.error("Failed to analyze seller motivation");
    },
  });

  const handleGenerateOffer = () => {
    if (!buyerName || !offerPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    generateOfferLetterMutation.mutate({
      propertyId,
      offerPrice: parseInt(offerPrice),
      buyerName,
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">Acquisition Tools</CardTitle>
        <CardDescription className="text-blue-700">
          Streamline your deal-making process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => setShowCMAFormatDialog(true)}
          disabled={generateCMAPDFMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {generateCMAPDFMutation.isPending ? "Generating..." : "Download CMA Report"}
        </Button>

        <Button
          onClick={() => setShowAnalysisFormatDialog(true)}
          disabled={generateAnalysisPDFMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {generateAnalysisPDFMutation.isPending ? "Generating..." : "Download Deal Analysis"}
        </Button>

        <Button
          onClick={() => setShowOfferDialog(true)}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Send className="h-4 w-4" />
          Generate Offer Letter
        </Button>

        <Button
          onClick={() => calculateMotivationMutation.mutate({ propertyId })}
          disabled={calculateMotivationMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {calculateMotivationMutation.isPending ? "Analyzing..." : "Analyze Seller Motivation"}
        </Button>

        {showMotivation && motivatedScore !== null && (
          <div className={`mt-4 rounded-lg p-4 ${
            motivatedScore >= 70 ? 'bg-green-100 border border-green-300' :
            motivatedScore >= 50 ? 'bg-yellow-100 border border-yellow-300' :
            'bg-slate-100 border border-slate-300'
          }`}>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Seller Motivation Score</p>
              <p className={`text-4xl font-bold ${
                motivatedScore >= 70 ? 'text-green-700' :
                motivatedScore >= 50 ? 'text-yellow-700' :
                'text-slate-700'
              }`}>
                {motivatedScore}/100
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {motivatedScore >= 70 ? 'Highly motivated - Strong negotiation opportunity' :
                 motivatedScore >= 50 ? 'Moderately motivated - Room for negotiation' :
                 'Standard motivation - Market-rate offer recommended'}
              </p>
            </div>
          </div>
        )}

        {showOfferDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Generate Offer Letter</CardTitle>
                <CardDescription>AI will create a professional offer letter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Offer Price *</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="250000"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateOffer}
                    disabled={generateOfferLetterMutation.isPending}
                    className="flex-1"
                  >
                    {generateOfferLetterMutation.isPending ? "Generating..." : "Generate Letter"}
                  </Button>
                  <Button
                    onClick={() => setShowOfferDialog(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CMA Format Selection Dialog */}
        {showCMAFormatDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Select Download Format</CardTitle>
                <CardDescription>Choose the format for your CMA report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => generateCMAPDFMutation.mutate({ propertyId, format: 'html' })}
                  disabled={generateCMAPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.HTML</span>
                  HTML - View in browser or print to PDF
                </Button>
                <Button
                  onClick={() => generateCMAPDFMutation.mutate({ propertyId, format: 'pdf' })}
                  disabled={generateCMAPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.PDF</span>
                  PDF-ready HTML - Open and print to PDF
                </Button>
                <Button
                  onClick={() => generateCMAPDFMutation.mutate({ propertyId, format: 'md' })}
                  disabled={generateCMAPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.MD</span>
                  Markdown - Plain text with formatting
                </Button>
                <Button
                  onClick={() => generateCMAPDFMutation.mutate({ propertyId, format: 'txt' })}
                  disabled={generateCMAPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.TXT</span>
                  Plain Text - No formatting
                </Button>
                <Button
                  onClick={() => setShowCMAFormatDialog(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Format Selection Dialog */}
        {showAnalysisFormatDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Select Download Format</CardTitle>
                <CardDescription>Choose the format for your property analysis report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => generateAnalysisPDFMutation.mutate({ propertyId, format: 'html' })}
                  disabled={generateAnalysisPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.HTML</span>
                  HTML - View in browser or print to PDF
                </Button>
                <Button
                  onClick={() => generateAnalysisPDFMutation.mutate({ propertyId, format: 'pdf' })}
                  disabled={generateAnalysisPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.PDF</span>
                  PDF-ready HTML - Open and print to PDF
                </Button>
                <Button
                  onClick={() => generateAnalysisPDFMutation.mutate({ propertyId, format: 'md' })}
                  disabled={generateAnalysisPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.MD</span>
                  Markdown - Plain text with formatting
                </Button>
                <Button
                  onClick={() => generateAnalysisPDFMutation.mutate({ propertyId, format: 'txt' })}
                  disabled={generateAnalysisPDFMutation.isPending}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="font-mono text-xs mr-2">.TXT</span>
                  Plain Text - No formatting
                </Button>
                <Button
                  onClick={() => setShowAnalysisFormatDialog(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

