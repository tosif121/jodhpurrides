-- Restore bus stop details (attractions, facilities, nearby landmarks, descriptions)
-- Based on City Bus Route No. 15: Gokul Ji Ki Pyau to Akhilya Circle
-- Run this in your Supabase SQL Editor

-- Gokul ji ki Pyau
UPDATE bus_stops 
SET 
  description = 'Starting point of the route, known for peaceful residential areas and easy accessibility',
  description_hi = 'मार्ग का प्रारंभिक बिंदु, शांत आवासीय क्षेत्रों और आसान पहुंच के लिए जाना जाता है',
  attractions = '["Mandore Gardens", "Mandore Fort Ruins", "Peaceful Residential Areas"]'::jsonb,
  attractions_hi = '["मंडोर गार्डन", "मंडोर किला खंडहर", "शांत आवासीय क्षेत्र"]'::jsonb,
  facilities = '["Bus Stop", "Drinking Water", "Easy Accessibility"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "पीने का पानी", "आसान पहुंच"]'::jsonb,
  nearby_landmarks = '["Mandore Gardens", "Residential Colonies"]'::jsonb,
  nearby_landmarks_hi = '["मंडोर गार्डन", "आवासीय कॉलोनियां"]'::jsonb
WHERE name = 'Gokul ji ki Pyau';

-- Kriti Nagar
UPDATE bus_stops 
SET 
  description = 'A rapidly growing residential locality with schools, shops, and convenient facilities',
  description_hi = 'स्कूलों, दुकानों और सुविधाजनक सुविधाओं के साथ तेजी से बढ़ता आवासीय इलाका',
  attractions = '["Schools", "Local Shopping Area", "Growing Residential Locality"]'::jsonb,
  attractions_hi = '["स्कूल", "स्थानीय शॉपिंग क्षेत्र", "बढ़ता आवासीय इलाका"]'::jsonb,
  facilities = '["Bus Stop", "Schools", "Shops", "Convenient Facilities"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "स्कूल", "दुकानें", "सुविधाजनक सुविधाएं"]'::jsonb,
  nearby_landmarks = '["Schools", "Local Markets", "Residential Area"]'::jsonb,
  nearby_landmarks_hi = '["स्कूल", "स्थानीय बाजार", "आवासीय क्षेत्र"]'::jsonb
WHERE name = 'Kriti Nagar';

-- Rama Sagar Circle
UPDATE bus_stops 
SET 
  description = 'A major connecting circle for travelers heading towards the old city and nearby areas',
  description_hi = 'पुराने शहर और आस-पास के क्षेत्रों की ओर जाने वाले यात्रियों के लिए एक प्रमुख कनेक्टिंग सर्कल',
  attractions = '["Rama Sagar Lake", "Gateway to Old City"]'::jsonb,
  attractions_hi = '["राम सागर झील", "पुराने शहर का प्रवेश द्वार"]'::jsonb,
  facilities = '["Bus Stop", "Major Junction", "Petrol Pump", "ATM"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "प्रमुख चौराहा", "पेट्रोल पंप", "एटीएम"]'::jsonb,
  nearby_landmarks = '["Rama Sagar Lake", "Connecting Point to Old City"]'::jsonb,
  nearby_landmarks_hi = '["राम सागर झील", "पुराने शहर से जुड़ने वाला बिंदु"]'::jsonb
WHERE name = 'Rama Sagar Circle';

-- Bhadasiya Bridge
UPDATE bus_stops 
SET 
  description = 'A crucial bridge that connects outer regions to central Jodhpur, easing traffic movement',
  description_hi = 'एक महत्वपूर्ण पुल जो बाहरी क्षेत्रों को केंद्रीय जोधपुर से जोड़ता है, यातायात को आसान बनाता है',
  attractions = '["Bridge View", "Connecting Point"]'::jsonb,
  attractions_hi = '["पुल का दृश्य", "कनेक्टिंग पॉइंट"]'::jsonb,
  facilities = '["Bus Stop", "Bridge Crossing"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "पुल क्रॉसिंग"]'::jsonb,
  nearby_landmarks = '["Bhadasiya Bridge", "Traffic Junction"]'::jsonb,
  nearby_landmarks_hi = '["भदासिया ब्रिज", "ट्रैफिक जंक्शन"]'::jsonb
