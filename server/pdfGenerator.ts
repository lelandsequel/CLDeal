/**
 * PDF Generation Service
 * Generates professional PDF reports for CMA and property analysis
 */

interface CMAData {
  propertyAddress: string;
  city: string;
  state: string;
  currentPrice: number;
  estimatedARV: number;
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    beds: number;
    baths: number;
    squareFeet: number;
    pricePerSqFt: number;
  }>;
  marketTrends: string;
  locationAnalysis: string;
  recommendations: string;
}

interface PropertyAnalysisData {
  property: {
    address: string;
    city: string;
    state: string;
    propertyType: string;
    currentPrice: number;
    estimatedARV: number | null;
    estimatedRenovationCost: number | null;
    estimatedProfitPotential: number | null;
    beds: number | null;
    baths: number | null;
    squareFeet: number | null;
    propertyCondition: string | null;
    daysOnMarket: number | null;
  };
  dealScore?: {
    totalScore: number;
    breakdown: {
      financialScore: number;
      locationScore: number;
      conditionScore: number;
      marketScore: number;
    };
    reasoning: string;
  };
  financialMetrics?: {
    priceToARV: number;
    potentialROI: number;
    profitMargin: number;
  };
  motivatedSellerScore?: number;
}

/**
 * Generate HTML for CMA Report
 */
