/**
 * Financial Calculator Service
 * 
 * Provides ROI calculations for different real estate investment strategies:
 * - Rental (buy and hold for cash flow)
 * - Flip (buy, renovate, sell)
 * - BRRRR (Buy, Rehab, Rent, Refinance, Repeat)
 */

export interface RentalCalculatorInput {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number; // as percentage (e.g., 6.5)
  loanTermYears: number;
  closingCosts: number;
  
  monthlyRent: number;
  vacancyRate: number; // as percentage (e.g., 5)
  propertyManagementPercent: number; // as percentage (e.g., 10)
  monthlyInsurance: number;
  monthlyPropertyTax: number;
  monthlyHOA: number;
  monthlyMaintenance: number;
}

export interface FlipCalculatorInput {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  closingCosts: number;
  
  renovationCost: number;
  holdingMonths: number;
  afterRepairValue: number;
  sellingCostsPercent: number; // as percentage (e.g., 6)
}

export interface BRRRRCalculatorInput {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  closingCosts: number;
  
  renovationCost: number;
  afterRepairValue: number;
  refinanceLTV: number; // as percentage (e.g., 75)
  refinanceRate: number; // as percentage
  
  monthlyRent: number;
  vacancyRate: number;
  propertyManagementPercent: number;
  monthlyInsurance: number;
  monthlyPropertyTax: number;
  monthlyHOA: number;
  monthlyMaintenance: number;
}

export interface RentalCalculatorResult {
  // Purchase details
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  totalCashNeeded: number;
  
  // Monthly breakdown
  monthlyMortgagePayment: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  
  // Annual metrics
  annualCashFlow: number;
  annualROI: number; // as percentage
  cashOnCashReturn: number; // as percentage
  capRate: number; // as percentage
  
  // Detailed expenses
  expenses: {
    mortgage: number;
    insurance: number;
    propertyTax: number;
    hoa: number;
    maintenance: number;
    vacancy: number;
    propertyManagement: number;
    total: number;
  };
}

export interface FlipCalculatorResult {
  // Purchase details
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  renovationCost: number;
  totalInvestment: number;
  
  // Costs
  holdingCosts: number;
  interestCosts: number;
  sellingCosts: number;
  totalCosts: number;
  
  // Profit
  afterRepairValue: number;
  grossProfit: number;
  netProfit: number;
  roi: number; // as percentage
}

export interface BRRRRCalculatorResult {
  // Initial purchase
  purchasePrice: number;
  downPayment: number;
  renovationCost: number;
  totalInitialInvestment: number;
  
  // After refinance
  afterRepairValue: number;
  refinanceAmount: number;
  cashOutRefinance: number;
  cashLeftInDeal: number;
  
  // Cash flow
  monthlyMortgagePayment: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  
  // Returns
  infiniteReturn: boolean; // true if all cash recovered
  cashOnCashReturn: number; // as percentage (Infinity if all cash recovered)
  totalEquity: number;
}

/**
 * Calculate monthly mortgage payment using amortization formula
 */
function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (annualRate === 0) return principal / (years * 12);
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment);
}

/**
 * Calculate rental property ROI and cash flow
 */
export function calculateRental(input: RentalCalculatorInput): RentalCalculatorResult {
  const downPayment = Math.round(input.purchasePrice * (input.downPaymentPercent / 100));
  const loanAmount = input.purchasePrice - downPayment;
  const totalCashNeeded = downPayment + input.closingCosts;
  
  const monthlyMortgagePayment = calculateMortgagePayment(
    loanAmount,
    input.interestRate,
    input.loanTermYears
  );
  
  const monthlyVacancy = Math.round(input.monthlyRent * (input.vacancyRate / 100));
  const monthlyPropertyManagement = Math.round(
    input.monthlyRent * (input.propertyManagementPercent / 100)
  );
  
  const expenses = {
    mortgage: monthlyMortgagePayment,
    insurance: input.monthlyInsurance,
    propertyTax: input.monthlyPropertyTax,
    hoa: input.monthlyHOA,
    maintenance: input.monthlyMaintenance,
    vacancy: monthlyVacancy,
    propertyManagement: monthlyPropertyManagement,
    total: 0,
  };
  
  expenses.total =
    expenses.mortgage +
    expenses.insurance +
    expenses.propertyTax +
    expenses.hoa +
    expenses.maintenance +
    expenses.vacancy +
    expenses.propertyManagement;
  
  const monthlyCashFlow = input.monthlyRent - expenses.total;
  const annualCashFlow = monthlyCashFlow * 12;
  
  const cashOnCashReturn = totalCashNeeded > 0 ? (annualCashFlow / totalCashNeeded) * 100 : 0;
  
  // Cap rate: NOI / Purchase Price
  const annualNOI =
    input.monthlyRent * 12 -
    (expenses.insurance +
      expenses.propertyTax +
      expenses.hoa +
      expenses.maintenance +
      expenses.vacancy +
      expenses.propertyManagement) *
      12;
  const capRate = (annualNOI / input.purchasePrice) * 100;
  
  const annualROI = cashOnCashReturn;
  
  return {
    purchasePrice: input.purchasePrice,
    downPayment,
    loanAmount,
    totalCashNeeded,
    monthlyMortgagePayment,
    monthlyRent: input.monthlyRent,
    monthlyExpenses: expenses.total,
    monthlyCashFlow,
    annualCashFlow,
    annualROI,
    cashOnCashReturn,
    capRate,
    expenses,
  };
}

