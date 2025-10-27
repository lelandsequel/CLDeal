import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ImportCSV() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const importMutation = trpc.properties.importCSV.useMutation({
    onSuccess: (data) => {
      setResults(data);
      toast.success(`Imported ${data.success} properties successfully!`);
      setImporting(false);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      setImporting(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      importMutation.mutate({ csvData: text });
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
      setImporting(false);
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `address,city,state,zipCode,propertyType,currentPrice,estimatedARV,estimatedRenovationCost,beds,baths,squareFeet,lotSize,propertyCondition,daysOnMarket,listingUrl,sellerContactInfo,latitude,longitude
"123 Main St","Austin","TX","78701","single-family",250000,350000,52000,3,2,1800,5000,"Needs cosmetic updates",75,"https://example.com/listing","John Doe - (555) 123-4567","30.2672","-97.7431"
"456 Oak Ave","Houston","TX","77001","multifamily",180000,280000,52000,4,2,2100,4500,"Fixer-upper",65,"https://example.com/listing2","Jane Smith - (555) 987-6543","29.7604","-95.3698"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Import Properties from CSV</h1>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
            <CardDescription>
              Upload a CSV file with property data. Download the template below to see the required format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required columns:</strong> address, city, state, propertyType, currentPrice
                  <br />
                  <strong>Optional columns:</strong> zipCode, estimatedARV, estimatedRenovationCost, beds, baths, squareFeet, lotSize, propertyCondition, daysOnMarket, listingUrl, sellerContactInfo, latitude, longitude
                  <br />
                  <strong>Property Type:</strong> Must be either "single-family" or "multifamily"
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file from your computer to import properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Button 
                  onClick={handleImport} 
                  disabled={!file || importing}
                  className="min-w-[120px]"
                >
                  {importing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>

              {file && (
                <p className="text-sm text-gray-600">
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}

              {results && (
                <Alert className={results.failed === 0 ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
                  {results.failed === 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Import Complete!</strong>
                      </p>
                      <p>
                        ✓ Successfully imported: <strong>{results.success}</strong> properties
                        {results.failed > 0 && (
                          <>
                            <br />
                            ✗ Failed: <strong>{results.failed}</strong> properties
                          </>
                        )}
                      </p>
                      {results.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Errors:</p>
                          <ul className="list-disc list-inside text-sm">
                            {results.errors.slice(0, 5).map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                            {results.errors.length > 5 && (
                              <li>... and {results.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

