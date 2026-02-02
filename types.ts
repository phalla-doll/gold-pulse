export interface StatMetric {
  label: string;
  value: string;
  change: number;
  data: number[]; // For sparklines
}

export interface CountryGoldHolding {
  rank: number;
  country: string;
  holdings: number; // In Tonnes
  value: string; // In Billions USD
  percentage: number; // % of reserves
  change: number; // Recent change in holdings
  flagCode: string; // ISO code for flag
}

export interface NewsItem {
  id: string;
  title: string;
  time: string;
  source: string;
  type: 'News' | 'Alert' | 'Report';
}

export interface HeatmapCell {
  hour: number;
  day: string;
  intensity: number; // 0-100
}

export interface PriceDataPoint {
  time: string; // Date string (YYYY-MM-DD) or Time
  price: number;
  volume?: number;
}