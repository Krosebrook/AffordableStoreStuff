/**
 * Extended Niche Database v2.0
 * 50+ niches with 500+ sub-niches for maximum market coverage
 * 
 * Categories:
 * - Pets (expanded)
 * - Occupations (expanded)
 * - Hobbies & Interests
 * - Lifestyle & Values
 * - Parenting & Family
 * - Seasonal & Holidays
 * - Sports & Fitness
 * - Food & Drink
 * - Pop Culture (IP-safe)
 * - Academic & Professional
 */

export interface ExtendedNiche {
  name: string;
  category: string;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  seasonalBoost: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  recommendedProducts: string[];
  subNiches: string[];
  keywords: string[];
  avoidWords: string[];
  targetDemographic: string;
  pricePoint: 'budget' | 'mid' | 'premium';
  bestPlatforms: string[];
}

// Seasonal boost calendar
export const SEASONAL_CALENDAR: Record<number, { holidays: string[]; niches: string[] }> = {
  1: { // January
    holidays: ['New Year', 'MLK Day'],
    niches: ['fitness-motivation', 'organization', 'self-improvement', 'minimalism'],
  },
  2: { // February
    holidays: ['Valentine\'s Day', 'Black History Month'],
    niches: ['couples', 'love-quotes', 'galentines', 'self-love'],
  },
  3: { // March
    holidays: ['St. Patrick\'s Day', 'Women\'s History Month'],
    niches: ['irish-heritage', 'feminist', 'spring-gardening'],
  },
  4: { // April
    holidays: ['Easter', 'Earth Day'],
    niches: ['eco-activism', 'spring', 'religious', 'plant-parent'],
  },
  5: { // May
    holidays: ['Mother\'s Day', 'Cinco de Mayo', 'Memorial Day', 'Nurses Week', 'Teacher Appreciation'],
    niches: ['mom-life-humor', 'nurse-healthcare', 'teacher-appreciation', 'military-family'],
  },
  6: { // June
    holidays: ['Father\'s Day', 'Pride Month', 'Juneteenth', 'Graduation'],
    niches: ['dad-jokes', 'lgbtq-pride', 'graduation', 'summer-vibes'],
  },
  7: { // July
    holidays: ['Independence Day'],
    niches: ['patriotic', 'summer-vacation', 'beach-life', 'camping'],
  },
  8: { // August
    holidays: ['Back to School'],
    niches: ['teacher-appreciation', 'college-life', 'school-supplies'],
  },
  9: { // September
    holidays: ['Labor Day', 'Grandparents Day'],
    niches: ['fall-vibes', 'grandparents', 'pumpkin-spice'],
  },
  10: { // October
    holidays: ['Halloween', 'Breast Cancer Awareness'],
    niches: ['halloween', 'spooky', 'cancer-awareness', 'fall-aesthetic'],
  },
  11: { // November
    holidays: ['Veterans Day', 'Thanksgiving'],
    niches: ['military', 'gratitude', 'thanksgiving', 'friendsgiving'],
  },
  12: { // December
    holidays: ['Christmas', 'Hanukkah', 'Kwanzaa', 'New Year\'s Eve'],
    niches: ['christmas', 'holiday', 'winter', 'new-year'],
  },
};

