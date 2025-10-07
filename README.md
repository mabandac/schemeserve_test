# UK Crime Dashboard

This is an interactive dashboard for visualising UK Police crime data by postcode, built with React, TypeScript, and modern web technologies.

## Getting Started

### Prerequisites

- Node.js 20.19+
- npm or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mabandac/schemeserve_test.git
cd schemeserve_test
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage
1. Enter one or more postcodes (comma-separated).
2. Choose From and To months (YYYY-MM).
3. Click Search to fetch crimes and view charts/map.

## Data Sources
- UK Police API (`https://data.police.uk/`)
- GetTheData Postcode API (`http://api.getthedata.com/postcode`)

Note: UK Police data is typically 1–2 months behind.
