import countriesData from '@/app/countries.json';

export interface City {
  name: string;
  arabicName: string;
}

export interface Country {
  code: string;
  name: string; 
  arabicName: string; 
  method: number;
  cities: City[];
}

const countryMethodMap: { [key: string]: number } = {
  'Egypt': 5,
  'Algeria': 5,
  'Sudan': 5,
  'Iraq': 3,
  'Morocco': 5,
  'Saudi Arabia': 4,
  'Yemen': 3,
  'Jordan': 3,
  'United Arab Emirates': 8,
  'Libya': 5,
  'Palestine': 3,
  'Oman': 8,
  'Kuwait': 9,
  'Mauritania': 3,
  'Qatar': 10,
  'Bahrain': 8,
  'Djibouti': 3,
  'Comoros': 3,
  'Lebanon': 3,
  'Somalia': 3,
  'Syria': 3,
  'Tunisia': 7,
};

const processedCountries: Country[] = countriesData.map((country) => {
  const cities: City[] = (country.cities as Array<{ ar: string; en: string }>).map((city) => {
    return {
      name: city.en,
      arabicName: city.ar,
    };
  }).sort((a, b) => a.arabicName.localeCompare(b.arabicName, 'ar'));

  return {
    code: country.code,
    name: country.english_name,
    arabicName: country.name,
    method: countryMethodMap[country.english_name] || 3,
    cities,
  };
});

export const countries: Country[] = processedCountries.sort((a, b) => a.arabicName.localeCompare(b.arabicName, 'ar'));
