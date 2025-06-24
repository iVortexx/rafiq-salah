import countriesData from '@/app/countries.json';

export interface City {
  name: string; // English name for display
  arabicName: string; // Arabic name for API and display
}

export interface Country {
  code: string;
  name: string; // English name for API
  arabicName: string; // Arabic name for display
  method: number; // AlAdhan API method ID
  cities: City[];
}

// Based on AlAdhan API documentation and available data
const countryMethodMap: { [key: string]: number } = {
  'Egypt': 5,                      // Egyptian General Authority of Survey
  'Algeria': 5,                    // Egyptian General Authority of Survey
  'Sudan': 5,                      // Egyptian General Authority of Survey
  'Iraq': 3,                       // Muslim World League
  'Morocco': 5,                    // Often uses French method 12, but 5 is a common alternative
  'Saudi Arabia': 4,               // Umm Al-Qura University, Makkah
  'Yemen': 3,                      // Muslim World League
  'Jordan': 3,                     // Muslim World League
  'United Arab Emirates': 8,       // University of Islamic Sciences, Karachi
  'Libya': 5,                      // Egyptian General Authority of Survey
  'Palestine': 3,                  // Muslim World League
  'Oman': 8,                       // University of Islamic Sciences, Karachi
  'Kuwait': 9,                     // Kuwait
  'Mauritania': 3,                 // Muslim World League
  'Qatar': 10,                     // Qatar
  'Bahrain': 8,                    // University of Islamic Sciences, Karachi
  'Djibouti': 3,                   // Muslim World League
  'Comoros': 3,                    // Muslim World League
  'Lebanon': 3,                    // Muslim World League
  'Somalia': 3,                    // Muslim World League
  'Syria': 3,                      // Muslim World League
  'Tunisia': 7,                    // Tunis
};

const processedCountries: Country[] = countriesData.map((country) => {
  const cities: City[] = (country.cities as Array<string | { ar: string; en: string }>).map((city) => {
    if (typeof city === 'object' && city.ar && city.en) {
      // New format: { ar: '..', en: '..' }
      return {
        name: city.en,
        arabicName: city.ar,
      };
    }
    // Old format: '...' (string)
    // We'll use the Arabic name for both as a fallback.
    const arabicCityName = city as string;
    return {
      name: arabicCityName, // Fallback to Arabic name for display
      arabicName: arabicCityName,
    };
  }).sort((a, b) => a.arabicName.localeCompare(b.arabicName, 'ar'));

  return {
    code: country.code,
    name: country.english_name,
    arabicName: country.name,
    method: countryMethodMap[country.english_name] || 3, // Default to Muslim World League
    cities,
  };
});


// Sort countries alphabetically by Arabic name
export const countries: Country[] = processedCountries.sort((a, b) => a.arabicName.localeCompare(b.arabicName, 'ar'));