WHERE name = 'Bhadasiya Bridge';

-- Nagori Gate Circle
UPDATE bus_stops 
SET 
  description = 'One of the most popular historic entry points to the old city, lined with shops, food stalls, and markets',
  description_hi = 'पुराने शहर के सबसे लोकप्रिय ऐतिहासिक प्रवेश बिंदुओं में से एक, दुकानों, खाने के स्टॉल और बाजारों से सजा हुआ',
  attractions = '["Historic Gate", "Old City Entrance", "Traditional Markets", "Food Stalls"]'::jsonb,
  attractions_hi = '["ऐतिहासिक द्वार", "पुराने शहर का प्रवेश", "पारंपरिक बाजार", "खाने के स्टॉल"]'::jsonb,
  facilities = '["Bus Stop", "Shops", "Food Stalls", "Markets", "Restaurants"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "दुकानें", "खाने के स्टॉल", "बाजार", "रेस्तरां"]'::jsonb,
  nearby_landmarks = '["Nagori Gate", "Old City Markets", "Food Street"]'::jsonb,
  nearby_landmarks_hi = '["नागौरी गेट", "पुराने शहर के बाजार", "फूड स्ट्रीट"]'::jsonb
WHERE name = 'Nagori Gate Circle';

-- Mahamandir Circle
UPDATE bus_stops 
SET 
  description = 'Known for its ancient temples and cultural significance, attracting both locals and tourists',
  description_hi = 'अपने प्राचीन मंदिरों और सांस्कृतिक महत्व के लिए जाना जाता है, स्थानीय लोगों और पर्यटकों दोनों को आकर्षित करता है',
  attractions = '["Mahamandir Temple", "Ancient Temples", "Cultural Sites", "Religious Significance"]'::jsonb,
  attractions_hi = '["महामंदिर मंदिर", "प्राचीन मंदिर", "सांस्कृतिक स्थल", "धार्मिक महत्व"]'::jsonb,
  facilities = '["Bus Stop", "Temple", "Parking", "Religious Facilities"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "मंदिर", "पार्किंग", "धार्मिक सुविधाएं"]'::jsonb,
  nearby_landmarks = '["Mahamandir Temple", "Cultural Heritage Sites", "Tourist Attraction"]'::jsonb,
  nearby_landmarks_hi = '["महामंदिर मंदिर", "सांस्कृतिक विरासत स्थल", "पर्यटक आकर्षण"]'::jsonb
WHERE name = 'Mahamandir Circle';

-- Paota
UPDATE bus_stops 
SET 
  description = 'A major bus hub and marketplace, making it a frequent boarding and deboarding location for students and daily commuters',
  description_hi = 'एक प्रमुख बस हब और बाजार, छात्रों और दैनिक यात्रियों के लिए बार-बार चढ़ने और उतरने का स्थान',
  attractions = '["Major Bus Hub", "Marketplace", "Student Hub", "Commercial Area"]'::jsonb,
  attractions_hi = '["प्रमुख बस हब", "बाजार", "छात्र हब", "व्यावसायिक क्षेत्र"]'::jsonb,
  facilities = '["Bus Stop", "Bus Hub", "Market", "Shops", "ATM", "Restaurants", "Libraries"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "बस हब", "बाजार", "दुकानें", "एटीएम", "रेस्तरां", "पुस्तकालय"]'::jsonb,
  nearby_landmarks = '["Paota Market", "Coaching Centers", "Libraries", "Commercial Shops"]'::jsonb,
  nearby_landmarks_hi = '["पाओटा मार्केट", "कोचिंग सेंटर", "पुस्तकालय", "व्यावसायिक दुकानें"]'::jsonb
WHERE name = 'Paota';