/**
 * Calculate flip property ROI and profit
 */
export function calculateFlip(input: FlipCalculatorInput): FlipCalculatorResult {
  const downPayment = Math.round(input.purchasePrice * (input.downPaymentPercent / 100));
  const loanAmount = input.purchasePrice - downPayment;
  const totalInvestment = downPayment + input.closingCosts + input.renovationCost;
  
  // Interest costs during holding period
  const monthlyInterest = (loanAmount * (input.interestRate / 100)) / 12;
  const interestCosts = Math.round(monthlyInterest * input.holdingMonths);
  
  // Holding costs (utilities, insurance, etc.) - estimate 1% of purchase price per month
  const monthlyHoldingCost = Math.round(input.purchasePrice * 0.01);
  const holdingCosts = monthlyHoldingCost * input.holdingMonths;
  
  const sellingCosts = Math.round(input.afterRepairValue * (input.sellingCostsPercent / 100));
  
  const totalCosts =
    input.purchasePrice +
    input.closingCosts +
    input.renovationCost +
    interestCosts +
    holdingCosts +
    sellingCosts;
  
  const grossProfit = input.afterRepairValue - input.purchasePrice - input.renovationCost;
  const netProfit = input.afterRepairValue - totalCosts;
  
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  
  return {
    purchasePrice: input.purchasePrice,
    downPayment,
    loanAmount,
    renovationCost: input.renovationCost,
    totalInvestment,
    holdingCosts,
    interestCosts,
    sellingCosts,
    totalCosts,
    afterRepairValue: input.afterRepairValue,
    grossProfit,
    netProfit,
    roi,
  };
}

/**
 * Calculate BRRRR strategy ROI and cash flow
 */
export function calculateBRRRR(input: BRRRRCalculatorInput): BRRRRCalculatorResult {
  const downPayment = Math.round(input.purchasePrice * (input.downPaymentPercent / 100));
  const totalInitialInvestment = downPayment + input.closingCosts + input.renovationCost;
  
  // After refinance
  const refinanceAmount = Math.round(input.afterRepairValue * (input.refinanceLTV / 100));
  const cashOutRefinance = refinanceAmount - (input.purchasePrice - downPayment);
  const cashLeftInDeal = Math.max(0, totalInitialInvestment - cashOutRefinance);
  
  // New mortgage payment after refinance
  const monthlyMortgagePayment = calculateMortgagePayment(
    refinanceAmount,
    input.refinanceRate,
    input.loanTermYears
  );
  
  // Monthly expenses
  const monthlyVacancy = Math.round(input.monthlyRent * (input.vacancyRate / 100));
  const monthlyPropertyManagement = Math.round(
    input.monthlyRent * (input.propertyManagementPercent / 100)
  );
  
  const monthlyExpenses =
    monthlyMortgagePayment +
    input.monthlyInsurance +
    input.monthlyPropertyTax +
    input.monthlyHOA +
    input.monthlyMaintenance +
    monthlyVacancy +
    monthlyPropertyManagement;
  
  const monthlyCashFlow = input.monthlyRent - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Calculate returns
  const infiniteReturn = cashLeftInDeal <= 0;
  const cashOnCashReturn =
    cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : Infinity;
  
  const totalEquity = input.afterRepairValue - refinanceAmount;
  
  return {
    purchasePrice: input.purchasePrice,
    downPayment,
    renovationCost: input.renovationCost,
    totalInitialInvestment,
    afterRepairValue: input.afterRepairValue,
    refinanceAmount,
    cashOutRefinance,
    cashLeftInDeal,
    monthlyMortgagePayment,
    monthlyRent: input.monthlyRent,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    infiniteReturn,
    cashOnCashReturn,
    totalEquity,
  };
}

