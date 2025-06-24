
export interface Country {
  name: string;
  arabicName: string;
  method: number; // AlAdhan API method ID
  cities: string[];
}

export const countries: Country[] = [
  { name: 'Algeria', arabicName: 'الجزائر', method: 5, cities: ['Algiers', 'Oran', 'Constantine', 'Annaba'] },
  { name: 'Bahrain', arabicName: 'البحرين', method: 8, cities: ['Manama', 'Riffa', 'Muharraq'] },
  { name: 'Comoros', arabicName: 'جزر القمر', method: 3, cities: ['Moroni', 'Mutsamudu'] },
  { name: 'Djibouti', arabicName: 'جيبوتي', method: 3, cities: ['Djibouti', 'Ali Sabieh', 'Tadjoura'] },
  { name: 'Egypt', arabicName: 'مصر', method: 5, cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'] },
  { name: 'Iraq', arabicName: 'العراق', method: 3, cities: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Karbala'] },
  { name: 'Jordan', arabicName: 'الأردن', method: 3, cities: ['Amman', 'Zarqa', 'Irbid', 'Aqaba'] },
  { name: 'Kuwait', arabicName: 'الكويت', method: 9, cities: ['Kuwait City', 'Hawalli', 'Salmiya'] },
  { name: 'Lebanon', arabicName: 'لبنان', method: 3, cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre'] },
  { name: 'Libya', arabicName: 'ليبيا', method: 5, cities: ['Tripoli', 'Benghazi', 'Misrata'] },
  { name: 'Mauritania', arabicName: 'موريتانيا', method: 3, cities: ['Nouakchott', 'Nouadhibou'] },
  { name: 'Morocco', arabicName: 'المغرب', method: 5, cities: ['Rabat', 'Casablanca', 'Fes', 'Marrakesh', 'Tangier'] },
  { name: 'Oman', arabicName: 'عمان', method: 8, cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'] },
  { name: 'Palestine', arabicName: 'فلسطين', method: 3, cities: ['Jerusalem', 'Gaza', 'Ramallah', 'Hebron', 'Nablus'] },
  { name: 'Qatar', arabicName: 'قطر', method: 10, cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
  { name: 'Saudi Arabia', arabicName: 'المملكة العربية السعودية', method: 4, cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
  { name: 'Somalia', arabicName: 'الصومال', method: 3, cities: ['Mogadishu', 'Hargeisa', 'Kismayo'] },
  { name: 'Sudan', arabicName: 'السودان', method: 5, cities: ['Khartoum', 'Omdurman', 'Port Sudan'] },
  { name: 'Syria', arabicName: 'سوريا', method: 3, cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia'] },
  { name: 'Tunisia', arabicName: 'تونس', method: 7, cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'] }, // Note: Tunisia uses a specific method based on the French 12 degrees, often mapping to method 7 or custom. Using 7 for now.
  { name: 'United Arab Emirates', arabicName: 'الإمارات العربية المتحدة', method: 8, cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain'] },
  { name: 'Yemen', arabicName: 'اليمن', method: 3, cities: ['Sana\'a', 'Aden', 'Taiz'] },
];
