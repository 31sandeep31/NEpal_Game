export interface ProvinceInfo {
  id: number;
  name: string;
  nameNe: string;
  capital: string;
  capitalNe: string;
  color: string;
}

export const PROVINCES: ProvinceInfo[] = [
  { id: 1, name: 'Koshi', nameNe: 'कोशी', capital: 'Biratnagar', capitalNe: 'विराटनगर', color: '#e05c4b' },
  { id: 2, name: 'Madhesh', nameNe: 'मधेश', capital: 'Janakpur', capitalNe: 'जनकपुरधाम', color: '#e8a13c' },
  { id: 3, name: 'Bagmati', nameNe: 'बागमती', capital: 'Hetauda', capitalNe: 'हेटौंडा', color: '#4caf6e' },
  { id: 4, name: 'Gandaki', nameNe: 'गण्डकी', capital: 'Pokhara', capitalNe: 'पोखरा', color: '#3fa3b8' },
  { id: 5, name: 'Lumbini', nameNe: 'लुम्बिनी', capital: 'Deukhuri', capitalNe: 'देउखुरी', color: '#7b68c8' },
  { id: 6, name: 'Karnali', nameNe: 'कर्णाली', capital: 'Birendranagar', capitalNe: 'बीरेन्द्रनगर', color: '#c95a9e' },
  { id: 7, name: 'Sudurpashchim', nameNe: 'सुदूरपश्चिम', capital: 'Godawari', capitalNe: 'गोदावरी', color: '#5a8fd4' },
];

/** Devanagari display names keyed by district id (from municipalities.json) */
export const DISTRICT_NE: Record<string, string> = {
  d_achham: 'अछाम',
  d_arghakhanchi: 'अर्घाखाँची',
  d_baglung: 'बागलुङ',
  d_baitadi: 'बैतडी',
  d_bajhang: 'बझाङ',
  d_bajura: 'बाजुरा',
  d_banke: 'बाँके',
  d_bara: 'बारा',
  d_bardiya: 'बर्दिया',
  d_bhaktapur: 'भक्तपुर',
  d_bhojpur: 'भोजपुर',
  d_chitawan: 'चितवन',
  d_dadeldhura: 'डडेलधुरा',
  d_dailekh: 'दैलेख',
  d_dang: 'दाङ',
  d_darchula: 'दार्चुला',
  d_dhading: 'धादिङ',
  d_dhankuta: 'धनकुटा',
  d_dhanusha: 'धनुषा',
  d_dolakha: 'दोलखा',
  d_dolpa: 'डोल्पा',
  d_doti: 'डोटी',
  d_gorkha: 'गोरखा',
  d_gulmi: 'गुल्मी',
  d_humla: 'हुम्ला',
  d_ilam: 'इलाम',
  d_jajarkot: 'जाजरकोट',
  d_jhapa: 'झापा',
  d_jumla: 'जुम्ला',
  d_kailali: 'कैलाली',
  d_kalikot: 'कालिकोट',
  d_kanchanpur: 'कञ्चनपुर',
  d_kapilbastu: 'कपिलवस्तु',
  d_kaski: 'कास्की',
  d_kathmandu: 'काठमाडौँ',
  d_kavrepalanchok: 'काभ्रेपलाञ्चोक',
  d_khotang: 'खोटाङ',
  d_lalitpur: 'ललितपुर',
  d_lamjung: 'लमजुङ',
  d_mahottari: 'महोत्तरी',
  d_makwanpur: 'मकवानपुर',
  d_manang: 'मनाङ',
  d_morang: 'मोरङ',
  d_mugu: 'मुगु',
  d_mustang: 'मुस्ताङ',
  d_myagdi: 'म्याग्दी',
  d_nawalpur: 'नवलपुर',
  d_nuwakot: 'नुवाकोट',
  d_okhaldhunga: 'ओखलढुङ्गा',
  d_palpa: 'पाल्पा',
  d_panchthar: 'पान्थर',
  d_parasi: 'परासी',
  d_parbat: 'पर्वत',
  d_parsa: 'पर्सा',
  d_pyuthan: 'प्युठान',
  d_ramechhap: 'रामेछाप',
  d_rasuwa: 'रसुवा',
  d_rautahat: 'रौतहट',
  d_rolpa: 'रोल्पा',
  d_rukum_east: 'रुकुम पूर्व',
  d_rukum_west: 'रुकुम पश्चिम',
  d_rupandehi: 'रुपन्देही',
  d_salyan: 'सल्यान',
  d_sankhuwasabha: 'संखुवासभा',
  d_saptari: 'सप्तरी',
  d_sarlahi: 'सर्लाही',
  d_sindhuli: 'सिन्धुली',
  d_sindhupalchok: 'सिन्धुपाल्चोक',
  d_siraha: 'सिराहा',
  d_solukhumbu: 'सोलुखुम्बु',
  d_sunsari: 'सुनसरी',
  d_surkhet: 'सुर्खेत',
  d_syangja: 'स्याङ्जा',
  d_tanahu: 'तनहुँ',
  d_taplejung: 'ताप्लेजुङ',
  d_terhathum: 'तेह्रथुम',
  d_udayapur: 'उदयपुर',
};

export function districtName(id: string, lang: 'ne' | 'en'): string {
  if (lang === 'ne' && DISTRICT_NE[id]) return DISTRICT_NE[id];
  return id.replace(/^d_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function provinceById(id: number): ProvinceInfo {
  return PROVINCES.find(p => p.id === id) ?? PROVINCES[0];
}
