/**
 * Extended Niche Database v2.0 - Part 2
 * Parenting, Sports, Food, Seasonal, Academic niches
 */

import { ExtendedNiche } from './extended-niches-part1';

export const EXTENDED_NICHES_PART2: Record<string, ExtendedNiche> = {
  // ═══════════════════════════════════════════════════════════════
  // PARENTING & FAMILY (12 niches)
  // ═══════════════════════════════════════════════════════════════
  'mom-life-humor': {
    name: 'mom-life-humor',
    category: 'parenting',
    demandScore: 88,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_tumbler', 'pod_tote', 'pod_sweatshirt'],
    subNiches: [
      'new-mom', 'boy-mom', 'girl-mom', 'twin-mom', 'toddler-mom',
      'teen-mom', 'sports-mom', 'soccer-mom', 'baseball-mom', 'dance-mom',
      'homeschool-mom', 'working-mom', 'stay-at-home-mom', 'hot-mess-mom',
      'wine-mom', 'coffee-mom', 'tired-mom', 'bonus-mom', 'foster-mom'
    ],
    keywords: ['mom life', 'mama', 'motherhood', 'chaos coordinator', 'blessed mess', 'tired'],
    avoidWords: ['bad mom', 'hate kids'],
    targetDemographic: 'Mothers 25-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'dad-jokes': {
    name: 'dad-jokes',
    category: 'parenting',
    demandScore: 80,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_hoodie', 'pod_hat', 'pod_apron'],
    subNiches: [
      'new-dad', 'girl-dad', 'boy-dad', 'twin-dad', 'sports-dad',
      'grill-dad', 'golf-dad', 'fishing-dad', 'gaming-dad', 'nerd-dad',
      'bonus-dad', 'step-dad', 'foster-dad', 'grandpa', 'papa'
    ],
    keywords: ['dad bod', 'father', 'papa', 'daddy', 'legend', 'best dad', 'dad joke'],
    avoidWords: ['deadbeat', 'absent'],
    targetDemographic: 'Fathers and gift-givers 25-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'pregnancy-maternity': {
    name: 'pregnancy-maternity',
    category: 'parenting',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_onesie', 'pod_mug', 'digital_printable'],
    subNiches: [
      'expecting', 'pregnant', 'baby-bump', 'due-date', 'gender-reveal',
      'baby-shower', 'first-time-mom', 'pregnancy-announcement', 'ivf-warrior',
      'rainbow-baby', 'miracle-baby', 'twins-pregnancy'
    ],
    keywords: ['mama to be', 'bump', 'expecting', 'baby on board', 'eating for two'],
    avoidWords: ['miscarriage', 'loss'],
    targetDemographic: 'Expecting parents 22-40',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'baby-newborn': {
    name: 'baby-newborn',
    category: 'parenting',
    demandScore: 82,
    competitionLevel: 'high',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_onesie', 'pod_bib', 'pod_blanket', 'pod_bodysuit', 'digital_printable'],
    subNiches: [
      'newborn', 'baby-girl', 'baby-boy', 'twins', 'preemie',
      'milestone', 'first-birthday', 'baby-announcement', 'coming-home'
    ],
    keywords: ['little one', 'bundle of joy', 'miracle', 'tiny human', 'snuggle'],
    avoidWords: [],
    targetDemographic: 'New parents and gift-givers 22-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'grandparent': {
    name: 'grandparent',
    category: 'parenting',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_mug', 'pod_tshirt', 'pod_sweatshirt', 'pod_ornament', 'pod_blanket'],
    subNiches: [
      'grandma', 'grandpa', 'nana', 'papa', 'mimi', 'gigi',
      'granny', 'grammy', 'abuela', 'oma', 'opa', 'first-time-grandparent'
    ],
    keywords: ['grandma life', 'grandpa life', 'spoil', 'grandkids', 'promoted to grandma'],
    avoidWords: ['old'],
    targetDemographic: 'Grandparents and gift-givers 45-80',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'sibling-family': {
    name: 'sibling-family',
    category: 'parenting',
    demandScore: 72,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_onesie', 'pod_mug', 'digital_printable'],
    subNiches: [
      'big-sister', 'big-brother', 'little-sister', 'little-brother',
      'twins', 'triplets', 'only-child', 'middle-child', 'oldest-child',
      'youngest-child', 'sibling-set', 'matching-family'
    ],
    keywords: ['best friend', 'partner in crime', 'squad', 'tribe', 'crew'],
    avoidWords: ['hate', 'annoying'],
    targetDemographic: 'Parents buying for kids 25-45',
    pricePoint: 'budget',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'autism-special-needs': {
    name: 'autism-special-needs',
    category: 'parenting',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_sticker', 'pod_mug', 'pod_tote'],
    subNiches: [
      'autism-mom', 'autism-dad', 'autism-awareness', 'autism-acceptance',
      'adhd', 'sensory-processing', 'down-syndrome', 'special-needs-parent',
      'neurodivergent', 'differently-abled'
    ],
    keywords: ['autism mom', 'different not less', 'awareness', 'acceptance', 'neurodivergent'],
    avoidWords: ['disorder', 'disease', 'handicapped', 'retard'],
    targetDemographic: 'Special needs families and advocates 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'adoption-foster': {
    name: 'adoption-foster',
    category: 'parenting',
    demandScore: 65,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_onesie', 'digital_printable'],
    subNiches: [
      'adoption-announcement', 'gotcha-day', 'foster-parent', 'foster-mom',
      'foster-dad', 'adoption-finalization', 'waiting-family', 'adoptive-mom'
    ],
    keywords: ['chosen', 'forever family', 'gotcha day', 'adoption', 'foster love'],
    avoidWords: ['real parents', 'give up'],
    targetDemographic: 'Adoptive and foster families 28-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SPORTS & FITNESS (15 niches)
  // ═══════════════════════════════════════════════════════════════
  'fitness-motivation': {
    name: 'fitness-motivation',
    category: 'sports',
    demandScore: 80,
    competitionLevel: 'high',
    seasonalBoost: 1.5, // January
    trendDirection: 'stable',
    recommendedProducts: ['pod_tank', 'pod_tshirt', 'pod_hoodie', 'pod_leggings', 'pod_water-bottle'],
    subNiches: [
      'gym-rat', 'bodybuilding', 'powerlifting', 'crossfit', 'weightlifting',
      'personal-trainer', 'fitness-coach', 'gains', 'leg-day', 'arm-day',
      'no-excuses', 'beast-mode', 'fit-mom', 'fit-dad'
    ],
    keywords: ['no excuses', 'beast mode', 'gains', 'stronger', 'grind', 'lift'],
    avoidWords: ['steroids', 'drugs'],
    targetDemographic: 'Fitness enthusiasts 18-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon', 'redbubble'],
  },

  'running-marathon': {
    name: 'running-marathon',
    category: 'sports',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Spring/Fall marathon season
    trendDirection: 'stable',
    recommendedProducts: ['pod_tank', 'pod_tshirt', 'pod_medal-hanger', 'pod_mug', 'pod_sticker'],
    subNiches: [
      'marathon', 'half-marathon', '5k', '10k', 'ultra-marathon',
      'trail-running', 'cross-country', 'track', 'running-mom', 'running-dad',
      'couch-to-5k', 'boston-qualifier', 'run-club'
    ],
    keywords: ['run', 'miles', 'pace', 'PR', 'finish line', 'runner\'s high'],
    avoidWords: [],
    targetDemographic: 'Runners 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'yoga-pilates': {
    name: 'yoga-pilates',
    category: 'sports',
    demandScore: 77,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // January
    trendDirection: 'rising',
    recommendedProducts: ['pod_tank', 'pod_leggings', 'pod_tshirt', 'pod_mat-bag', 'pod_mug'],
    subNiches: [
      'yoga-teacher', 'vinyasa', 'hot-yoga', 'yin-yoga', 'ashtanga',
      'pilates-instructor', 'barre', 'reformer-pilates', 'yoga-mom'
    ],
    keywords: ['namaste', 'om', 'flow', 'breathe', 'balance', 'zen'],
    avoidWords: [],
    targetDemographic: 'Yoga/Pilates practitioners predominantly female 20-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'golf': {
    name: 'golf',
    category: 'sports',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Spring-Summer
    trendDirection: 'stable',
    recommendedProducts: ['pod_polo', 'pod_hat', 'pod_towel', 'pod_mug', 'pod_tshirt'],
    subNiches: [
      'golfer', 'golf-dad', 'golf-mom', 'golf-widow', 'golf-retirement',
      'hole-in-one', 'golf-club', 'caddy', 'disc-golf'
    ],
    keywords: ['fore', 'birdie', 'eagle', 'tee time', '19th hole', 'fairway'],
    avoidWords: [],
    targetDemographic: 'Golfers predominantly male 30-70',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'soccer-football': {
    name: 'soccer-football',
    category: 'sports',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_mug', 'pod_blanket'],
    subNiches: [
      'soccer-mom', 'soccer-dad', 'soccer-player', 'goalkeeper', 'striker',
      'youth-soccer', 'club-soccer', 'futbol', 'soccer-coach'
    ],
    keywords: ['goal', 'soccer life', 'pitch', 'keeper', 'striker'],
    avoidWords: [],
    targetDemographic: 'Soccer players and families 10-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'baseball-softball': {
    name: 'baseball-softball',
    category: 'sports',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Spring-Summer
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hat', 'pod_hoodie', 'pod_mug', 'pod_blanket'],
    subNiches: [
      'baseball-mom', 'baseball-dad', 'softball-mom', 'softball-dad',
      'pitcher', 'catcher', 'little-league', 'travel-ball', 'coach'
    ],
    keywords: ['home run', 'diamond', 'bases', 'strike', 'ball life'],
    avoidWords: [],
    targetDemographic: 'Baseball/Softball families 25-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'basketball': {
    name: 'basketball',
    category: 'sports',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Winter season
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_shorts', 'pod_mug'],
    subNiches: [
      'basketball-mom', 'basketball-dad', 'point-guard', 'center',
      'youth-basketball', 'hoops', 'baller', 'coach'
    ],
    keywords: ['hoops', 'baller', 'dunk', 'swish', 'court', 'nothing but net'],
    avoidWords: [],
    targetDemographic: 'Basketball players and families 12-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'football-american': {
    name: 'football-american',
    category: 'sports',
    demandScore: 78,
    competitionLevel: 'high',
    seasonalBoost: 1.4, // Fall season
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_blanket', 'pod_mug', 'pod_flag'],
    subNiches: [
      'football-mom', 'football-dad', 'quarterback', 'linebacker',
      'youth-football', 'friday-night-lights', 'tailgate', 'fantasy-football'
    ],
    keywords: ['touchdown', 'game day', 'gridiron', 'huddle', 'tackle'],
    avoidWords: [],
    targetDemographic: 'Football fans and families 18-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'hockey': {
    name: 'hockey',
    category: 'sports',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Winter
    trendDirection: 'stable',
    recommendedProducts: ['pod_hoodie', 'pod_tshirt', 'pod_mug', 'pod_blanket'],
    subNiches: [
      'hockey-mom', 'hockey-dad', 'goalie', 'defenseman', 'forward',
      'youth-hockey', 'ice-hockey', 'roller-hockey', 'hockey-wife'
    ],
    keywords: ['puck', 'rink', 'ice', 'goal', 'slapshot', 'hockey hair'],
    avoidWords: ['fight'],
    targetDemographic: 'Hockey players and families 10-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'swimming-diving': {
    name: 'swimming-diving',
    category: 'sports',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.3, // Summer
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_towel', 'pod_bag', 'pod_mug'],
    subNiches: [
      'swim-mom', 'swim-dad', 'swimmer', 'diver', 'water-polo',
      'synchronized-swimming', 'swim-team', 'lifeguard', 'swim-coach'
    ],
    keywords: ['swim life', 'pool', 'lanes', 'dive', 'chlorine', 'fast in water'],
    avoidWords: ['drown'],
    targetDemographic: 'Swimmers and families 10-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'gymnastics-cheer': {
    name: 'gymnastics-cheer',
    category: 'sports',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_leotard', 'pod_bag', 'pod_mug', 'pod_blanket'],
    subNiches: [
      'gymnast', 'gymnastics-mom', 'gymnastics-dad', 'cheerleader',
      'cheer-mom', 'cheer-dad', 'tumbling', 'all-star-cheer', 'dance-team'
    ],
    keywords: ['flip', 'tumble', 'cheer', 'stunt', 'back handspring', 'perfect 10'],
    avoidWords: [],
    targetDemographic: 'Gymnasts/Cheerleaders and families 8-45',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'dance': {
    name: 'dance',
    category: 'sports',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tank', 'pod_bag', 'pod_mug', 'pod_leggings'],
    subNiches: [
      'ballet', 'hip-hop', 'jazz', 'tap', 'contemporary', 'lyrical',
      'dance-mom', 'dance-dad', 'dance-teacher', 'ballroom', 'salsa',
      'competition-dance', 'dance-studio'
    ],
    keywords: ['dance life', 'dancer', 'pirouette', 'leap', 'stage', 'recital'],
    avoidWords: [],
    targetDemographic: 'Dancers and families predominantly female 8-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'martial-arts': {
    name: 'martial-arts',
    category: 'sports',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hoodie', 'pod_mug', 'pod_poster'],
    subNiches: [
      'karate', 'taekwondo', 'jiu-jitsu', 'judo', 'mma', 'boxing',
      'kickboxing', 'muay-thai', 'kung-fu', 'black-belt', 'martial-arts-mom'
    ],
    keywords: ['warrior', 'discipline', 'black belt', 'dojo', 'train', 'fight'],
    avoidWords: ['violence', 'hurt'],
    targetDemographic: 'Martial artists and families 8-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'cycling-biking': {
    name: 'cycling-biking',
    category: 'sports',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Spring-Summer
    trendDirection: 'rising',
    recommendedProducts: ['pod_jersey', 'pod_tshirt', 'pod_water-bottle', 'pod_mug', 'pod_sticker'],
    subNiches: [
      'road-cycling', 'mountain-biking', 'gravel', 'triathlon', 'bmx',
      'spin-class', 'peloton', 'bike-commuter', 'cycling-dad', 'cycling-mom'
    ],
    keywords: ['ride', 'pedal', 'spin', 'wheels', 'cadence', 'miles'],
    avoidWords: ['crash', 'accident'],
    targetDemographic: 'Cyclists 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'tennis-pickleball': {
    name: 'tennis-pickleball',
    category: 'sports',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Spring-Summer
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_hat', 'pod_towel', 'pod_mug', 'pod_bag'],
    subNiches: [
      'tennis-player', 'pickleball', 'tennis-mom', 'tennis-dad',
      'pickleball-addict', 'doubles', 'tennis-coach', 'club-tennis'
    ],
    keywords: ['love', 'ace', 'serve', 'court', 'rally', 'dink'],
    avoidWords: [],
    targetDemographic: 'Tennis/Pickleball players 25-70',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  // ═══════════════════════════════════════════════════════════════
  // FOOD & DRINK (8 niches)
  // ═══════════════════════════════════════════════════════════════
  'bbq-grilling': {
    name: 'bbq-grilling',
    category: 'food',
    demandScore: 76,
    competitionLevel: 'medium',
    seasonalBoost: 1.4, // Summer + Father's Day
    trendDirection: 'stable',
    recommendedProducts: ['pod_apron', 'pod_tshirt', 'pod_mug', 'pod_towel', 'pod_cutting-board'],
    subNiches: [
      'pitmaster', 'smoker', 'grill-master', 'bbq-dad', 'competition-bbq',
      'brisket', 'ribs', 'backyard-bbq', 'charcoal', 'pellet-grill'
    ],
    keywords: ['grill', 'smoke', 'meat', 'bbq', 'pitmaster', 'low and slow'],
    avoidWords: [],
    targetDemographic: 'BBQ enthusiasts predominantly male 30-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'baking': {
    name: 'baking',
    category: 'food',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 1.3, // Holiday season
    trendDirection: 'stable',
    recommendedProducts: ['pod_apron', 'pod_mug', 'pod_towel', 'pod_tshirt', 'pod_oven-mitt'],
    subNiches: [
      'baker', 'cake-decorator', 'cookie-baker', 'bread-baker', 'pastry-chef',
      'home-baker', 'cupcake', 'sourdough', 'baking-mom'
    ],
    keywords: ['bake', 'flour', 'sugar', 'oven', 'whisk', 'rise', 'sweet'],
    avoidWords: ['burn'],
    targetDemographic: 'Home bakers predominantly female 25-65',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'vegan-vegetarian': {
    name: 'vegan-vegetarian',
    category: 'food',
    demandScore: 72,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // January Veganuary
    trendDirection: 'rising',
    recommendedProducts: ['pod_tshirt', 'pod_tote', 'pod_mug', 'pod_sticker', 'pod_apron'],
    subNiches: [
      'vegan', 'vegetarian', 'plant-based', 'vegan-athlete', 'vegan-mom',
      'cruelty-free', 'herbivore', 'flexitarian', 'whole-food-plant-based'
    ],
    keywords: ['plant powered', 'vegan', 'herbivore', 'compassion', 'cruelty free'],
    avoidWords: ['preachy', 'militant'],
    targetDemographic: 'Vegans and vegetarians 18-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'redbubble'],
  },

  'foodie-chef': {
    name: 'foodie-chef',
    category: 'food',
    demandScore: 73,
    competitionLevel: 'medium',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_apron', 'pod_mug', 'pod_tshirt', 'pod_cutting-board', 'pod_towel'],
    subNiches: [
      'home-chef', 'foodie', 'cooking-enthusiast', 'recipe-collector',
      'food-blogger', 'taste-tester', 'culinary-adventurer'
    ],
    keywords: ['chef', 'cook', 'kitchen', 'recipe', 'foodie', 'yum'],
    avoidWords: ['poison', 'burn'],
    targetDemographic: 'Food enthusiasts 25-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'beer-craft': {
    name: 'beer-craft',
    category: 'food',
    demandScore: 74,
    competitionLevel: 'medium',
    seasonalBoost: 1.2, // Oktoberfest, St Patrick's
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_pint-glass', 'pod_coaster', 'pod_hoodie'],
    subNiches: [
      'craft-beer', 'home-brewer', 'ipa-lover', 'beer-snob', 'beer-dad',
      'brewery-hopper', 'lager', 'stout', 'beer-league'
    ],
    keywords: ['beer', 'brew', 'hops', 'cheers', 'pint', 'craft'],
    avoidWords: ['drunk', 'wasted', 'alcoholic'],
    targetDemographic: 'Beer enthusiasts predominantly male 21-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'whiskey-bourbon': {
    name: 'whiskey-bourbon',
    category: 'food',
    demandScore: 70,
    competitionLevel: 'low',
    seasonalBoost: 1.2, // Holiday gifting
    trendDirection: 'rising',
    recommendedProducts: ['pod_rocks-glass', 'pod_tshirt', 'pod_coaster', 'pod_decanter', 'pod_sign'],
    subNiches: [
      'bourbon-lover', 'whiskey-collector', 'scotch', 'rye', 'irish-whiskey',
      'whiskey-dad', 'neat', 'on-the-rocks'
    ],
    keywords: ['whiskey', 'bourbon', 'neat', 'on the rocks', 'aged', 'smooth'],
    avoidWords: ['drunk', 'alcoholic'],
    targetDemographic: 'Whiskey enthusiasts predominantly male 25-65',
    pricePoint: 'premium',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'taco-mexican': {
    name: 'taco-mexican',
    category: 'food',
    demandScore: 72,
    competitionLevel: 'low',
    seasonalBoost: 1.3, // Cinco de Mayo
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_apron', 'pod_sticker'],
    subNiches: [
      'taco-tuesday', 'taco-lover', 'mexican-food', 'salsa', 'guac',
      'margarita', 'burrito', 'nacho', 'fiesta'
    ],
    keywords: ['taco', 'fiesta', 'salsa', 'guac', 'tuesday', 'spicy'],
    avoidWords: [],
    targetDemographic: 'Taco and Mexican food lovers 18-50',
    pricePoint: 'budget',
    bestPlatforms: ['etsy', 'redbubble'],
  },

  'pizza-lover': {
    name: 'pizza-lover',
    category: 'food',
    demandScore: 73,
    competitionLevel: 'low',
    seasonalBoost: 1.0,
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_sticker', 'pod_hoodie'],
    subNiches: [
      'pizza-addict', 'pizza-party', 'pepperoni', 'cheese-pizza',
      'pizza-friday', 'pizza-is-life', 'pizza-dad', 'pizza-couple'
    ],
    keywords: ['pizza', 'slice', 'cheese', 'crust', 'pepperoni', 'delivery'],
    avoidWords: [],
    targetDemographic: 'Pizza lovers all ages',
    pricePoint: 'budget',
    bestPlatforms: ['etsy', 'redbubble'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL & HOLIDAYS (10 niches)
  // ═══════════════════════════════════════════════════════════════
  'christmas-holiday': {
    name: 'christmas-holiday',
    category: 'seasonal',
    demandScore: 95,
    competitionLevel: 'high',
    seasonalBoost: 3.0, // December peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_ornament', 'pod_sweater', 'pod_mug', 'pod_tshirt', 'pod_blanket', 'pod_stocking'],
    subNiches: [
      'ugly-sweater', 'christmas-family', 'matching-christmas', 'christmas-crew',
      'santa', 'elf', 'reindeer', 'grinch-mood', 'christmas-baking',
      'christmas-tree', 'holiday-spirit', 'merry-and-bright'
    ],
    keywords: ['merry', 'jolly', 'ho ho ho', 'festive', 'holiday', 'jingle'],
    avoidWords: ['krampus', 'scary'],
    targetDemographic: 'Everyone celebrating Christmas',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'halloween': {
    name: 'halloween',
    category: 'seasonal',
    demandScore: 90,
    competitionLevel: 'high',
    seasonalBoost: 3.0, // October peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_sweatshirt', 'pod_mug', 'pod_doormat', 'pod_flag', 'pod_tote'],
    subNiches: [
      'spooky', 'witch', 'ghost', 'skeleton', 'pumpkin', 'vampire',
      'zombie', 'haunted', 'trick-or-treat', 'costume', 'horror-fan'
    ],
    keywords: ['spooky', 'boo', 'witch', 'halloween', 'scary', 'creepy'],
    avoidWords: ['gore', 'blood', 'death'],
    targetDemographic: 'Halloween enthusiasts all ages',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'valentines-day': {
    name: 'valentines-day',
    category: 'seasonal',
    demandScore: 85,
    competitionLevel: 'high',
    seasonalBoost: 3.0, // February peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_jewelry', 'digital_printable', 'pod_pillow'],
    subNiches: [
      'couples', 'love', 'galentines', 'anti-valentine', 'single-awareness',
      'heart', 'romantic', 'first-valentine', 'matching-couple'
    ],
    keywords: ['love', 'heart', 'be mine', 'xoxo', 'valentine', 'cupid'],
    avoidWords: ['hate', 'breakup'],
    targetDemographic: 'Couples and singles celebrating 18-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'easter': {
    name: 'easter',
    category: 'seasonal',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 2.5, // March/April peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_onesie', 'pod_mug', 'pod_tote', 'digital_printable'],
    subNiches: [
      'easter-bunny', 'egg-hunt', 'spring', 'religious-easter', 'pastel',
      'chick', 'easter-basket', 'easter-family', 'hoppy-easter'
    ],
    keywords: ['bunny', 'egg', 'spring', 'hop', 'basket', 'pastel'],
    avoidWords: [],
    targetDemographic: 'Families with children 25-50',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'st-patricks-day': {
    name: 'st-patricks-day',
    category: 'seasonal',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 3.0, // March peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_mug', 'pod_hat', 'pod_tank', 'pod_socks'],
    subNiches: [
      'irish', 'shamrock', 'lucky', 'leprechaun', 'green-beer',
      'kiss-me-irish', 'shenanigans', 'drinking-holiday'
    ],
    keywords: ['lucky', 'shamrock', 'green', 'irish', 'slainte', 'leprechaun'],
    avoidWords: ['drunk', 'wasted'],
    targetDemographic: 'Everyone celebrating St. Patrick\'s Day',
    pricePoint: 'budget',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'fourth-of-july': {
    name: 'fourth-of-july',
    category: 'seasonal',
    demandScore: 82,
    competitionLevel: 'medium',
    seasonalBoost: 3.0, // July peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_tank', 'pod_flag', 'pod_hat', 'pod_cooler'],
    subNiches: [
      'patriotic', 'usa', 'america', 'red-white-blue', 'fireworks',
      'independence', 'freedom', 'merica', 'bbq-party'
    ],
    keywords: ['usa', 'freedom', 'america', 'fireworks', 'liberty', 'stars stripes'],
    avoidWords: ['politics'],
    targetDemographic: 'Americans celebrating Independence Day',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'thanksgiving': {
    name: 'thanksgiving',
    category: 'seasonal',
    demandScore: 78,
    competitionLevel: 'medium',
    seasonalBoost: 2.5, // November peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_apron', 'pod_mug', 'pod_towel', 'pod_doormat'],
    subNiches: [
      'thankful', 'grateful', 'turkey', 'pumpkin-pie', 'fall-harvest',
      'friendsgiving', 'family-gathering', 'gobble', 'thanksgiving-host'
    ],
    keywords: ['thankful', 'grateful', 'blessed', 'turkey', 'gobble', 'feast'],
    avoidWords: [],
    targetDemographic: 'Americans celebrating Thanksgiving',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'fall-autumn': {
    name: 'fall-autumn',
    category: 'seasonal',
    demandScore: 80,
    competitionLevel: 'medium',
    seasonalBoost: 2.0, // Sept-Nov
    trendDirection: 'stable',
    recommendedProducts: ['pod_sweatshirt', 'pod_mug', 'pod_tshirt', 'pod_doormat', 'pod_blanket'],
    subNiches: [
      'pumpkin-spice', 'fall-leaves', 'sweater-weather', 'apple-picking',
      'cozy-season', 'autumn-vibes', 'fall-yall', 'harvest'
    ],
    keywords: ['fall', 'autumn', 'cozy', 'pumpkin', 'leaves', 'sweater weather'],
    avoidWords: [],
    targetDemographic: 'Fall enthusiasts 20-60',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'summer-beach': {
    name: 'summer-beach',
    category: 'seasonal',
    demandScore: 82,
    competitionLevel: 'medium',
    seasonalBoost: 2.0, // June-Aug
    trendDirection: 'stable',
    recommendedProducts: ['pod_tank', 'pod_tshirt', 'pod_tote', 'pod_towel', 'pod_tumbler'],
    subNiches: [
      'beach-life', 'ocean', 'tropical', 'palm-trees', 'vacation',
      'pool-day', 'sunshine', 'tan-lines', 'lake-life', 'boat-life'
    ],
    keywords: ['beach', 'sun', 'waves', 'ocean', 'tropical', 'paradise'],
    avoidWords: ['drown', 'shark'],
    targetDemographic: 'Beach and summer lovers 18-55',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },

  'new-year': {
    name: 'new-year',
    category: 'seasonal',
    demandScore: 75,
    competitionLevel: 'medium',
    seasonalBoost: 3.0, // Dec-Jan peak
    trendDirection: 'stable',
    recommendedProducts: ['pod_tshirt', 'pod_hat', 'pod_mug', 'digital_planner', 'pod_tumbler'],
    subNiches: [
      'new-year-new-me', 'resolution', 'cheers', 'countdown',
      'year-review', 'fresh-start', 'goals', 'celebrate'
    ],
    keywords: ['cheers', 'new year', 'celebrate', 'goals', 'fresh start', 'countdown'],
    avoidWords: [],
    targetDemographic: 'Everyone celebrating New Year',
    pricePoint: 'mid',
    bestPlatforms: ['etsy', 'amazon'],
  },
};

export default EXTENDED_NICHES_PART2;
