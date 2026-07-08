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
  "Austria": "\ud83c\udde6\ud83c\uddf9", "Cyprus": "\ud83c\udde8\ud83c\uddfe", "France": "\ud83c\uddeb\ud83c\uddf7", "Germany": "\ud83c\udde9\ud83c\uddea",
  "Greece": "\ud83c\uddec\ud83c\uddf7", "Ireland": "\ud83c\uddee\ud83c\uddea", "Netherlands": "\ud83c\uddf3\ud83c\uddf1", "Poland": "\ud83c\uddf5\ud83c\uddf1",
  "Portugal": "\ud83c\uddf5\ud83c\uddf9", "Romania": "\ud83c\uddf7\ud83c\uddf4", "Spain": "\ud83c\uddea\ud83c\uddf8", "Switzerland": "\ud83c\udde8\ud83c\udded",
  "United Kingdom": "\ud83c\uddec\ud83c\udde7", "Italy": "\ud83c\uddee\ud83c\uddf9", "Belgium": "\ud83c\udde7\ud83c\uddea", "Sweden": "\ud83c\uddf8\ud83c\uddea",
  "Norway": "\ud83c\uddf3\ud83c\uddf4", "Denmark": "\ud83c\udde9\ud83c\uddf0", "Finland": "\ud83c\uddeb\ud83c\uddee", "Czech Republic": "\ud83c\udde8\ud83c\uddff",
  "Lithuania": "\ud83c\uddf1\ud83c\uddf9", "Russia": "\ud83c\uddf7\ud83c\uddfa", "Latvia": "\ud83c\uddf1\ud83c\uddfb", "Estonia": "\ud83c\uddea\ud83c\uddea",
  "UAE (Dubai)": "\ud83c\udde6\ud83c\uddea", "UAE": "\ud83c\udde6\ud83c\uddea", "Saudi Arabia": "\ud83c\uddf8\ud83c\udde6", "Qatar": "\ud83c\uddf6\ud83c\udde6",
  "Kuwait": "\ud83c\uddf0\ud83c\uddfc", "Oman": "\ud83c\uddf4\ud83c\uddf2", "Bahrain": "\ud83c\udde7\ud83c\udded",
  "South Africa": "\ud83c\uddff\ud83c\udde6", "Egypt": "\ud83c\uddea\ud83c\uddec", "Morocco": "\ud83c\uddf2\ud83c\udde6", "Nigeria": "\ud83c\uddf3\ud83c\uddec", "Kenya": "\ud83c\uddf0\ud83c\uddea",
  "China": "\ud83c\udde8\ud83c\uddf3", "India": "\ud83c\uddee\ud83c\uddf3", "Japan": "\ud83c\uddef\ud83c\uddf5", "South Korea": "\ud83c\uddf0\ud83c\uddf7",
  "Singapore": "\ud83c\uddf8\ud83c\uddec", "Thailand": "\ud83c\uddf9\ud83c\udded", "Taiwan": "\ud83c\uddf9\ud83c\uddfc", "Malaysia": "\ud83c\uddf2\ud83c\uddfe",
  "Philippines": "\ud83c\uddf5\ud83c\udded", "Vietnam": "\ud83c\uddfb\ud83c\uddf3", "Indonesia": "\ud83c\uddee\ud83c\udde9",
  "USA": "\ud83c\uddfa\ud83c\uddf8", "Canada": "\ud83c\udde8\ud83c\udde6", "Brazil": "\ud83c\udde7\ud83c\uddf7", "Mexico": "\ud83c\uddf2\ud83c\uddfd",
  "Argentina": "\ud83c\udde6\ud83c\uddf7", "Chile": "\ud83c\udde8\ud83c\uddf1", "Colombia": "\ud83c\udde8\ud83c\uddf4",
};

export const getFlag = (country) => COUNTRY_FLAGS[country] || "\ud83c\udf10";
