import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calculator, DollarSign, Home, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";

export default function FinancialCalculator() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const propertyId = params.id ? parseInt(params.id) : undefined;

  // Rental Calculator State
  const [rentalInputs, setRentalInputs] = useState({
    purchasePrice: 250000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTermYears: 30,
    closingCosts: 7500,
    monthlyRent: 2000,
    vacancyRate: 5,
    propertyManagementPercent: 10,
    monthlyInsurance: 150,
    monthlyPropertyTax: 300,
    monthlyHOA: 0,
    monthlyMaintenance: 200,
  });

  // Flip Calculator State
  const [flipInputs, setFlipInputs] = useState({
    purchasePrice: 250000,
    downPaymentPercent: 20,
    interestRate: 8,
    closingCosts: 7500,
    renovationCost: 50000,
    holdingMonths: 6,
    afterRepairValue: 350000,
    sellingCostsPercent: 6,
  });

  // BRRRR Calculator State
  const [brrrrInputs, setBrrrrInputs] = useState({
    purchasePrice: 200000,
    downPaymentPercent: 20,
    interestRate: 7,
    loanTermYears: 30,
    closingCosts: 6000,
    renovationCost: 40000,
    afterRepairValue: 300000,
    refinanceLTV: 75,
    refinanceRate: 6.5,
    monthlyRent: 2200,
    vacancyRate: 5,
    propertyManagementPercent: 10,
    monthlyInsurance: 150,
    monthlyPropertyTax: 250,
    monthlyHOA: 0,
    monthlyMaintenance: 200,
  });

  const rentalMutation = trpc.financialCalculator.calculateRental.useMutation();
  const flipMutation = trpc.financialCalculator.calculateFlip.useMutation();
  const brrrrMutation = trpc.financialCalculator.calculateBRRRR.useMutation();

  const rentalResults = rentalMutation.data;
  const flipResults = flipMutation.data;
  const brrrrResults = brrrrMutation.data;

  const calculateRental = () => {
    rentalMutation.mutate(rentalInputs);
  };

  const calculateFlip = () => {
    flipMutation.mutate(flipInputs);
  };

  const calculateBRRRR = () => {
    brrrrMutation.mutate(brrrrInputs);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container">
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-4 text-slate-600">Please sign in to use the financial calculator</p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Financial Calculator</h1>
          <p className="text-slate-600">
            Analyze different investment strategies to maximize your ROI
          </p>
        </div>

        <Tabs defaultValue="rental" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rental">
              <Home className="mr-2 h-4 w-4" />
              Rental
            </TabsTrigger>
            <TabsTrigger value="flip">
              <TrendingUp className="mr-2 h-4 w-4" />
              Flip
            </TabsTrigger>
            <TabsTrigger value="brrrr">
              <DollarSign className="mr-2 h-4 w-4" />
              BRRRR
            </TabsTrigger>
          </TabsList>

          {/* Rental Calculator */}
          <TabsContent value="rental">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Details</CardTitle>
                  <CardDescription>Enter property purchase information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        value={rentalInputs.purchasePrice}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, purchasePrice: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Down Payment %</Label>
                      <Input
                        type="number"
                        value={rentalInputs.downPaymentPercent}
                        onChange={(e) =>
                          setRentalInputs({
                            ...rentalInputs,
                            downPaymentPercent: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interest Rate %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rentalInputs.interestRate}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, interestRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Term (years)</Label>
                      <Input
                        type="number"
                        value={rentalInputs.loanTermYears}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, loanTermYears: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Closing Costs</Label>
                    <Input
                      type="number"
                      value={rentalInputs.closingCosts}
                      onChange={(e) =>
                        setRentalInputs({ ...rentalInputs, closingCosts: Number(e.target.value) })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rental Income & Expenses</CardTitle>
                  <CardDescription>Monthly income and operating expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <Input
                        type="number"
                        value={rentalInputs.monthlyRent}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, monthlyRent: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vacancy Rate %</Label>
                      <Input
                        type="number"
                        value={rentalInputs.vacancyRate}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, vacancyRate: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Mgmt %</Label>
                      <Input
                        type="number"
                        value={rentalInputs.propertyManagementPercent}
                        onChange={(e) =>
                          setRentalInputs({
                            ...rentalInputs,
                            propertyManagementPercent: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Insurance</Label>
                      <Input
                        type="number"
                        value={rentalInputs.monthlyInsurance}
                        onChange={(e) =>
                          setRentalInputs({
                            ...rentalInputs,
                            monthlyInsurance: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Property Tax</Label>
                      <Input
                        type="number"
                        value={rentalInputs.monthlyPropertyTax}
                        onChange={(e) =>
                          setRentalInputs({
                            ...rentalInputs,
                            monthlyPropertyTax: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly HOA</Label>
                      <Input
                        type="number"
                        value={rentalInputs.monthlyHOA}
                        onChange={(e) =>
                          setRentalInputs({ ...rentalInputs, monthlyHOA: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Monthly Maintenance</Label>
                    <Input
                      type="number"
                      value={rentalInputs.monthlyMaintenance}
                      onChange={(e) =>
                        setRentalInputs({
                          ...rentalInputs,
                          monthlyMaintenance: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <Button onClick={calculateRental} className="w-full" size="lg">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate ROI
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {rentalMutation.data && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Rental Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="rounded-lg border bg-green-50 p-4">
                        <div className="text-sm text-green-700">Monthly Cash Flow</div>
                        <div className="text-2xl font-bold text-green-900">
                          ${rentalMutation.data.monthlyCashFlow.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-blue-50 p-4">
                        <div className="text-sm text-blue-700">Cash-on-Cash Return</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {rentalMutation.data.cashOnCashReturn.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-4">
                        <div className="text-sm text-purple-700">Cap Rate</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {rentalMutation.data.capRate.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h4 className="font-semibold">Investment Summary</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Cash Needed:</span>
                          <span className="font-medium">
                            ${rentalMutation.data.totalCashNeeded.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Mortgage:</span>
                          <span className="font-medium">
                            ${rentalMutation.data.monthlyMortgagePayment.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Expenses:</span>
                          <span className="font-medium">
                            ${rentalMutation.data.monthlyExpenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-slate-600">Annual Cash Flow:</span>
                          <span className="font-bold text-green-700">
                            ${rentalMutation.data.annualCashFlow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Flip Calculator - Similar structure */}
          <TabsContent value="flip">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase & Financing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        value={flipInputs.purchasePrice}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, purchasePrice: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Down Payment %</Label>
                      <Input
                        type="number"
                        value={flipInputs.downPaymentPercent}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, downPaymentPercent: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interest Rate %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={flipInputs.interestRate}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, interestRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Closing Costs</Label>
                      <Input
                        type="number"
                        value={flipInputs.closingCosts}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, closingCosts: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Renovation & Sale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Renovation Cost</Label>
                      <Input
                        type="number"
                        value={flipInputs.renovationCost}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, renovationCost: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Holding Months</Label>
                      <Input
                        type="number"
                        value={flipInputs.holdingMonths}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, holdingMonths: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>After Repair Value</Label>
                      <Input
                        type="number"
                        value={flipInputs.afterRepairValue}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, afterRepairValue: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Selling Costs %</Label>
                      <Input
                        type="number"
                        value={flipInputs.sellingCostsPercent}
                        onChange={(e) =>
                          setFlipInputs({ ...flipInputs, sellingCostsPercent: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={calculateFlip} className="w-full" size="lg">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Profit
                  </Button>
                </CardContent>
              </Card>

              {/* Flip Results */}
              {flipMutation.data && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Flip Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="rounded-lg border bg-green-50 p-4">
                        <div className="text-sm text-green-700">Net Profit</div>
                        <div className="text-2xl font-bold text-green-900">
                          ${flipMutation.data.netProfit.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-blue-50 p-4">
                        <div className="text-sm text-blue-700">ROI</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {flipMutation.data.roi.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-4">
                        <div className="text-sm text-purple-700">Total Investment</div>
                        <div className="text-2xl font-bold text-purple-900">
                          ${flipMutation.data.totalInvestment.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h4 className="font-semibold">Cost Breakdown</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Purchase Price:</span>
                          <span className="font-medium">
                            ${flipMutation.data.purchasePrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Renovation:</span>
                          <span className="font-medium">
                            ${flipMutation.data.renovationCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Holding Costs:</span>
                          <span className="font-medium">
                            ${flipMutation.data.holdingCosts.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Selling Costs:</span>
                          <span className="font-medium">
                            ${flipMutation.data.sellingCosts.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-slate-600">After Repair Value:</span>
                          <span className="font-bold text-green-700">
                            ${flipMutation.data.afterRepairValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* BRRRR Calculator */}
          <TabsContent value="brrrr">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase & Renovation</CardTitle>
                  <CardDescription>Initial investment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.purchasePrice}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, purchasePrice: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Down Payment %</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.downPaymentPercent}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, downPaymentPercent: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Renovation Cost</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.renovationCost}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, renovationCost: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Closing Costs</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.closingCosts}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, closingCosts: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>After Repair Value</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.afterRepairValue}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, afterRepairValue: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Refinance LTV %</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.refinanceLTV}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, refinanceLTV: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rental Income</CardTitle>
                  <CardDescription>Post-renovation rental details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.monthlyRent}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, monthlyRent: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vacancy Rate %</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.vacancyRate}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, vacancyRate: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Refinance Rate %</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.refinanceRate}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, refinanceRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Term (years)</Label>
                      <Input
                        type="number"
                        value={brrrrInputs.loanTermYears}
                        onChange={(e) =>
                          setBrrrrInputs({ ...brrrrInputs, loanTermYears: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={calculateBRRRR} className="w-full" size="lg">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Calculate BRRRR ROI
                  </Button>
                </CardContent>
              </Card>
            </div>

            {brrrrResults && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>BRRRR Analysis Results</CardTitle>
                  <CardDescription>Buy, Rehab, Rent, Refinance, Repeat strategy metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-600">Total Initial Investment</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${brrrrResults.totalInitialInvestment.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-slate-600">Cash Left In Deal</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${brrrrResults.cashLeftInDeal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-slate-600">Monthly Cash Flow</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${brrrrResults.monthlyCashFlow.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-slate-600">Cash-on-Cash Return</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {brrrrResults.cashOnCashReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold mb-2">BRRRR Strategy Breakdown:</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• Initial Down Payment: ${brrrrResults.downPayment.toLocaleString()}</li>
                      <li>• Renovation Cost: ${brrrrInputs.renovationCost.toLocaleString()}</li>
                      <li>• Closing Costs: ${brrrrInputs.closingCosts.toLocaleString()}</li>
                      <li>• Refinance Amount: ${brrrrResults.refinanceAmount.toLocaleString()}</li>
                      <li>• Cash Out Refinance: ${brrrrResults.cashOutRefinance.toLocaleString()}</li>
                      <li>• Annual Cash Flow: ${brrrrResults.annualCashFlow.toLocaleString()}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

