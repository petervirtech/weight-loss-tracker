# Weight Loss Tracker

A comprehensive weight loss progress tracking application built with Next.js and TypeScript. Track your weight loss journey with charts, statistics, goal tracking, and cloud synchronization via Airtable.

![Weight Loss Tracker](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5.0-FF6384?style=flat-square&logo=chart.js)

## Features

### 📊 **Comprehensive Tracking**
- **Weight Entry Management**: Add, edit, and delete weight entries with dates and notes
- **Progress Visualization**: Interactive charts showing weight loss trends over time
- **Statistics Dashboard**: BMI calculation, progress stats, and goal tracking
- **Height in Centimeters**: Consistent metric measurements throughout the app

### 💾 **Hybrid Data Persistence**
- **Local Storage**: Immediate responsiveness and offline capability
- **Airtable Sync**: Cloud backup and cross-device data recovery
- **Data Export/Import**: JSON backup files for data transfer
- **Auto-sync**: Background synchronization every 30 seconds when online

### ⚙️ **User Customization**
- **Weight Units**: Support for both pounds (lbs) and kilograms (kg)
- **Date Formats**: MM/dd/yyyy or dd/MM/yyyy options
- **Goal Setting**: Set target weight and track progress
- **Personal Settings**: Customizable user profile

### 🔧 **Airtable Integration**
- **Setup Guide**: In-app instructions for Airtable configuration
- **Connection Testing**: Verify Airtable setup and troubleshoot issues
- **Duplicate Cleanup**: Tools to maintain data integrity
- **Field Validation**: Detailed error handling and guidance

## Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Cloud Storage**: Airtable REST API
- **Local Storage**: Browser localStorage with hybrid sync

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Airtable account for cloud sync

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weight-loss-tracker.git
   cd weight-loss-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional - for Airtable sync)
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
   NEXT_PUBLIC_AIRTABLE_API_KEY=your_api_key
   NEXT_PUBLIC_AIRTABLE_WEIGHT_TABLE=WeightEntries
   NEXT_PUBLIC_AIRTABLE_SETTINGS_TABLE=Settings
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Airtable Setup (Optional)

For cloud synchronization, you can integrate with Airtable:

1. Create an Airtable base
2. Add two tables: `WeightEntries` and `Settings`
3. Configure fields as specified in the in-app setup guide
4. Add your credentials to `.env.local`
5. Use the in-app "Setup Guide" for detailed instructions

### Required Table Schemas

**WeightEntries Table:**
- Entry ID (Single line text)
- Date (Date)
- Weight (Number)
- Notes (Long text)
- Created At (Date)
- Updated At (Date)

**Settings Table:**
- Name (Single line text)
- Goal Weight (Number)
- Start Weight (Number)
- Height Cm (Number)
- Weight Unit (Single select: lbs, kg)
- Date Format (Single select: MM/dd/yyyy, dd/MM/yyyy)
- Last Updated (Date)

## Usage

### Adding Weight Entries
1. Fill in the weight entry form with date, weight, and optional notes
2. Click "Add Weight Entry" to save
3. View your entry in the history table and progress chart

### Viewing Progress
- **Dashboard**: Overview of current stats and BMI
- **Progress Chart**: Visual representation of weight loss over time
- **History Table**: Detailed view of all entries with edit/delete options

### Managing Settings
1. Click the "Settings" button
2. Configure your personal information and preferences
3. Set up Airtable integration if desired
4. Use data export/import features for backup

## Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm start           # Start production server

# Quality
npm run lint        # Run ESLint
```

## Architecture

### Data Flow
1. **Local First**: All operations work with local storage immediately
2. **Background Sync**: Changes are queued for Airtable synchronization
3. **Conflict Resolution**: Local storage takes precedence with recovery options
4. **Offline Support**: Full functionality without internet connection

### Component Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── services/           # API services (Airtable)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and local storage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Icons from [Lucide](https://lucide.dev/)
- Cloud storage via [Airtable](https://airtable.com/)

## Support

If you encounter any issues or have questions:

1. Check the in-app setup guide for Airtable configuration
2. Review the error messages for specific guidance
3. Open an issue on GitHub

---

**Made with ❤️ for health and wellness tracking**
