
export interface City {
  name: string;
  arabicName: string;
}

export interface Country {
  name: string;
  arabicName: string;
  method: number; // AlAdhan API method ID
  cities: City[];
}

export const countries: Country[] = [
  { name: 'Algeria', arabicName: 'الجزائر', method: 5, cities: [
      { name: 'Algiers', arabicName: 'الجزائر' },
      { name: 'Oran', arabicName: 'وهران' },
      { name: 'Constantine', arabicName: 'قسنطينة' },
      { name: 'Annaba', arabicName: 'عنابة' }
  ] },
  { name: 'Bahrain', arabicName: 'البحرين', method: 8, cities: [
      { name: 'Manama', arabicName: 'المنامة' },
      { name: 'Riffa', arabicName: 'الرفاع' },
      { name: 'Muharraq', arabicName: 'المحرق' }
  ] },
  { name: 'Comoros', arabicName: 'جزر القمر', method: 3, cities: [
      { name: 'Moroni', arabicName: 'موروني' },
      { name: 'Mutsamudu', arabicName: 'موتسامودو' }
  ] },
  { name: 'Djibouti', arabicName: 'جيبوتي', method: 3, cities: [
      { name: 'Djibouti', arabicName: 'جيبوتي' },
      { name: 'Ali Sabieh', arabicName: 'علي صبيح' },
      { name: 'Tadjoura', arabicName: 'تاجورة' }
  ] },
  { name: 'Egypt', arabicName: 'مصر', method: 5, cities: [
      { name: 'Cairo', arabicName: 'القاهرة' },
      { name: 'Alexandria', arabicName: 'الإسكندرية' },
      { name: 'Giza', arabicName: 'الجيزة' },
      { name: 'Luxor', arabicName: 'الأقصر' },
      { name: 'Aswan', arabicName: 'أسوان' }
  ] },
  { name: 'Iraq', arabicName: 'العراق', method: 3, cities: [
      { name: 'Baghdad', arabicName: 'بغداد' },
      { name: 'Basra', arabicName: 'البصرة' },
      { name: 'Mosul', arabicName: 'الموصل' },
      { name: 'Erbil', arabicName: 'أربيل' },
      { name: 'Karbala', arabicName: 'كربلاء' }
  ] },
  { name: 'Jordan', arabicName: 'الأردن', method: 3, cities: [
      { name: 'Amman', arabicName: 'عمان' },
      { name: 'Zarqa', arabicName: 'الزرقاء' },
      { name: 'Irbid', arabicName: 'إربد' },
      { name: 'Aqaba', arabicName: 'العقبة' }
  ] },
  { name: 'Kuwait', arabicName: 'الكويت', method: 9, cities: [
      { name: 'Kuwait City', arabicName: 'مدينة الكويت' },
      { name: 'Hawalli', arabicName: 'حولي' },
      { name: 'Salmiya', arabicName: 'السالمية' }
  ] },
  { name: 'Lebanon', arabicName: 'لبنان', method: 3, cities: [
      { name: 'Beirut', arabicName: 'بيروت' },
      { name: 'Tripoli', arabicName: 'طرابلس' },
      { name: 'Sidon', arabicName: 'صيدا' },
      { name: 'Tyre', arabicName: 'صور' }
  ] },
  { name: 'Libya', arabicName: 'ليبيا', method: 5, cities: [
      { name: 'Tripoli', arabicName: 'طرابلس' },
      { name: 'Benghazi', arabicName: 'بنغازي' },
      { name: 'Misrata', arabicName: 'مصراتة' }
  ] },
  { name: 'Mauritania', arabicName: 'موريتانيا', method: 3, cities: [
      { name: 'Nouakchott', arabicName: 'نواكشوط' },
      { name: 'Nouadhibou', arabicName: 'نواذيبو' }
  ] },
  { name: 'Morocco', arabicName: 'المغرب', method: 5, cities: [
      { name: 'Rabat', arabicName: 'الرباط' },
      { name: 'Casablanca', arabicName: 'الدار البيضاء' },
      { name: 'Fes', arabicName: 'فاس' },
      { name: 'Marrakesh', arabicName: 'مراكش' },
      { name: 'Tangier', arabicName: 'طنجة' }
  ] },
  { name: 'Oman', arabicName: 'عمان', method: 8, cities: [
      { name: 'Muscat', arabicName: 'مسقط' },
      { name: 'Salalah', arabicName: 'صلالة' },
      { name: 'Sohar', arabicName: 'صحار' },
      { name: 'Nizwa', arabicName: 'نزوى' }
  ] },
  { name: 'Palestine', arabicName: 'فلسطين', method: 3, cities: [
      { name: 'Jerusalem', arabicName: 'القدس' },
      { name: 'Gaza', arabicName: 'غزة' },
      { name: 'Ramallah', arabicName: 'رام الله' },
      { name: 'Hebron', arabicName: 'الخليل' },
      { name: 'Nablus', arabicName: 'نابلس' }
  ] },
  { name: 'Qatar', arabicName: 'قطر', method: 10, cities: [
      { name: 'Doha', arabicName: 'الدوحة' },
      { name: 'Al Wakrah', arabicName: 'الوكرة' },
      { name: 'Al Khor', arabicName: 'الخور' }
  ] },
  { name: 'Saudi Arabia', arabicName: 'المملكة العربية السعودية', method: 4, cities: [
      { name: 'Riyadh', arabicName: 'الرياض' },
      { name: 'Jeddah', arabicName: 'جدة' },
      { name: 'Mecca', arabicName: 'مكة' },
      { name: 'Medina', arabicName: 'المدينة المنورة' },
      { name: 'Dammam', arabicName: 'الدمام' }
  ] },
  { name: 'Somalia', arabicName: 'الصومال', method: 3, cities: [
      { name: 'Mogadishu', arabicName: 'مقديشو' },
      { name: 'Hargeisa', arabicName: 'هرجيسا' },
      { name: 'Kismayo', arabicName: 'كيسمايو' }
  ] },
  { name: 'Sudan', arabicName: 'السودان', method: 5, cities: [
      { name: 'Khartoum', arabicName: 'الخرطوم' },
      { name: 'Omdurman', arabicName: 'أم درمان' },
      { name: 'Port Sudan', arabicName: 'بورتسودان' }
  ] },
  { name: 'Syria', arabicName: 'سوريا', method: 3, cities: [
      { name: 'Damascus', arabicName: 'دمشق' },
      { name: 'Aleppo', arabicName: 'حلب' },
      { name: 'Homs', arabicName: 'حمص' },
      { name: 'Latakia', arabicName: 'اللاذقية' }
  ] },
  { name: 'Tunisia', arabicName: 'تونس', method: 7, cities: [
      { name: 'Tunis', arabicName: 'تونس' },
      { name: 'Sfax', arabicName: 'صفاقس' },
      { name: 'Sousse', arabicName: 'سوسة' },
      { name: 'Kairouan', arabicName: 'القيروان' }
  ] },
  { name: 'United Arab Emirates', arabicName: 'الإمارات العربية المتحدة', method: 8, cities: [
      { name: 'Dubai', arabicName: 'دبي' },
      { name: 'Abu Dhabi', arabicName: 'أبو ظبي' },
      { name: 'Sharjah', arabicName: 'الشارقة' },
      { name: 'Al Ain', arabicName: 'العين' }
  ] },
  { name: 'Yemen', arabicName: 'اليمن', method: 3, cities: [
      { name: 'Sana\'a', arabicName: 'صنعاء' },
      { name: 'Aden', arabicName: 'عدن' },
      { name: 'Taiz', arabicName: 'تعز' }
  ] },
];