export const EXTENDED_NICHES: Record<string, ExtendedNiche> = {
  // ═══════════════════════════════════════════════════════════════
  // PETS - Expanded (10 niches)
  // ═══════════════════════════════════════════════════════════════
  'dog-breed-specific': {
    name: 'dog-breed-specific',
    category: 'pets',
    demandScore: 92,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tote', 'pod_blanket', 'pod_ornament'],
    subNiches: [
      'golden-retriever', 'labrador', 'german-shepherd', 'french-bulldog', 'bulldog',
      'poodle', 'beagle', 'rottweiler', 'yorkshire-terrier', 'boxer',
      'dachshund', 'siberian-husky', 'great-dane', 'doberman', 'shih-tzu',
      'boston-terrier', 'bernese-mountain', 'cavalier-king-charles', 'shetland-sheepdog',
      'australian-shepherd', 'cocker-spaniel', 'pomeranian', 'border-collie', 'basset-hound',
      'maltese', 'chihuahua', 'pug', 'saint-bernard', 'newfoundland', 'akita'
    ],
    keywords: ['dog mom', 'dog dad', 'fur baby', 'puppy love', 'best friend', 'woof', 'paw prints'],
    avoidWords: ['aggressive', 'attack', 'bite', 'dangerous', 'fight'],
    targetDemographic: 'Dog owners 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon', 'redbubble'],
  },
  
  'cat-lovers': {
    name: 'cat-lovers',
    category: 'pets',
    demandScore: 88,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_poster', 'pod_blanket', 'pod_pillow'],
    subNiches: [
      'black-cat', 'orange-tabby', 'tuxedo-cat', 'calico', 'siamese',
      'persian', 'maine-coon', 'ragdoll', 'bengal', 'sphynx',
      'scottish-fold', 'british-shorthair', 'russian-blue', 'abyssinian', 'birman'
    ],
    keywords: ['cat mom', 'cat dad', 'crazy cat lady', 'meow', 'feline', 'purrfect', 'whiskers'],
    avoidWords: ['scratch', 'attack', 'mean'],
    targetDemographic: 'Cat owners 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'society6'],
  },
  
  'horse-equestrian': {
    name: 'horse-equestrian',
    category: 'pets',
    demandScore: 75,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_tote', 'pod_mug', 'pod_blanket'],
    subNiches: [
      'barrel-racing', 'dressage', 'show-jumping', 'western-riding', 'english-riding',
      'trail-riding', 'horse-mom', 'rodeo', 'polo', 'thoroughbred',
      'quarter-horse', 'arabian', 'mustang', 'appaloosa', 'clydesdale'
    ],
    keywords: ['horse girl', 'equestrian life', 'barn life', 'saddle up', 'gallop', 'stable'],
    avoidWords: ['whip', 'spur', 'abuse'],
    targetDemographic: 'Horse enthusiasts 15-45, predominantly female',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'bird-lovers': {
    name: 'bird-lovers',
    category: 'pets',
    demandScore: 68,
    competitionLevel: 'low',
    seasonalBoost: 1.1,
    trendDirection: 'rising',
    recommendedProducts: ['pod_mug', 'pod_poster', 'pod_tshirt', 'digital_printable'],
    subNiches: [
      'parrot', 'cockatiel', 'parakeet', 'macaw', 'cockatoo',
      'lovebird', 'canary', 'finch', 'conure', 'african-grey',
      'chicken-keeper', 'duck-lover', 'hummingbird', 'owl-lover', 'birdwatcher'
    ],
    keywords: ['bird mom', 'bird dad', 'feathered friend', 'flock', 'chirp', 'wings'],
    avoidWords: ['cage', 'trap', 'hunt'],
    targetDemographic: 'Bird owners and enthusiasts 30-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'reptile-exotic': {
    name: 'reptile-exotic',
    category: 'pets',
    demandScore: 62,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_poster', 'pod_sticker'],
    subNiches: [
      'bearded-dragon', 'leopard-gecko', 'ball-python', 'corn-snake', 'chameleon',
      'iguana', 'turtle', 'tortoise', 'crested-gecko', 'blue-tongue-skink',
      'axolotl', 'hermit-crab', 'tarantula', 'scorpion', 'frog-toad'
    ],
    keywords: ['reptile mom', 'scaly baby', 'cold blooded', 'herp life', 'terrarium'],
    avoidWords: ['venomous', 'dangerous', 'wild caught'],
    targetDemographic: 'Reptile enthusiasts 18-40',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'aquarium-fish': {
    name: 'aquarium-fish',
    category: 'pets',
    demandScore: 65,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_poster', 'pod_sticker'],
    subNiches: [
      'betta-fish', 'goldfish', 'tropical-fish', 'saltwater-reef', 'freshwater-planted',
      'cichlid', 'guppy', 'angelfish', 'discus', 'koi-pond',
      'shrimp-keeper', 'coral-reef', 'aquascaping'
    ],
    keywords: ['fish keeper', 'tank life', 'aquarist', 'reef tank', 'planted tank'],
    avoidWords: ['dead fish', 'fishing', 'catch'],
    targetDemographic: 'Aquarium hobbyists 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'rabbit-bunny': {
    name: 'rabbit-bunny',
    category: 'pets',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.5, // Easter boost
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_tote', 'pod_blanket'],
    subNiches: [
      'holland-lop', 'mini-rex', 'lionhead', 'flemish-giant', 'dutch-rabbit',
      'angora', 'netherland-dwarf', 'french-lop', 'bunny-mom'
    ],
    keywords: ['bunny mom', 'bunny dad', 'hoppy', 'fluffy', 'binkies', 'house rabbit'],
    avoidWords: ['hunt', 'wild', 'meat'],
    targetDemographic: 'Rabbit owners 20-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'small-pets': {
    name: 'small-pets',
    category: 'pets',
    demandScore: 60,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_sticker'],
    subNiches: [
      'hamster', 'guinea-pig', 'ferret', 'chinchilla', 'hedgehog',
      'rat', 'mouse', 'gerbil', 'sugar-glider', 'degu'
    ],
    keywords: ['pocket pet', 'small but mighty', 'tiny friend', 'wheel life'],
    avoidWords: ['pest', 'rodent problem', 'trap'],
    targetDemographic: 'Small pet owners 15-35',
    pricePoint: 'budget',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'pet-memorial': {
    name: 'pet-memorial',
    category: 'pets',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_ornament', 'pod_canvas', 'pod_blanket', 'digital_printable', 'pod_mug'],
    subNiches: [
      'rainbow-bridge', 'pet-loss', 'forever-in-heart', 'memorial-portrait',
      'paw-prints-heaven', 'angel-wings-pet', 'sympathy-gift'
    ],
    keywords: ['rainbow bridge', 'forever loved', 'until we meet again', 'paw prints on heart'],
    avoidWords: ['dead', 'died', 'death', 'kill'],
    targetDemographic: 'Pet owners grieving loss 30-65',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'multi-pet-household': {
    name: 'multi-pet-household',
    category: 'pets',
    demandScore: 74,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_tote', 'pod_doormat'],
    subNiches: [
      'dog-and-cat', 'crazy-animal-lady', 'zoo-keeper-life', 'pet-chaos',
      'fur-family', 'animal-lover', 'rescue-mom'
    ],
    keywords: ['zoo keeper', 'animal house', 'fur family', 'pet chaos', 'rescue squad'],
    avoidWords: ['hoarder', 'too many'],
    targetDemographic: 'Multi-pet households 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPATIONS - Expanded (15 niches)
  // ═══════════════════════════════════════════════════════════════
  'teacher-appreciation': {
    name: 'teacher-appreciation',
    category: 'occupation',
    demandScore: 85,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tote', 'pod_mug', 'pod_tshirt', 'pod_tumbler', 'digital_printable'],
    subNiches: [
      'elementary-teacher', 'middle-school-teacher', 'high-school-teacher',
      'math-teacher', 'science-teacher', 'english-teacher', 'history-teacher',
      'art-teacher', 'music-teacher', 'pe-teacher', 'special-ed-teacher',
      'substitute-teacher', 'preschool-teacher', 'kindergarten-teacher',
      'reading-specialist', 'esl-teacher', 'stem-teacher'
    ],
    keywords: ['teach', 'educator', 'classroom', 'inspire', 'shape minds', 'future'],
    avoidWords: ['worst', 'hate', 'boring', 'lazy'],
    targetDemographic: 'Teachers and gift-givers 25-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'nurse-healthcare': {
    name: 'nurse-healthcare',
    category: 'occupation',
    demandScore: 82,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tumbler', 'pod_tote', 'pod_badge-reel', 'pod_mug'],
    subNiches: [
      'registered-nurse', 'lpn-lvn', 'nurse-practitioner', 'er-nurse', 'icu-nurse',
      'nicu-nurse', 'labor-delivery', 'pediatric-nurse', 'oncology-nurse',
      'surgical-nurse', 'psych-nurse', 'home-health', 'travel-nurse',
      'nursing-student', 'charge-nurse', 'nurse-manager'
    ],
    keywords: ['nurse life', 'scrub life', 'hero', 'save lives', 'compassion', 'care'],
    avoidWords: ['death', 'dying', 'blood', 'gore'],
    targetDemographic: 'Nurses and nursing students 22-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'doctor-physician': {
    name: 'doctor-physician',
    category: 'occupation',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tumbler', 'digital_printable'],
    subNiches: [
      'medical-student', 'resident', 'attending', 'surgeon', 'pediatrician',
      'cardiologist', 'dermatologist', 'psychiatrist', 'family-medicine',
      'emergency-medicine', 'anesthesiologist', 'radiologist', 'pathologist'
    ],
    keywords: ['doctor life', 'MD', 'medical school', 'white coat', 'healing', 'medicine'],
    avoidWords: ['malpractice', 'death', 'kill'],
    targetDemographic: 'Physicians and medical students 25-60',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'firefighter-ems': {
    name: 'firefighter-ems',
    category: 'occupation',
    demandScore: 75,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_mug', 'pod_flag'],
    subNiches: [
      'firefighter', 'paramedic', 'emt', 'fire-wife', 'fire-family',
      'wildland-firefighter', 'volunteer-firefighter', 'fire-chief',
      'rescue-squad', 'first-responder'
    ],
    keywords: ['thin red line', 'hero', 'brave', 'fire life', 'rescue', 'courage'],
    avoidWords: ['burn', 'death', 'die'],
    targetDemographic: 'First responders and families 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'police-law-enforcement': {
    name: 'police-law-enforcement',
    category: 'occupation',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_flag', 'pod_hoodie'],
    subNiches: [
      'police-officer', 'deputy', 'detective', 'state-trooper', 'police-wife',
      'police-family', 'k9-handler', 'swat', 'corrections-officer', 'dispatcher'
    ],
    keywords: ['thin blue line', 'protect serve', 'badge', 'blue family', 'LEO'],
    avoidWords: ['defund', 'acab', 'brutality'],
    targetDemographic: 'Law enforcement and families 25-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'military-veteran': {
    name: 'military-veteran',
    category: 'occupation',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_flag', 'pod_mug', 'pod_hat'],
    subNiches: [
      'army', 'navy', 'air-force', 'marines', 'coast-guard', 'space-force',
      'national-guard', 'veteran', 'military-wife', 'military-mom',
      'military-kid', 'deployment', 'homecoming', 'retired-military'
    ],
    keywords: ['served', 'veteran', 'freedom', 'sacrifice', 'honor', 'duty', 'country'],
    avoidWords: ['war', 'kill', 'enemy', 'combat'],
    targetDemographic: 'Military members and families 20-70',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'lawyer-legal': {
    name: 'lawyer-legal',
    category: 'occupation',
    demandScore: 65,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tote', 'digital_printable'],
    subNiches: [
      'attorney', 'law-student', 'paralegal', 'public-defender', 'prosecutor',
      'judge', 'law-firm', 'bar-exam', 'jd-graduate', 'legal-assistant'
    ],
    keywords: ['esquire', 'objection', 'case closed', 'law school', 'bar exam', 'justice'],
    avoidWords: ['criminal', 'guilty', 'prison'],
    targetDemographic: 'Legal professionals and students 24-60',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'engineer-tech': {
    name: 'engineer-tech',
    category: 'occupation',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_hoodie', 'pod_sticker'],
    subNiches: [
      'software-engineer', 'mechanical-engineer', 'electrical-engineer',
      'civil-engineer', 'chemical-engineer', 'data-scientist', 'devops',
      'frontend-developer', 'backend-developer', 'full-stack', 'sysadmin',
      'cybersecurity', 'ai-ml-engineer', 'cloud-engineer'
    ],
    keywords: ['code', 'debug', 'deploy', 'build', 'engineer life', 'tech', 'developer'],
    avoidWords: ['hack', 'crash', 'fail'],
    targetDemographic: 'Engineers and tech workers 22-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'chef-culinary': {
    name: 'chef-culinary',
    category: 'occupation',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_apron', 'pod_tshirt', 'pod_mug', 'pod_towel'],
    subNiches: [
      'executive-chef', 'sous-chef', 'pastry-chef', 'line-cook', 'culinary-student',
      'home-chef', 'bbq-master', 'baker', 'sushi-chef', 'pizza-chef'
    ],
    keywords: ['chef life', 'kitchen', 'culinary', 'cook', 'foodie', 'mise en place'],
    avoidWords: ['burn', 'poison', 'raw'],
    targetDemographic: 'Culinary professionals and enthusiasts 22-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'realtor-real-estate': {
    name: 'realtor-real-estate',
    category: 'occupation',
    demandScore: 68,
    competitionLevel: 'low',
    seasonalBoost: 1.2, // Spring home buying season
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_tote', 'pod_notebook'],
    subNiches: [
      'realtor', 'broker', 'real-estate-agent', 'property-manager',
      'mortgage-broker', 'home-stager', 'real-estate-investor'
    ],
    keywords: ['sold', 'closing', 'keys', 'home', 'house', 'realtor life'],
    avoidWords: ['foreclosure', 'eviction'],
    targetDemographic: 'Real estate professionals 28-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'accountant-finance': {
    name: 'accountant-finance',
    category: 'occupation',
    demandScore: 65,
    competitionLevel: 'low',
    seasonalBoost: 1.5, // Tax season Q1
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_mousepad', 'pod_notebook'],
    subNiches: [
      'cpa', 'accountant', 'bookkeeper', 'tax-preparer', 'auditor',
      'financial-analyst', 'controller', 'cfo', 'accounting-student'
    ],
    keywords: ['tax season', 'balance', 'audit', 'numbers', 'spreadsheet', 'CPA'],
    avoidWords: ['fraud', 'embezzle', 'cheat'],
    targetDemographic: 'Finance professionals 25-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'pharmacist-pharmacy': {
    name: 'pharmacist-pharmacy',
    category: 'occupation',
    demandScore: 62,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_badge-reel', 'pod_tumbler'],
    subNiches: [
      'pharmacist', 'pharmacy-tech', 'clinical-pharmacist', 'retail-pharmacist',
      'hospital-pharmacist', 'pharmacy-student', 'compounding-pharmacist'
    ],
    keywords: ['Rx', 'pharmacist life', 'pills', 'prescription', 'healthcare'],
    avoidWords: ['drugs', 'overdose', 'addiction'],
    targetDemographic: 'Pharmacy professionals 24-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'dental-professional': {
    name: 'dental-professional',
    category: 'occupation',
    demandScore: 64,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_badge-reel'],
    subNiches: [
      'dentist', 'dental-hygienist', 'dental-assistant', 'orthodontist',
      'oral-surgeon', 'dental-student', 'pediatric-dentist'
    ],
    keywords: ['smile', 'teeth', 'floss', 'dental life', 'cavity free'],
    avoidWords: ['pain', 'drill', 'fear'],
    targetDemographic: 'Dental professionals 24-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'hairstylist-beauty': {
    name: 'hairstylist-beauty',
    category: 'occupation',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_apron', 'pod_tote', 'pod_mug'],
    subNiches: [
      'hairstylist', 'barber', 'colorist', 'esthetician', 'nail-tech',
      'makeup-artist', 'cosmetologist', 'lash-tech', 'salon-owner'
    ],
    keywords: ['scissors', 'salon life', 'beauty', 'style', 'glam', 'hair goals'],
    avoidWords: ['ugly', 'bad hair'],
    targetDemographic: 'Beauty professionals 20-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'social-worker-counselor': {
    name: 'social-worker-counselor',
    category: 'occupation',
    demandScore: 66,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tote', 'digital_printable'],
    subNiches: [
      'social-worker', 'therapist', 'counselor', 'psychologist', 'lcsw',
      'school-counselor', 'marriage-family-therapist', 'case-manager'
    ],
    keywords: ['advocate', 'empower', 'support', 'mental health', 'healing'],
    avoidWords: ['crazy', 'insane', 'psycho'],
    targetDemographic: 'Mental health professionals 26-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // ═══════════════════════════════════════════════════════════════
  // HOBBIES & INTERESTS (15 niches)
  // ═══════════════════════════════════════════════════════════════
  'gaming-retro': {
    name: 'gaming-retro',
    category: 'hobby',
    demandScore: 88,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_poster', 'pod_tshirt', 'pod_mousepad', 'pod_hoodie', 'pod_sticker'],
    subNiches: [
      '8-bit-pixel', 'arcade-classic', 'console-gaming', 'pc-master-race',
      'retro-gaming', 'indie-games', 'speedrunning', 'esports', 'tabletop-gaming',
      'dnd-rpg', 'board-games', 'card-games', 'vr-gaming', 'mobile-gaming'
    ],
    keywords: ['level up', 'game on', 'player', 'respawn', 'achievement', 'GG', 'noob'],
    avoidWords: ['violence', 'kill', 'death', 'murder'],
    targetDemographic: 'Gamers 15-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'photography-camera': {
    name: 'photography-camera',
    category: 'hobby',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_mug', 'pod_sticker'],
    subNiches: [
      'wedding-photographer', 'portrait-photographer', 'landscape-photographer',
      'street-photography', 'wildlife-photography', 'astrophotography',
      'film-photography', 'drone-photography', 'newborn-photographer'
    ],
    keywords: ['shoot', 'capture', 'focus', 'lens', 'aperture', 'shutter', 'frame'],
    avoidWords: ['shoot people', 'gun'],
    targetDemographic: 'Photographers amateur to pro 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'music-musician': {
    name: 'music-musician',
    category: 'hobby',
    demandScore: 78,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_poster', 'pod_sticker', 'pod_hoodie'],
    subNiches: [
      'guitar-player', 'drummer', 'pianist', 'bassist', 'vocalist',
      'dj', 'producer', 'band-life', 'orchestra', 'jazz', 'classical',
      'rock', 'metal', 'country', 'hip-hop', 'vinyl-collector'
    ],
    keywords: ['music is life', 'play on', 'notes', 'melody', 'rhythm', 'jam'],
    avoidWords: [],
    targetDemographic: 'Musicians and music lovers 15-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'art-artist': {
    name: 'art-artist',
    category: 'hobby',
    demandScore: 75,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_apron', 'pod_mug', 'pod_sticker'],
    subNiches: [
      'painter', 'illustrator', 'sculptor', 'digital-artist', 'watercolor',
      'oil-painting', 'acrylic', 'sketch-artist', 'comic-artist',
      'graphic-designer', 'calligraphy', 'pottery', 'ceramics'
    ],
    keywords: ['create', 'art is life', 'masterpiece', 'canvas', 'palette', 'brush'],
    avoidWords: [],
    targetDemographic: 'Artists and art enthusiasts 18-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'society6', 'redbubble'],
  },
  
  'crafting-diy': {
    name: 'crafting-diy',
    category: 'hobby',
    demandScore: 80,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_mug', 'pod_apron'],
    subNiches: [
      'knitting', 'crocheting', 'sewing', 'quilting', 'embroidery',
      'scrapbooking', 'paper-crafts', 'jewelry-making', 'woodworking',
      'resin-art', 'candle-making', 'soap-making', 'macrame'
    ],
    keywords: ['handmade', 'craft life', 'create', 'maker', 'DIY', 'stash'],
    avoidWords: [],
    targetDemographic: 'Crafters predominantly female 25-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'gardening-plants': {
    name: 'gardening-plants',
    category: 'hobby',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Spring
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_mug', 'pod_apron', 'pod_hat'],
    subNiches: [
      'vegetable-garden', 'flower-garden', 'herb-garden', 'succulent',
      'houseplant', 'container-garden', 'permaculture', 'composting',
      'rose-garden', 'cottage-garden', 'urban-garden', 'greenhouse'
    ],
    keywords: ['plant mama', 'green thumb', 'grow', 'bloom', 'garden life', 'dig'],
    avoidWords: ['dead', 'kill', 'poison'],
    targetDemographic: 'Gardeners 30-70',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'fishing-angler': {
    name: 'fishing-angler',
    category: 'hobby',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Summer
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_hat', 'pod_mug', 'pod_tumbler'],
    subNiches: [
      'bass-fishing', 'fly-fishing', 'deep-sea', 'ice-fishing', 'kayak-fishing',
      'trout-fishing', 'catfish', 'saltwater', 'freshwater', 'fishing-dad'
    ],
    keywords: ['tight lines', 'reel', 'catch', 'fish on', 'hooked', 'tackle'],
    avoidWords: [],
    targetDemographic: 'Anglers predominantly male 25-70',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'hunting-outdoors': {
    name: 'hunting-outdoors',
    category: 'hobby',
    demandScore: 70,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Fall hunting season
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_hat', 'pod_mug'],
    subNiches: [
      'deer-hunting', 'duck-hunting', 'turkey-hunting', 'elk-hunting',
      'bow-hunting', 'rifle', 'waterfowl', 'upland-bird', 'hunting-wife'
    ],
    keywords: ['hunt', 'outdoors', 'camo', 'buck', 'rack', 'harvest'],
    avoidWords: ['kill', 'blood', 'trophy'],
    targetDemographic: 'Hunters predominantly male 25-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'camping-hiking': {
    name: 'camping-hiking',
    category: 'hobby',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Summer
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_mug', 'pod_sticker', 'pod_tumbler'],
    subNiches: [
      'tent-camping', 'rv-camping', 'backpacking', 'glamping', 'day-hiking',
      'thru-hiking', 'mountain-climbing', 'national-parks', 'trail-running'
    ],
    keywords: ['adventure', 'explore', 'wilderness', 'trail', 'summit', 'campfire'],
    avoidWords: ['lost', 'danger', 'death'],
    targetDemographic: 'Outdoor enthusiasts 20-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'book-lover': {
    name: 'book-lover',
    category: 'hobby',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tote', 'pod_mug', 'pod_tshirt', 'pod_sweatshirt', 'pod_sticker'],
    subNiches: [
      'romance-reader', 'fantasy-reader', 'thriller-reader', 'sci-fi-reader',
      'mystery-reader', 'historical-fiction', 'bookworm', 'bibliophile',
      'library-lover', 'book-club', 'audiobook', 'kindle-reader'
    ],
    keywords: ['one more chapter', 'book lover', 'read', 'pages', 'library', 'TBR'],
    avoidWords: [],
    targetDemographic: 'Book lovers predominantly female 18-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'true-crime': {
    name: 'true-crime',
    category: 'hobby',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // October
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_tumbler', 'pod_sticker'],
    subNiches: [
      'true-crime-podcast', 'murderino', 'crime-junkie', 'cold-case',
      'forensics', 'detective', 'mystery-lover'
    ],
    keywords: ['murderino', 'stay weird', 'podcast', 'suspicious', 'investigate'],
    avoidWords: ['murder', 'kill', 'death', 'blood', 'gore'],
    targetDemographic: 'True crime fans predominantly female 25-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'astrology-zodiac': {
    name: 'astrology-zodiac',
    category: 'hobby',
    demandScore: 82,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_poster', 'pod_mug', 'pod_tshirt', 'digital_printable', 'pod_jewelry'],
    subNiches: [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
      'rising-sign', 'moon-sign', 'birth-chart', 'tarot', 'crystals'
    ],
    keywords: ['zodiac', 'stars aligned', 'cosmic', 'horoscope', 'mercury retrograde'],
    avoidWords: ['curse', 'evil', 'bad luck'],
    targetDemographic: 'Astrology enthusiasts predominantly female 18-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'society6'],
  },
  
  'yoga-meditation': {
    name: 'yoga-meditation',
    category: 'hobby',
    demandScore: 77,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // January wellness
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_tank', 'pod_leggings', 'pod_mug', 'pod_poster'],
    subNiches: [
      'vinyasa', 'hatha', 'yin', 'hot-yoga', 'yoga-teacher',
      'meditation', 'mindfulness', 'chakra', 'namaste', 'breathwork'
    ],
    keywords: ['namaste', 'om', 'breathe', 'zen', 'flow', 'present', 'peace'],
    avoidWords: [],
    targetDemographic: 'Yoga practitioners predominantly female 20-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'wine-lover': {
    name: 'wine-lover',
    category: 'hobby',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_tumbler', 'pod_tote', 'pod_apron'],
    subNiches: [
      'red-wine', 'white-wine', 'rose', 'champagne', 'wine-mom',
      'wine-club', 'sommelier', 'wine-tasting', 'vineyard', 'winery'
    ],
    keywords: ['wine time', 'wine not', 'sip sip', 'uncork', 'vino', 'pour decisions'],
    avoidWords: ['drunk', 'alcoholic', 'wasted'],
    targetDemographic: 'Wine enthusiasts 25-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'coffee-lover': {
    name: 'coffee-lover',
    category: 'hobby',
    demandScore: 82,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tumbler', 'pod_tote'],
    subNiches: [
      'espresso', 'latte', 'cold-brew', 'iced-coffee', 'barista',
      'coffee-addict', 'morning-coffee', 'black-coffee', 'coffee-snob'
    ],
    keywords: ['but first coffee', 'caffeine', 'brew', 'beans', 'espresso yourself'],
    avoidWords: [],
    targetDemographic: 'Coffee lovers 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LIFESTYLE & VALUES (10 niches)
  // ═══════════════════════════════════════════════════════════════
  'minimalist-quotes': {
    name: 'minimalist-quotes',
    category: 'lifestyle',
    demandScore: 72,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_poster', 'digital_printable', 'pod_mug', 'pod_canvas', 'pod_tshirt'],
    subNiches: [
      'motivational', 'inspirational', 'self-care', 'mindfulness',
      'gratitude', 'positivity', 'affirmations', 'typography', 'breathe'
    ],
    keywords: ['be kind', 'good vibes', 'breathe', 'grateful', 'positive', 'less is more'],
    avoidWords: ['hate', 'negative', 'sad'],
    targetDemographic: 'Minimalism enthusiasts 25-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'society6'],
  },
  
  'eco-activism': {
    name: 'eco-activism',
    category: 'lifestyle',
    demandScore: 73,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tote', 'pod_sticker', 'pod_tshirt', 'pod_water-bottle'],
    subNiches: [
      'climate-action', 'zero-waste', 'plastic-free', 'sustainable',
      'recycle', 'vegan', 'plant-based', 'ocean-cleanup', 'reforestation'
    ],
    keywords: ['save earth', 'eco warrior', 'sustainable', 'green', 'planet', 'future'],
    avoidWords: ['destroy', 'pollution', 'death'],
    targetDemographic: 'Environmentally conscious 18-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'lgbtq-pride': {
    name: 'lgbtq-pride',
    category: 'lifestyle',
    demandScore: 80,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_flag', 'pod_sticker', 'pod_mug', 'pod_tote'],
    subNiches: [
      'gay-pride', 'lesbian-pride', 'bisexual', 'transgender', 'nonbinary',
      'pansexual', 'asexual', 'queer', 'ally', 'rainbow'
    ],
    keywords: ['pride', 'love is love', 'rainbow', 'equality', 'be yourself', 'ally'],
    avoidWords: ['hate', 'against', 'sin'],
    targetDemographic: 'LGBTQ+ community and allies 16-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'mental-health-awareness': {
    name: 'mental-health-awareness',
    category: 'lifestyle',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_sticker', 'pod_poster', 'digital_printable'],
    subNiches: [
      'anxiety-awareness', 'depression-awareness', 'ptsd', 'adhd',
      'autism-acceptance', 'self-care', 'therapy', 'mental-health-matters',
      'semicolon', 'suicide-prevention', 'recovery'
    ],
    keywords: ['it\'s okay', 'you matter', 'mental health matters', 'self care', 'healing'],
    avoidWords: ['crazy', 'insane', 'psycho', 'suicide'],
    targetDemographic: 'Mental health advocates 16-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'feminist-empowerment': {
    name: 'feminist-empowerment',
    category: 'lifestyle',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_mug', 'pod_sticker', 'pod_poster'],
    subNiches: [
      'girl-power', 'women-empowerment', 'boss-babe', 'female-founder',
      'women-in-stem', 'smash-patriarchy', 'nevertheless-she-persisted'
    ],
    keywords: ['girl power', 'future is female', 'boss', 'empower', 'strong women'],
    avoidWords: ['weak', 'victim'],
    targetDemographic: 'Women and allies 18-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'van-life-nomad': {
    name: 'van-life-nomad',
    category: 'lifestyle',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.2, // Summer
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_sticker', 'pod_mug', 'pod_poster'],
    subNiches: [
      'van-life', 'rv-life', 'digital-nomad', 'full-time-travel',
      'remote-work', 'tiny-house', 'off-grid', 'adventure-travel'
    ],
    keywords: ['home is where you park', 'wander', 'nomad', 'freedom', 'road less traveled'],
    avoidWords: ['homeless', 'broke'],
    targetDemographic: 'Nomads and travelers 22-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },
  
  'introvert-antisocial': {
    name: 'introvert-antisocial',
    category: 'lifestyle',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_hoodie', 'pod_sticker'],
    subNiches: [
      'introvert', 'homebody', 'antisocial', 'people-suck',
      'social-anxiety', 'alone-time', 'cat-person', 'book-nerd'
    ],
    keywords: ['introvert', 'sorry I\'m late', 'not today', 'leave me alone', 'nope'],
    avoidWords: ['hate people'],
    targetDemographic: 'Introverts 18-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'sarcastic-humor': {
    name: 'sarcastic-humor',
    category: 'lifestyle',
    demandScore: 82,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_sticker', 'pod_tumbler'],
    subNiches: [
      'sarcasm', 'adulting', 'office-humor', 'monday-hate',
      'dark-humor', 'dry-wit', 'passive-aggressive', 'petty'
    ],
    keywords: ['sarcasm', 'adulting', 'nope', 'I can\'t', 'mood', 'literally'],
    avoidWords: ['hate', 'die', 'kill'],
    targetDemographic: 'Millennials and Gen Z 18-40',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble', 'teepublic'],
  },
  
  'religious-faith': {
    name: 'religious-faith',
    category: 'lifestyle',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_canvas', 'digital_printable', 'pod_jewelry'],
    subNiches: [
      'christian', 'catholic', 'jewish', 'muslim', 'buddhist',
      'bible-verse', 'faith', 'blessed', 'prayer', 'church'
    ],
    keywords: ['faith', 'blessed', 'grace', 'prayer', 'believe', 'hope'],
    avoidWords: ['sin', 'hell', 'damn', 'devil'],
    targetDemographic: 'Faith-based community 25-70',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
  
  'country-southern': {
    name: 'country-southern',
    category: 'lifestyle',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hat', 'pod_tank', 'pod_mug', 'pod_flag'],
    subNiches: [
      'southern-belle', 'country-girl', 'farm-life', 'cowboy', 'cowgirl',
      'rodeo', 'boots', 'country-music', 'small-town', 'redneck'
    ],
    keywords: ['y\'all', 'southern', 'country', 'farm', 'boots', 'bless your heart'],
    avoidWords: ['redneck' ], // can be considered offensive
    targetDemographic: 'Country/Southern culture 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // More niches continue in next file...
};

export default EXTENDED_NICHES;