-- Ghanta Ghar (Clock Tower)
UPDATE bus_stops 
SET 
  description = 'The heart of Jodhpur. Surrounded by the famous Sardar Market, spices, handicrafts, eateries, and heritage vibes',
  description_hi = 'जोधपुर का दिल। प्रसिद्ध सरदार मार्केट, मसाले, हस्तशिल्प, भोजनालय और विरासत के माहौल से घिरा हुआ',
  attractions = '["Clock Tower", "Sardar Market", "Spice Market", "Handicrafts", "Heritage Site", "Shopping Area", "Rajasthani Textiles"]'::jsonb,
  attractions_hi = '["घंटाघर", "सरदार मार्केट", "मसाला बाजार", "हस्तशिल्प", "विरासत स्थल", "शॉपिंग क्षेत्र", "राजस्थानी वस्त्र"]'::jsonb,
  facilities = '["Bus Stop", "Market", "Restaurants", "ATM", "Parking", "Eateries", "Shopping"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "बाजार", "रेस्तरां", "एटीएम", "पार्किंग", "भोजनालय", "शॉपिंग"]'::jsonb,
  nearby_landmarks = '["Clock Tower", "Sardar Market", "Mehrangarh Fort View", "Spice Bazaar", "Handicraft Shops"]'::jsonb,
  nearby_landmarks_hi = '["घंटाघर", "सरदार मार्केट", "मेहरानगढ़ किला दृश्य", "मसाला बाजार", "हस्तशिल्प की दुकानें"]'::jsonb
WHERE name = 'Ghanta Ghar';

-- Jalori Gate
UPDATE bus_stops 
SET 
  description = 'A busy commercial spot with coaching institutes, cafes, and retail stores—popular among youngsters',
  description_hi = 'कोचिंग संस्थानों, कैफे और रिटेल स्टोर के साथ एक व्यस्त व्यावसायिक स्थान—युवाओं में लोकप्रिय',
  attractions = '["Historic Gate", "Traditional Market", "Coaching Institutes", "Cafes", "Youth Hub"]'::jsonb,
  attractions_hi = '["ऐतिहासिक द्वार", "पारंपरिक बाजार", "कोचिंग संस्थान", "कैफे", "युवा हब"]'::jsonb,
  facilities = '["Bus Stop", "Coaching Institutes", "Cafes", "Retail Stores", "Bakeries", "Eateries"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "कोचिंग संस्थान", "कैफे", "रिटेल स्टोर", "बेकरी", "भोजनालय"]'::jsonb,
  nearby_landmarks = '["Jalori Gate", "Spice Market", "Textile Shops", "Bakeries", "Local Eateries"]'::jsonb,
  nearby_landmarks_hi = '["जालोरी गेट", "मसाला बाजार", "कपड़े की दुकानें", "बेकरी", "स्थानीय भोजनालय"]'::jsonb
WHERE name = 'Jalori Gate';

-- Akhilya Circle
UPDATE bus_stops 
SET 
  description = 'The final stop of Route 15, connecting multiple residential colonies and giving easy access to nearby business zones',
  description_hi = 'रूट 15 का अंतिम पड़ाव, कई आवासीय कॉलोनियों को जोड़ता है और आस-पास के व्यावसायिक क्षेत्रों तक आसान पहुंच देता है',
  attractions = '["Shopping Complex", "Residential Colonies", "Business Zones", "Parks"]'::jsonb,
  attractions_hi = '["शॉपिंग कॉम्प्लेक्स", "आवासीय कॉलोनियां", "व्यावसायिक क्षेत्र", "पार्क"]'::jsonb,
  facilities = '["Bus Stop", "Shops", "Restaurants", "ATM", "Business Access"]'::jsonb,
  facilities_hi = '["बस स्टॉप", "दुकानें", "रेस्तरां", "एटीएम", "व्यावसायिक पहुंच"]'::jsonb,
  nearby_landmarks = '["Akhilya Circle Market", "Residential Colonies", "Business Zones"]'::jsonb,
  nearby_landmarks_hi = '["अखिल्या सर्कल मार्केट", "आवासीय कॉलोनियां", "व्यावसायिक क्षेत्र"]'::jsonb
WHERE name = 'Akhilya Circle';

-- Verify the updates
SELECT 
  name, 
  name_hi,
  description,
  jsonb_array_length(attractions) as attractions_count,
  jsonb_array_length(facilities) as facilities_count,
  jsonb_array_length(nearby_landmarks) as landmarks_count
FROM bus_stops 
WHERE is_active = true
ORDER BY name;
