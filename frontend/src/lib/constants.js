export const REGIONS = ["Europe", "Middle East", "Africa", "Asia", "America"];
export const STATUSES = ["Current", "Standby", "Old"];
export const ACTIVITIES = ["Med", "AE", "Med/AE"];

export const STATUS_STYLES = {
  Current: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Current",
  },
  Standby: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    label: "Standby",
  },
  Old: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    label: "Old",
  },
};

// Common country -> flag emoji map to auto-suggest when adding new partners
export const COUNTRY_FLAGS = {
  "Austria": "🇦🇹", "Cyprus": "🇨🇾", "France": "🇫🇷", "Germany": "🇩🇪",
  "Greece": "🇬🇷", "Ireland": "🇮🇪", "Netherlands": "🇳🇱", "Poland": "🇵🇱",
  "Portugal": "🇵🇹", "Romania": "🇷🇴", "Spain": "🇪🇸", "Switzerland": "🇨🇭",
  "United Kingdom": "🇬🇧", "Italy": "🇮🇹", "Belgium": "🇧🇪", "Sweden": "🇸🇪",
  "Norway": "🇳🇴", "Denmark": "🇩🇰", "Finland": "🇫🇮", "Czech Republic": "🇨🇿",
  "Lithuania": "🇱🇹", "Russia": "🇷🇺", "Latvia": "🇱🇻", "Estonia": "🇪🇪",
  "UAE (Dubai)": "🇦🇪", "UAE": "🇦🇪", "Saudi Arabia": "🇸🇦", "Qatar": "🇶🇦",
  "Kuwait": "🇰🇼", "Oman": "🇴🇲", "Bahrain": "🇧🇭",
  "South Africa": "🇿🇦", "Egypt": "🇪🇬", "Morocco": "🇲🇦", "Nigeria": "🇳🇬", "Kenya": "🇰🇪",
  "China": "🇨🇳", "India": "🇮🇳", "Japan": "🇯🇵", "South Korea": "🇰🇷",
  "Singapore": "🇸🇬", "Thailand": "🇹🇭", "Taiwan": "🇹🇼", "Malaysia": "🇲🇾",
  "Philippines": "🇵🇭", "Vietnam": "🇻🇳", "Indonesia": "🇮🇩",
  "USA": "🇺🇸", "Canada": "🇨🇦", "Brazil": "🇧🇷", "Mexico": "🇲🇽",
  "Argentina": "🇦🇷", "Chile": "🇨🇱", "Colombia": "🇨🇴",
};

export const getFlag = (country) => COUNTRY_FLAGS[country] || "🌐";