export function generateCMAHTML(data: CMAData): string {
  const avgSoldPrice = data.comparables.length > 0
    ? data.comparables.reduce((sum, comp) => sum + comp.soldPrice, 0) / data.comparables.length
    : 0;
  
  const avgPricePerSqFt = data.comparables.length > 0
    ? data.comparables.reduce((sum, comp) => sum + comp.pricePerSqFt, 0) / data.comparables.length
    : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comparative Market Analysis - ${data.propertyAddress}</title>
  <style>
    @page {
      margin: 0.75in;
      size: letter;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 30px;
      margin: -0.75in -0.75in 30px -0.75in;
      border-radius: 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:hover {
      background: #f8fafc;
    }
    .analysis-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin-top: 15px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
    .logo {
      font-weight: 700;
      color: white;
      font-size: 18px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">C&L Deal Intelligence</div>
    <h1>Comparative Market Analysis</h1>
    <p>${data.propertyAddress}, ${data.city}, ${data.state}</p>
    <p style="margin-top: 10px; font-size: 14px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Subject Property</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Current List Price</div>
        <div class="metric-value">$${data.currentPrice.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Estimated ARV</div>
        <div class="metric-value">$${data.estimatedARV.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average Comp Price</div>
        <div class="metric-value">$${Math.round(avgSoldPrice).toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Price/Sq Ft</div>
        <div class="metric-value">$${Math.round(avgPricePerSqFt)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Comparable Sales</h2>
    <table>
      <thead>
        <tr>
          <th>Address</th>
          <th>Sold Price</th>
          <th>Sold Date</th>
          <th>Beds/Baths</th>
          <th>Sq Ft</th>
          <th>$/Sq Ft</th>
        </tr>
      </thead>
      <tbody>
        ${data.comparables.map(comp => `
          <tr>
            <td>${comp.address}</td>
            <td>$${comp.soldPrice.toLocaleString()}</td>
            <td>${comp.soldDate}</td>
            <td>${comp.beds}/${comp.baths}</td>
            <td>${comp.squareFeet.toLocaleString()}</td>
            <td>$${comp.pricePerSqFt}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Market Trends</h2>
    <div class="analysis-box">
      ${data.marketTrends}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Location Analysis</h2>
    <div class="analysis-box">
      ${data.locationAnalysis}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Recommendations</h2>
    <div class="analysis-box">
      ${data.recommendations}
    </div>
  </div>

  <div class="footer">
    <p><strong>C&L Deal Intelligence</strong> - Data-Driven Real Estate Investment Platform</p>
    <p>This report is for informational purposes only and should not be considered as professional advice.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for Property Analysis Report
 */
export function generatePropertyAnalysisHTML(data: PropertyAnalysisData): string {
  const { property, dealScore, financialMetrics, motivatedSellerScore } = data;
  
  const profitPotential = property.estimatedProfitPotential || 0;
  const priceToARV = financialMetrics?.priceToARV || 
    (property.estimatedARV ? (property.currentPrice / property.estimatedARV * 100) : 0);
  const roi = financialMetrics?.potentialROI || 
    (profitPotential > 0 && property.currentPrice > 0 ? (profitPotential / property.currentPrice * 100) : 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Property Analysis - ${property.address}</title>
  <style>
    @page {
      margin: 0.75in;
      size: letter;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 30px;
      margin: -0.75in -0.75in 30px -0.75in;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .score-banner {
      background: ${dealScore && dealScore.totalScore >= 70 ? '#10b981' : dealScore && dealScore.totalScore >= 50 ? '#f59e0b' : '#ef4444'};
      color: white;
      padding: 20px;
      margin: -10px -0.75in 30px -0.75in;
      text-align: center;
    }
    .score-banner h2 {
      margin: 0;
      font-size: 48px;
      font-weight: 700;
    }
    .score-banner p {
      margin: 5px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-top: 3px solid #2563eb;
    }
    .metric-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    .metric-value.positive {
      color: #10b981;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #2563eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-label {
      font-weight: 500;
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #1e293b;
    }
    .score-breakdown {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .score-item {
      text-align: center;
      padding: 15px;
      background: #eff6ff;
      border-radius: 8px;
    }
    .score-item-value {
      font-size: 32px;
      font-weight: 700;
      color: #2563eb;
    }
    .score-item-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    .analysis-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin-top: 10px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.7;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
    .logo {
      font-weight: 700;
      color: white;
      font-size: 18px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">C&L Deal Intelligence</div>
    <h1>Property Investment Analysis</h1>
    <p>${property.address}, ${property.city}, ${property.state}</p>
    <p style="margin-top: 10px; font-size: 14px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  ${dealScore ? `
  <div class="score-banner">
    <h2>${dealScore.totalScore}/100</h2>
    <p>Overall Deal Score ${dealScore.totalScore >= 70 ? '- Excellent Opportunity' : dealScore.totalScore >= 50 ? '- Good Potential' : '- Needs Review'}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">Financial Overview</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">List Price</div>
        <div class="metric-value">$${property.currentPrice.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Est. ARV</div>
        <div class="metric-value">${property.estimatedARV ? '$' + property.estimatedARV.toLocaleString() : 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Profit Potential</div>
        <div class="metric-value positive">${profitPotential > 0 ? '$' + profitPotential.toLocaleString() : 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Price to ARV</div>
        <div class="metric-value">${priceToARV > 0 ? Math.round(priceToARV) + '%' : 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Potential ROI</div>
        <div class="metric-value positive">${roi > 0 ? Math.round(roi) + '%' : 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Renovation Cost</div>
        <div class="metric-value">${property.estimatedRenovationCost ? '$' + property.estimatedRenovationCost.toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Property Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Property Type:</span>
        <span class="info-value">${property.propertyType === 'single-family' ? 'Single Family' : 'Multifamily'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Bedrooms:</span>
        <span class="info-value">${property.beds || 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Bathrooms:</span>
        <span class="info-value">${property.baths || 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Square Feet:</span>
        <span class="info-value">${property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Condition:</span>
        <span class="info-value">${property.propertyCondition || 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Days on Market:</span>
        <span class="info-value">${property.daysOnMarket || 'N/A'}</span>
      </div>
    </div>
  </div>

  ${dealScore ? `
  <div class="section">
    <h2 class="section-title">Deal Score Breakdown</h2>
    <div class="score-breakdown">
      <div class="score-item">
        <div class="score-item-value">${dealScore.breakdown.financialScore}</div>
        <div class="score-item-label">Financial</div>
      </div>
      <div class="score-item">
        <div class="score-item-value">${dealScore.breakdown.locationScore}</div>
        <div class="score-item-label">Location</div>
      </div>
      <div class="score-item">
        <div class="score-item-value">${dealScore.breakdown.conditionScore}</div>
        <div class="score-item-label">Condition</div>
      </div>
      <div class="score-item">
        <div class="score-item-value">${dealScore.breakdown.marketScore}</div>
        <div class="score-item-label">Market</div>
      </div>
    </div>
    <div class="analysis-box">
      ${dealScore.reasoning}
    </div>
  </div>
  ` : ''}

  ${motivatedSellerScore ? `
  <div class="section">
    <h2 class="section-title">Seller Motivation</h2>
    <div class="metric-card" style="text-align: center; max-width: 300px; margin: 0 auto;">
      <div class="metric-label">Motivated Seller Score</div>
      <div class="metric-value" style="font-size: 48px; color: ${motivatedSellerScore >= 70 ? '#10b981' : motivatedSellerScore >= 50 ? '#f59e0b' : '#64748b'};">
        ${motivatedSellerScore}/100
      </div>
      <p style="margin-top: 10px; font-size: 13px; color: #64748b;">
        ${motivatedSellerScore >= 70 ? 'Highly motivated - Strong negotiation opportunity' : 
          motivatedSellerScore >= 50 ? 'Moderately motivated - Room for negotiation' : 
          'Standard motivation - Market-rate offer recommended'}
      </p>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>C&L Deal Intelligence</strong> - Data-Driven Real Estate Investment Platform</p>
    <p>This analysis is for informational purposes only. Conduct your own due diligence before making investment decisions.</p>
  </div>
</body>
</html>
  `;
}

