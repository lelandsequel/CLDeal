import { properties } from "../drizzle/schema";

type Property = typeof properties.$inferSelect;

export function generateHTMLReport(propertyList: Property[]): string {
  const now = new Date().toLocaleString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deal Finder - Property Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .property-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 15px;
    }
    .property-title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin: 0 0 5px 0;
    }
    .property-location {
      color: #666;
      font-size: 14px;
    }
    .days-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 15px;
    }
    .metric {
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .metric-value.profit {
      color: #059669;
    }
    .details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    .detail-item {
      font-size: 14px;
      color: #666;
    }
    .detail-label {
      font-weight: 600;
      color: #333;
    }
    .condition {
      margin-top: 15px;
      padding: 15px;
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 4px;
      font-size: 14px;
      color: #991b1b;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    @media print {
      body { background: white; }
      .property-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 Deal Finder Property Report</h1>
    <p>Generated on ${now} • ${propertyList.length} Properties</p>
  </div>

  ${propertyList.map(property => `
    <div class="property-card">
      <div class="property-header">
        <div>
          <h2 class="property-title">${property.address}</h2>
          <p class="property-location">${property.city}, ${property.state} ${property.zipCode || ''}</p>
        </div>
        ${property.daysOnMarket ? `<span class="days-badge">${property.daysOnMarket}d</span>` : ''}
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Current Price</div>
          <div class="metric-value">$${property.currentPrice.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Est. ARV</div>
          <div class="metric-value">$${(property.estimatedARV || 0).toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Profit Potential</div>
          <div class="metric-value profit">$${(property.estimatedProfitPotential || 0).toLocaleString()}</div>
        </div>
      </div>

      <div class="details">
        <div class="detail-item">
          <span class="detail-label">Property Type:</span> ${property.propertyType === 'single-family' ? 'Single Family' : 'Multifamily'}
        </div>
        <div class="detail-item">
          <span class="detail-label">Bedrooms:</span> ${property.beds || 'N/A'}
        </div>
        <div class="detail-item">
          <span class="detail-label">Bathrooms:</span> ${property.baths || 'N/A'}
        </div>
        <div class="detail-item">
          <span class="detail-label">Square Feet:</span> ${property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A'}
        </div>
        <div class="detail-item">
          <span class="detail-label">Est. Renovation:</span> $${(property.estimatedRenovationCost || 0).toLocaleString()}
        </div>
        <div class="detail-item">
          <span class="detail-label">Profit Score:</span> ${property.profitScore}/100
        </div>
      </div>

      ${property.propertyCondition ? `
        <div class="condition">
          <strong>Condition:</strong> ${property.propertyCondition}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Deal Finder - Real Estate Investment Property Finder</p>
    <p>This report is for informational purposes only. Always conduct your own due diligence.</p>
  </div>
</body>
</html>`;
}

export function generatePDFHTML(propertyList: Property[]): string {
  // Similar to HTML but optimized for PDF rendering
  const now = new Date().toLocaleString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deal Finder - Property Report</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .header h1 {
      margin: 0;
      font-size: 24pt;
      color: #667eea;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #666;
    }
    .property-card {
      margin-bottom: 15px;
      padding: 12px;
      border: 1px solid #ddd;
      page-break-inside: avoid;
    }
    .property-header {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .property-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 0 0 3px 0;
    }
    .property-location {
      color: #666;
      font-size: 9pt;
    }
    .metrics {
      display: table;
      width: 100%;
      margin: 10px 0;
    }
    .metric {
      display: table-cell;
      text-align: center;
      padding: 8px;
      background: #f9fafb;
    }
    .metric-label {
      font-size: 8pt;
      color: #666;
      text-transform: uppercase;
    }
    .metric-value {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 3px;
    }
    .details {
      margin-top: 10px;
      font-size: 9pt;
    }
    .detail-row {
      margin: 3px 0;
    }
    .detail-label {
      font-weight: bold;
    }
    .condition {
      margin-top: 8px;
      padding: 8px;
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      font-size: 9pt;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Deal Finder Property Report</h1>
    <p>Generated: ${now} | Total Properties: ${propertyList.length}</p>
  </div>

  ${propertyList.map((property, index) => `
    <div class="property-card">
      <div class="property-header">
        <div class="property-title">${index + 1}. ${property.address}</div>
        <div class="property-location">${property.city}, ${property.state} ${property.zipCode || ''}</div>
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Current Price</div>
          <div class="metric-value">$${property.currentPrice.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Est. ARV</div>
          <div class="metric-value">$${(property.estimatedARV || 0).toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Profit Potential</div>
          <div class="metric-value">$${(property.estimatedProfitPotential || 0).toLocaleString()}</div>
        </div>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Type:</span> ${property.propertyType === 'single-family' ? 'Single Family' : 'Multifamily'} | 
          <span class="detail-label">Beds:</span> ${property.beds || 'N/A'} | 
          <span class="detail-label">Baths:</span> ${property.baths || 'N/A'} | 
          <span class="detail-label">Sq Ft:</span> ${property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Est. Renovation:</span> $${(property.estimatedRenovationCost || 0).toLocaleString()} | 
          <span class="detail-label">Days on Market:</span> ${property.daysOnMarket || 'N/A'} | 
          <span class="detail-label">Profit Score:</span> ${property.profitScore}/100
        </div>
      </div>

      ${property.propertyCondition ? `
        <div class="condition">
          <strong>Condition:</strong> ${property.propertyCondition}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Deal Finder - Real Estate Investment Property Finder</p>
    <p>This report is for informational purposes only. Always conduct your own due diligence.</p>
  </div>
</body>
</html>`;
}

