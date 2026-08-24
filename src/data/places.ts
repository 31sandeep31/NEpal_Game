/**
 * Curated database of famous Nepali places for the "Kaha Chha?" guessing game.
 * tier 1 = iconic (everyone knows), 2 = well known, 3 = local gem
 * cat: heritage | nature | lake | mountain | city | viewpoint
 */
export interface Place {
  id: string;
  name: string;
  nameNe: string;
  lat: number;
  lng: number;
  districtId: string;
  province: number;
  cat: 'heritage' | 'nature' | 'lake' | 'mountain' | 'city' | 'viewpoint';
  tier: 1 | 2 | 3;
  factEn: string;
  factNe: string;
}

const P = (
  id: string, name: string, nameNe: string, lat: number, lng: number,
  districtId: string, province: number,
  cat: Place['cat'], tier: Place['tier'],
  factEn: string, factNe: string
): Place => ({ id, name, nameNe, lat, lng, districtId, province, cat, tier, factEn, factNe });

export const PLACES: Place[] = [
  // ---------- Kathmandu Valley ----------
  P('pashupatinath', 'Pashupatinath Temple', 'पशुपतिनाथ मन्दिर', 27.7105, 85.3483, 'd_kathmandu', 3, 'heritage', 1, 'UNESCO site on the Bagmati river; one of the holiest Shiva shrines in the world.', 'बागमती नदी किनारमा रहेको विश्व सम्पदा क्षेत्र; विश्वकै सबैभन्दा पवित्र शिव मन्दिरहरूमध्ये एक।'),
  P('boudhanath', 'Boudhanath Stupa', 'बौद्धनाथ स्तूप', 27.7215, 85.3620, 'd_kathmandu', 3, 'heritage', 1, 'One of the largest Buddhist stupas on Earth, eyes watching all four directions.', 'विश्वकै ठूला बौद्ध स्तूपहरूमध्ये एक; चारै दिशामा बुद्धको नेत्र अङ्कित।'),
  P('swayambhu', 'Swayambhunath', 'स्वयम्भूनाथ', 27.7148, 85.2903, 'd_kathmandu', 3, 'heritage', 1, '"The Monkey Temple" — over 2,000 years old, sits atop a hill west of Kathmandu.', '"सर्वे मन्दिर" भनिने २००० वर्षभन्दा पुरानो स्तूप, काठमाडौँको पश्चिम डाँडामा।'),
  P('ktm_durbarsq', 'Kathmandu Durbar Square', 'काठमाडौँ दरबार क्षेत्र', 27.7045, 85.3073, 'd_kathmandu', 3, 'heritage', 2, 'Royal palace square where kings of Kathmandu were crowned; home of the living goddess Kumari.', 'काठमाडौँका राजाहरूको राज्याभिषेक हुने दरबार क्षेत्र; जीवित कुमारीको घर।'),
  P('dharahara', 'Dharahara Tower', 'धरहरा', 27.7014, 85.3131, 'd_kathmandu', 3, 'heritage', 2, 'The historic tower of Kathmandu, rebuilt after the 2015 earthquake.', 'काठमाडौँको ऐतिहासिक टावर, २०७२ को भूकम्पपछि पुनर्निर्माण।'),
  P('patan_durbar', 'Patan Durbar Square', 'पाटन दरबार क्षेत्र', 27.6727, 85.3252, 'd_lalitpur', 3, 'heritage', 2, 'Newari architecture masterpiece in Lalitpur, famed for Krishna Mandir in stone.', 'ललितपुरको नेवारी कलाको उत्कृष्ट नमुना; ढुङ्गाको कृष्ण मन्दिरका लागि प्रख्यात।'),
  P('bhaktapur_durbar', 'Bhaktapur Durbar Square', 'भक्तपुर दरबार क्षेत्र', 27.6710, 85.4298, 'd_bhaktapur', 3, 'heritage', 2, 'Home of Nyatapola — Nepal\'s tallest pagoda temple — and the famous Juju Dhau curd.', 'नेपालकै अग्लो पगोडा न्यातपोल मन्दिर र प्रसिद्ध जुजु धौको घर।'),
  P('changunarayan', 'Changu Narayan', 'चाँगुनारायण', 27.7159, 85.4236, 'd_bhaktapur', 3, 'heritage', 3, 'Oldest standing temple in Nepal, inscriptions date to 464 AD.', 'नेपालको सबैभन्दा पुरानो मन्दिर; इतिहास ४६४ ईस्वीसम्म पुग्छ।'),
  P('namobuddha', 'Namo Buddha', 'नमोबुद्ध', 27.5561, 85.4975, 'd_kavrepalanchok', 3, 'heritage', 3, 'Sacred hilltop where Prince Mahasatva offered his body to a hungry tigress.', 'जहाँ राजकुमार महासत्वले भोकाएको बाघकी आमालाई आफ्नो शरीर दान गरेका थिए।'),
  P('chandragiri', 'Chandragiri Hills', 'चन्द्रागिरि', 27.6667, 85.2167, 'd_kathmandu', 3, 'viewpoint', 2, 'Cable-car hill from where King Prithvi Narayan Shah looked at the valley he would conquer.', 'जहाँबाट पृथ्वीनारायण शाहले जित्ने उद्देश्यले उपत्यका नियालेका थिए; केबलकारका लागि प्रसिद्ध।'),
  P('budhanilkantha', 'Budhanilkantha', 'बुढानीलकण्ठ', 27.7790, 85.3620, 'd_kathmandu', 3, 'heritage', 3, 'Giant sleeping Vishnu statue floating on a pond at the valley\'s northern edge.', 'उपत्यकाको उत्तरमा पोखरीमा सुतेको विशाल भगवान् विष्णुको मूर्ति।'),
  P('phulchowki', 'Phulchowki', 'फूलचोकी', 27.5900, 85.4200, 'd_lalitpur', 3, 'mountain', 3, 'Highest hill around the valley (2,762 m), a birdwatcher\'s paradise.', 'उपत्यकाको सबैभन्दा अग्लो डाँडा (२,७६२ मि.); चरा अवलोकनका लागि उत्तम।'),
  P('godawari', 'Godawari Botanical Garden', 'गोदावरी वनस्पति उद्यान', 27.5936, 85.3831, 'd_lalitpur', 3, 'nature', 3, 'Botanical garden at the foot of Phulchowki with hundreds of plant species.', 'फूलचोकीको फेदमा रहेको सयौँ वनस्पति भएको वनस्पति उद्यान।'),
  P('nagarkot', 'Nagarkot', 'नागार्कोट', 27.7186, 85.5192, 'd_bhaktapur', 3, 'viewpoint', 2, 'Sunrise viewpoint where Everest glows on clear mornings.', 'सफा बिहान एवरेस्टको सूर्योदय देखिने प्रसिद्ध अवलोकन स्थल।'),
  P('dhulikhel', 'Dhulikhel', 'धुलिखेल', 27.6160, 85.5520, 'd_kavrepalanchok', 3, 'city', 3, 'Historic Newari town on the old trade road to Tibet.', 'तिब्बत जाने पुरानो व्यापारिक बाटोमा रहेको ऐतिहासिक नेवारी नगरी।'),

  // ---------- Gandaki ----------
  P('pokhara', 'Pokhara Lakeside', 'पोखरा लेकसाइड', 28.2096, 83.9556, 'd_kaski', 4, 'city', 1, 'Tourism capital beneath Machhapuchhre; gateway to Annapurna treks.', 'माछापुच्छ्रे मुनिको पर्यटन राजधानी; अन्नपूर्ण ट्रेकको मुख्यद्वार।'),
  P('phewa', 'Phewa Lake', 'फेवाताल', 28.2096, 83.9156, 'd_kaski', 4, 'lake', 1, 'Nepal\'s second-largest lake, Tal Barahi temple floats at its center.', 'नेपालको दोस्रो ठूलो ताल; केन्द्रमा ताल बाराही मन्दिर छ।'),
  P('shantistupa', 'World Peace Pagoda', 'शान्ति स्तूप', 28.2053, 83.9428, 'd_kaski', 4, 'heritage', 2, 'White stupa on Anadu Hill with panoramic views of the Annapurna range.', 'अनाडू डाँडामा रहेको सेतो स्तूपबाट अन्नपूर्ण हिमशृङ्खलाको मनोरम दृश्य।'),
  P('davis_falls', 'Davis Falls (Patale Chhango)', 'पातले छाँगो (डेभिस झरना)', 28.2078, 83.9103, 'd_kaski', 4, 'nature', 2, 'A waterfall that vanishes into an underground tunnel.', 'जमिनमुनि हराउने रहस्यमय झरना।'),
  P('machhapuchhre', 'Machhapuchhre', 'माछापुच्छ्रे', 28.5031, 83.9486, 'd_kaski', 4, 'mountain', 1, 'The sacred "Fishtail" peak (6,993 m) no one is allowed to climb.', 'पवित्र "माछाको पुच्छर" चुचुरो (६,९९३ मि.), जुन आरोहणमा निषेध छ।'),
  P('annapurna', 'Annapurna I', 'अन्नपूर्ण १', 28.5961, 83.8203, 'd_kaski', 4, 'mountain', 1, 'First 8,000 m peak ever climbed (1950) — and among the deadliest.', 'सर्वप्रथम आरोहण गरिएको ८,००० मि. अग्लो हिमाल (१९५०)।'),
  P('abc', 'Annapurna Base Camp', 'अन्नपूर्ण आधार शिविर', 28.5317, 83.8889, 'd_kaski', 4, 'viewpoint', 2, 'Natural amphitheatre of peaks at 4,130 m called the Annapurna Sanctuary.', '४,१३० मि. मा रहेको हिमालले घेरिएको प्राकृतिक रंगशाला।'),
  P('ghandruk', 'Ghandruk', 'घान्द्रुक', 28.3353, 83.7967, 'd_kaski', 4, 'city', 3, 'Beautiful Gurung village famous for its cultural homestays.', 'गुरुङ संस्कृतिका लागि प्रसिद्ध सुन्दर गाउँ।'),
  P('poonhill', 'Poon Hill', 'पून हिल', 28.3947, 83.6839, 'd_myagdi', 4, 'viewpoint', 2, 'Legendary sunrise spot above Ghorepani rhododendron forests.', 'घोरेपानीको लालीगुराँस वन माथिको प्रसिद्ध सूर्योदय अवलोकन स्थल।'),
  P('dhaulagiri', 'Dhaulagiri I', 'धौलागिरि १', 28.6986, 83.4931, 'd_myagdi', 4, 'mountain', 2, 'Seventh highest mountain in the world (8,167 m).', 'विश्वको सातौँ अग्लो हिमाल (८,१६७ मि.)।'),
  P('manakamana', 'Manakamana Temple', 'मनकामना मन्दिर', 27.8481, 84.4380, 'd_gorkha', 4, 'heritage', 1, 'Wish-fulfilling goddess reached by Nepal\'s first cable car.', 'नेपालको पहिलो केबलकार पुग्ने मनोकामना पूरा गर्ने देवीको मन्दिर।'),
  P('gorkha_durbar', 'Gorkha Durbar', 'गोरखा दरबार', 28.0022, 84.6269, 'd_gorkha', 4, 'heritage', 2, 'Palace-fort of Prithvi Narayan Shah — birthplace of unified Nepal.', 'पृथ्वीनारायण शाहको दरबार — एकीकृत नेपालको उद्गमस्थल।'),
  P('manaslu', 'Mount Manaslu', 'मनास्लु हिमाल', 28.5494, 84.5619, 'd_gorkha', 4, 'mountain', 2, 'Eighth highest peak (8,163 m), "Mountain of the Spirit".', 'विश्वको आठौँ अग्लो हिमाल (८,१६३ मि.)।'),
  P('bandipur', 'Bandipur', 'बन्दीपुर', 27.8814, 84.4106, 'd_tanahu', 4, 'city', 2, 'Living museum of Newari culture on a Magar ridge-top town.', 'मगर डाँडामा बसेको नेवारी संस्कृतिको जीवित संग्रहालय।'),
  P('devghat', 'Devghat Dham', 'देवघाट धाम', 27.7500, 84.4167, 'd_tanahu', 4, 'heritage', 3, 'Holy confluence of the Trishuli and Kali Gandaki rivers.', 'त्रिशुली र कालीगण्डकी नदीको पवित्र संगम।'),
  P('tilicho', 'Tilicho Lake', 'तिलिचो ताल', 28.6886, 83.9086, 'd_manang', 4, 'lake', 2, 'One of the world\'s highest lakes at 4,919 m.', 'विश्वकै अग्ला तालहरूमध्ये एक (४,९१९ मि.)।'),
  P('manang_village', 'Manang', 'मनाङ', 28.6667, 84.0167, 'd_manang', 4, 'city', 3, 'Trans-Himalayan village on the Annapurna Circuit, rain-shadow desert.', 'अन्नपूर्ण सर्किटको वर्षछाया क्षेत्रमा रहेको गाउँ।'),
  P('thorongla', 'Thorong La Pass', 'थोरोङ ला पास', 28.7947, 83.9364, 'd_manang', 4, 'viewpoint', 3, 'Famous trekking pass at 5,416 m on the Annapurna Circuit.', 'अन्नपूर्ण सर्किटको प्रसिद्ध ५,४१६ मि. अग्लो घुम्ती।'),
  P('muktinath', 'Muktinath Temple', 'मुक्तिनाथ मन्दिर', 28.8164, 83.8725, 'd_mustang', 4, 'heritage', 2, 'Sacred to Hindus AND Buddhists; 108 ice-cold water spouts.', 'हिन्दू र बौद्ध दुवैका लागि पवित्र; १०८ वटा हिम-शीतल धारा।'),
  P('jomsom', 'Jomsom', 'जोमसोम', 28.7833, 83.7333, 'd_mustang', 4, 'city', 3, 'Windy trans-Himalayan town in the Kali Gandaki gorge — the deepest gorge on Earth.', 'विश्वकै गहिरो कालीगण्डकी खोँचमा रहेको हावाले बहाउने सहर।'),
  P('lomanthang', 'Lo Manthang', 'लोमान्थाङ', 29.2256, 83.9786, 'd_mustang', 4, 'heritage', 3, 'Walled medieval capital of the former Kingdom of Lo (Upper Mustang).', 'पुरानो लो राज्यको पर्खालले घेरिएको राजधानी (माथिल्लो मुस्ताङ)।'),
  P('kalinchowk', 'Kalinchowk Bhagawati', 'कालिञ्चोक भगवती', 27.7097, 86.0819, 'd_dolakha', 3, 'heritage', 3, 'Hilltop shrine and snow-play spot with Himalayan panorama.', 'हिमाली दृश्य देखिने डाँडाको मन्दिर र हिउँ खेल्ने थलो।'),
  P('gaurishankar', 'Gaurishankar', 'गौरीशंकर', 27.8833, 86.1333, 'd_dolakha', 3, 'mountain', 3, 'Sacred twin summit (7,134 m) named after Shiva and Parvati.', 'शिव-पार्वतीको नाममा रहेको पवित्र जोडी चुचुरो (७,१३४ मि.)।'),

  // ---------- Lumbini / Buddha circuit ----------
  P('lumbini', 'Lumbini', 'लुम्बिनी', 27.4694, 83.2755, 'd_rupandehi', 5, 'heritage', 1, 'Birthplace of Gautam Buddha — UNESCO World Heritage Site since 1997.', 'गौतम बुद्धको जन्मस्थल; सन् १९९७ देखि विश्व सम्पदा क्षेत्र।'),
  P('tilaurakot', 'Tilaurakot', 'तिलौराकोट', 27.5711, 83.2911, 'd_kapilbastu', 5, 'heritage', 3, 'Archaeological ruins believed to be ancient Kapilavastu, Buddha\'s childhood palace city.', 'बुद्धको बाल्यकाल बितेको प्राचीन कपिलवस्तुको अवशेष।'),
  P('ramgram', 'Ramgram Stupa', 'रामग्राम स्तूप', 27.4936, 83.6767, 'd_parasi', 5, 'heritage', 3, 'The only Buddha relic stupa left unopened, still buried under an earthen mound.', 'बुद्धको अस्थि रहेको एकमात्र नखोलिएको स्तूप।'),
  P('butwal', 'Butwal', 'बुटवल', 27.7000, 83.4486, 'd_rupandehi', 5, 'city', 2, 'Busy trade hub where the hills meet the Terai.', 'पहाड र तराई जोडिने व्यापारिक सहर।'),
  P('siddharthanagar', 'Siddharthanagar (Bhairahawa)', 'सिद्धार्थनगर (भैरहवा)', 27.5000, 83.4167, 'd_rupandehi', 5, 'city', 3, 'Gateway city to Lumbini with an international airport.', 'लुम्बिनी जाने ढोका; अन्तर्राष्ट्रिय विमानस्थल भएको सहर।'),
  P('tansen', 'Tansen (Palpa)', 'तानसेन (पाल्पा)', 27.8711, 83.5536, 'd_palpa', 5, 'city', 2, 'Hill town of dhaka fabric, Rani Mahal ("Nepal\'s Taj Mahal") lies below in the Kali Gandaki.', 'ढाका कपडाको पहाडी सहर; तल कालीगण्डकीमा "नेपालको ताजमहल" रानी महल छ।'),
  P('kapilvastu_devdaha', 'Devdaha', 'देवदह', 27.6411, 83.4725, 'd_rupandehi', 5, 'heritage', 3, 'Maternal home of Buddha\'s wife Yashodhara.', 'बुद्धकी धर्मपत्नी यशोधराको माइती घर।'),
  P('resunga', 'Resunga Hill', 'रेसुङ्गा', 27.9972, 83.5889, 'd_gulmi', 5, 'viewpoint', 3, 'Sacred hill of Gulmi with sweeping views over the western hills.', 'गुल्मीको पवित्र डाँडा; पश्चिम पहाडको विशाल दृश्य।'),
  P('bageshwori', 'Bageshwori Temple', 'बागेश्वरी मन्दिर', 28.0522, 81.6242, 'd_banke', 5, 'heritage', 3, 'Major Shakti shrine in Nepalgunj with a unique Ganesha statue.', 'नेपालगञ्जको प्रमुख शक्तिपीठ; अनौठो गणेश मूर्तिका लागि प्रसिद्ध।'),
  P('thabang', 'Thabang', 'थाबाङ', 28.4086, 82.7917, 'd_rolpa', 5, 'city', 3, 'Village known as the heartland of Magar culture and Kaura dance.', 'मगर संस्कृति र कौडा नाचको धर्ती भनिने गाउँ।'),
  P('swargadwari', 'Swargadwari', 'स्वर्गद्वार', 28.2222, 82.4444, 'd_pyuthan', 5, 'heritage', 3, 'Hilltop pilgrimage where cows are said to lead souls toward heaven.', 'गाईहरू आत्मालाई स्वर्ग लैजाने विश्वास गरिने डाँडाको धार्मिक स्थल।'),
  P('dang_valley', 'Dang Valley', 'दाङ उपत्यका', 27.8500, 82.5000, 'd_dang', 5, 'nature', 3, 'Largest valley of the Chure range; deepest valley of Nepal by some measures.', 'चुरे शृङ्खलाको सबैभन्दा ठूलो उपत्यका।'),
  P('bardiya_np', 'Bardiya National Park', 'बर्दिया राष्ट्रिय निकुञ्ज', 28.4000, 81.5000, 'd_bardiya', 5, 'nature', 2, 'Best wild-tiger sighting odds in Nepal, plus Gangetic dolphins in the Karnali.', 'जङ्गली बाघ र गाङ्गेटिक डल्फिन देखिने राष्ट्रिय निकुञ्ज।'),

  // ---------- Bagmati outer ----------
  P('gosaikunda', 'Gosaikunda Lake', 'गोसाइँकुण्ड', 28.0914, 85.4183, 'd_rasuwa', 3, 'lake', 2, 'Alpine holy lake born, legend says, when Shiva struck the rock with his trident.', 'शिवले त्रिशूल घोप्टाउँदा जन्मेको भन्ने विश्वास गरिने पवित्र हिमताल।'),
  P('langtang', 'Langtang Valley', 'लाङटाङ उपत्यका', 28.2500, 85.6500, 'd_rasuwa', 3, 'nature', 2, '"Valley of Glaciers", rebuilt by its resilient Tamang community after 2015.', '"हिमनदीको उपत्यका"; २०७२ पछि तामाङ समुदायले पुनर्जागृत गरेको क्षेत्र।'),
  P('sauraha', 'Sauraha', 'सौराहा', 27.5806, 84.4986, 'd_chitawan', 3, 'city', 2, 'Elephant-and-jungle tourism village beside Chitwan National Park.', 'चितवन निकुञ्ज छेउको पर्यटकीय गाउँ; हात्ती सफारीका लागि प्रसिद्ध।'),
  P('beeshazari', 'Beeshazari Taal', 'बीसहजारी ताल', 27.6083, 84.5333, 'd_chitawan', 3, 'lake', 3, 'Ramsar wetland of twenty thousand lakes teeming with birdlife.', '२० हजार पोखरी भएको, चराचुरुङ्गीले भरिएको रामसर क्षेत्र।'),
  P('hetauda', 'Hetauda', 'हेटौंडा', 27.4289, 85.0322, 'd_makwanpur', 3, 'city', 3, 'Planned industrial city, capital of Bagmati Province.', 'बागमती प्रदेशको राजधानी तथा औद्योगिक सहर।'),
  P('daman', 'Daman', 'दामन', 27.6086, 85.0794, 'd_makwanpur', 3, 'viewpoint', 3, 'Claims one of the most spectacular Everest-range panoramas anywhere.', 'एभरेस्ट शृङ्खलाकै उत्कृष्ट दृश्य देखिने स्थानमध्ये एक।'),
  P('kakani', 'Kakani', 'काकनी', 27.8019, 85.2419, 'd_nuwakot', 3, 'viewpoint', 3, 'Strawberry farms and Ganesh Himal viewpoints north of the valley.', 'उपत्यका उत्तरको असली हिमाल दृश्य र स्ट्रबेरी खेतीको थलो।'),

  // ---------- Everest & eastern hills ----------
  P('everest', 'Mount Everest (Sagarmatha)', 'सगरमाथा', 27.9881, 86.9250, 'd_solukhumbu', 1, 'mountain', 1, 'Earth\'s highest point at 8,848.86 m — called Sagarmatha "Forehead of the Sky".', 'विश्वको सर्वोच्च शिखर (८,८४८.८६ मि.) — "आकाशको मस्तक"।'),
  P('ebc', 'Everest Base Camp', 'एभरेस्ट आधार शिविर', 28.0029, 86.8528, 'd_solukhumbu', 1, 'viewpoint', 2, 'The dream destination of trekkers worldwide at 5,364 m.', '५,३६४ मि. मा रहेको विश्वभरका ट्रेकरहरूको सपनाको गन्तव्य।'),
  P('namche', 'Namche Bazaar', 'नाम्चे बजार', 27.8069, 86.7142, 'd_solukhumbu', 1, 'city', 2, 'Sherpa capital tucked in a natural amphitheatre of mountains.', 'शेर्पाहरूको राजधानी; हिमालले घेरिएको सुन्दर बजार।'),
  P('lukla', 'Lukla Airport', 'लुक्ला विमानस्थल', 27.6871, 86.7319, 'd_solukhumbu', 1, 'city', 3, 'Famously one of the world\'s most thrilling runway landings.', 'विश्वकै रोमाञ्चक अवतरणका लागि प्रसिद्ध विमानस्थल।'),
  P('makalu', 'Mount Makalu', 'मकालु हिमाल', 27.8897, 87.0886, 'd_sankhuwasabha', 1, 'mountain', 3, 'Fifth highest mountain (8,485 m), a perfect four-sided pyramid.', 'विश्वको पाँचौँ अग्लो (८,४८५ मि.), चारैतिरबाट पिरामिडजस्तो देखिने हिमाल।'),
  P('kanchenjunga', 'Kanchenjunga', 'कन्चनजङ्घा', 27.7025, 88.1475, 'd_taplejung', 1, 'mountain', 2, 'World\'s third highest (8,586 m), guardian deity of Limbu people.', 'विश्वको तेस्रो अग्लो हिमाल (८,५८६ मि.); लिम्बूहरूको रक्षक देवता।'),
  P('pathivara', 'Pathibhara Devi', 'पाथीभरा देवी', 27.4597, 87.7925, 'd_taplejung', 1, 'heritage', 2, 'Powerful hilltop goddess worshipped by Limbus, Sherpas and all Nepalis.', 'लिम्बू, शेर्पा र सबै नेपालीले पूजा गर्ने शक्तिशाली देवी।'),
  P('halesi', 'Halesi Mahadev (Maratika)', 'हलेसी महादेव', 27.3972, 86.7014, 'd_khotang', 1, 'heritage', 3, 'Cave temple where Padmasambhava is said to have attained immortality.', 'पद्मसम्भवले अमरत्व प्राप्त गरेको भनिने गुफा मन्दिर।'),
  P('ilam', 'Ilam Tea Gardens', 'इलामका चियाबारी', 26.9095, 87.9297, 'd_ilam', 1, 'nature', 2, 'Rolling emerald tea country producing Nepal\'s finest orthodox tea.', 'नेपालको उत्कृष्ट चिया उत्पादन हुने हरिया चियाबारीहरू।'),
  P('antu', 'Antu Danda', 'अन्तुडाँडा', 26.8642, 88.0317, 'd_ilam', 1, 'viewpoint', 3, 'First place in Nepal to catch the sunrise each morning.', 'नेपालमा सबैभन्दा पहिले सूर्योदय देखिने स्थान।'),
  P('maipokhari', 'Mai Pokhari', 'माईपोखरी', 26.9847, 87.9333, 'd_ilam', 1, 'lake', 3, 'Nine-cornered sacred lake, a Ramsar wetland wrapped in orchids.', 'फूलपातले घेरिएको, नौ कुना भएको पवित्र ताल।'),
  P('kanyam', 'Kanyam', 'कन्याम', 26.8006, 88.0864, 'd_ilam', 1, 'viewpoint', 3, 'Film-famous tea gardens where Bollywood shoots among the mists.', 'फिल्म छायांकनका लागि प्रसिद्ध धुँधलो चियाबारी।'),
  P('biratnagar', 'Biratnagar', 'विराटनगर', 26.4550, 87.2718, 'd_morang', 1, 'city', 2, 'Industrial capital of Nepal and home of the first factory strike that sparked democracy movements.', 'नेपालको औद्योगिक राजधानी; लोकतन्त्र आन्दोलनको सुरुवात भएको सहर।'),
  P('dharan', 'Dharan', 'धरान', 26.8065, 87.2846, 'd_sunsari', 1, 'city', 2, 'Gateway to the eastern hills, famed for football and its British-Gurkha recruiting centre.', 'पूर्वी पहाडको ढोका; फुटबल र लाहुरे भर्ती केन्द्रका लागि प्रख्यात।'),
  P('barahachhetra', 'Barahachhetra', 'वराहक्षेत्र', 26.7167, 87.4667, 'd_sunsari', 1, 'heritage', 3, 'Where Varaha avatar is said to have slain the demon Hiranynaksha; confluence of Saptakoshi.', 'जहाँ भगवान् विष्णुले वराह अवतार लिएको विश्वास गरिने सप्तकोशी संगम।'),
  P('janakpur', 'Janaki Mandir, Janakpurdham', 'जानकी मन्दिर, जनकपुरधाम', 26.7288, 85.9265, 'd_dhanusha', 2, 'heritage', 1, 'Ornate Mughal-Rajput style temple marking the birthplace of Goddess Sita.', 'देवी सीताको जन्मस्थलमा रहेको भव्य मन्दिर; मधेशको धार्मिक राजधानी।'),
  P('dhanushadham', 'Dhanushadham', 'धनुषाधाम', 26.7714, 85.9211, 'd_dhanusha', 2, 'heritage', 3, 'Where pieces of Shiva\'s broken bow (Dhanush) are believed to rest.', 'शिवको भाँचिएको धनुषका टुक्राहरू रहेको विश्वास गरिने स्थान।'),
  P('jhapa_kankai', 'Kankai Mai', 'कन्काई माई', 26.6200, 87.8000, 'd_jhapa', 1, 'heritage', 3, 'River goddess shrine of the eastern Terai.', 'पूर्वी तराईको नदी देवीको मन्दिर।'),
  P('bhadrapur', 'Bhadrapur', 'भद्रपुर', 26.5442, 88.0917, 'd_jhapa', 1, 'city', 3, 'Old tea-town gateway to Darjeeling and the far eastern hills.', 'दार्जिलिङ र पूर्वी पहाड जाने ढोका; पुरानो चियापत्ती।'),
  P('udayapur_triuga', 'Triyuga & Udayapurgadhi', 'त्रियुगा, उदयपुरगढी', 27.2167, 86.4167, 'd_udayapur', 1, 'nature', 3, 'Valley of three rivers with historic fort ruins.', 'तीन नदी बहने उपत्यका; ऐतिहासिक गढीको अवशेष।'),
  P('terhathum_tinjure', 'Tinjure-Milke-Jaljale', 'तिनजुरे-मिल्के-जलझले', 27.1833, 87.4500, 'd_terhathum', 1, 'nature', 3, '"Rhododendron capital" — 33 species of Nepal\'s national flower bloom here.', '"लालीगुराँसको राजधानी"; राष्ट्रिय फूलका ३३ प्रजाति फुल्ने क्षेत्र।'),
  P('okhaldhunga_siddhicharan', 'Okhaldhunga', 'ओखलढुङ्गा', 27.3333, 86.5000, 'd_okhaldhunga', 1, 'city', 3, 'Birthplace of poet Siddhi Charan Shrestha, "Bhyagutey Kavi".', '"भ्यागुते कवि" सिद्धिचरण श्रेष्ठको जन्मस्थल।'),

  // ---------- Karnali / far-west ----------
  P('rara', 'Rara Lake', 'रारा ताल', 29.5322, 82.0861, 'd_mugu', 6, 'lake', 1, 'Nepal\'s largest lake — "a blue jewel dropped among pines".', 'नेपालको सबैभन्दा ठूलो ताल — "पाइनका बीचमा झरेको नीलो रत्न"।'),
  P('phoksundo', 'Shey-Phoksundo Lake', 'शे-फोक्सुण्डो ताल', 28.9756, 82.9583, 'd_dolpa', 6, 'lake', 2, 'Deepest lake of Nepal, impossibly turquoise, ringed by Bon-po villages.', 'नेपालको गहिरो ताल; अविश्वसनीय फिरोजी रङको, बोन धर्मावलम्बी गाउँले घेरिएको।'),
  P('shey_gompa', 'Shey Gompa (Crystal Mountain)', 'शे गुम्बा', 29.0667, 82.9500, 'd_dolpa', 6, 'heritage', 3, 'Remote monastery of Peter Matthiessen\'s classic "Snow Leopard".', '"स्नो लेपर्ड" पुस्तकमा चर्चित दुर्गम गुम्बा।'),
  P('sinja', 'Sinja Valley', 'सिन्जा उपत्यका', 29.3833, 82.0833, 'd_jumla', 6, 'heritage', 3, 'Cradle of the Nepali language itself — ancient Khas kingdom capital.', 'नेपाली भाषाकै उद्गमस्थल; प्राचीन खस राज्यको राजधानी।'),
  P('jumla', 'Jumla', 'जुम्ला', 29.2747, 82.1853, 'd_jumla', 6, 'city', 3, 'Apple orchards of the highlands; Marsyangdi apples come from here.', 'उच्च हिमाली क्षेत्रको स्याउबारीको घर।'),
  P('surkhet', 'Surkhet Valley', 'सुर्खेत उपत्यका', 28.6000, 81.6333, 'd_surkhet', 6, 'city', 3, 'Capital of Karnali Province, gateway to the mid-west.', 'कर्णाली प्रदेशको राजधानी; मध्यपश्चिमको ढोका।'),
  P('humla_simikot', 'Simikot, Humla', 'सिमिकोट, हुम्ला', 29.9667, 81.8333, 'd_humla', 6, 'city', 3, 'Highest district HQ town; trailhead toward Mount Kailash.', 'सबैभन्दा अग्लो जिल्ला सदरमुकाम; कैलाश जाने बाटोको सुरुवात।'),
  P('kanjiroba', 'Kanjiroba', 'कान्जिरोबा', 29.2167, 82.6667, 'd_mugu', 6, 'mountain', 3, 'Wild unnamed-by-many giant guarding Dolpo and Mugu.', 'डोल्पा र मुगुको रक्षक रहेको जङ्गली हिमशृङ्खला।'),
  P('rukum_syarpata', 'Sisne & Syarpata', 'सिस्ने, स्यार्पाता', 28.7000, 82.6000, 'd_rukum_east', 5, 'mountain', 3, 'The "unclimbed" virgin peak locals revere as home of deities.', 'स्थानीयले देवताको वास मान्ने, नओलिएको पवित्र हिमाल।'),
  P('shuklaphanta', 'Shuklaphanta National Park', 'शुक्लाफाँटा राष्ट्रिय निकुञ्ज', 28.8500, 80.2000, 'd_kanchanpur', 7, 'nature', 2, 'Grassland home to the world\'s largest herd of swamp deer.', 'विश्वकै सबैभन्दा ठूलो झाडीबारहसिङ्गा हरिणको बथान भएको घाँसे मैदान।'),
  P('bedkot', 'Bedkot Lake', 'बेडकोट ताल', 28.8386, 80.2903, 'd_kanchanpur', 7, 'lake', 3, 'Emerald lake beside the Indian border, ringed by sal forest.', 'भारतीय सीमा नजिक, सालक वनले घेरिएको हरित ताल।'),
  P('dhangadhi', 'Dhangadhi', 'धनगढी', 28.6983, 80.5898, 'd_kailali', 7, 'city', 2, 'Commercial heart of the far west, cricket-crazy city.', 'सुदूरपश्चिमको व्यापारिक र क्रिकेट-प्रेमी सहर।'),
  P('dadeldhura_ajameri', 'Ajmerukot Fort, Dadeldhura', 'अजमेरुकोट गढी', 29.3000, 80.5500, 'd_dadeldhura', 7, 'heritage', 3, 'Ruins of the fortress of Raika kings who resisted Gorkhali conquest for years.', 'गोरखाली सेनाको वर्षौँ प्रतिरोध गरेका राईका राजाहरूको गढीको अवशेष।'),
  P('mahendranagar', 'Mahendranagar (Bhimdatta)', 'महेन्द्रनगर (भिमदत्त)', 28.9636, 80.1219, 'd_kanchanpur', 7, 'city', 3, 'Far-western border city near the Dodhara-Chandani suspension bridges.', 'डोधारा-चाँदनी झोलुङ्गे पुल नजिकको सुदूरपश्चिमी सीमा सहर।'),
  P('api_himal', 'Api Himal', 'आपि हिमाल', 29.8833, 80.9167, 'd_darchula', 7, 'mountain', 3, 'Majestic holy peak of the far northwest (7,132 m).', 'सुदूर उत्तर-पश्चिमको पवित्र र भव्य हिमाल (७,१३२ मि.)।'),
  P('doti_shaileshwori', 'Shaileshwori, Doti', 'शैलेश्वरी, डोटी', 29.2500, 80.9000, 'd_doti', 7, 'heritage', 3, 'Renowned Shakti Peeth of the Doti region.', 'डोटी क्षेत्रको प्रसिद्ध शक्तिपीठ।'),
  P('gaura_baitadi', 'Melauli Bhagawati, Baitadi', 'मेलाउली भगवती, बैतडी', 29.4667, 80.4667, 'd_baitadi', 7, 'heritage', 3, 'Ancient shrine central to the Gaura festival of the far west.', 'सुदूरपश्चिमको गौरा पर्वको केन्द्र रहेको प्राचीन मन्दिर।'),
];

/** Quick lookup */
export const placeById = Object.fromEntries(PLACES.map(p => [p.id, p]));
