export const UI_STRINGS = {
  // Bottom nav
  nav_home:   'Home',
  nav_map:    'Map',
  nav_search: 'Search',
  nav_help:   'Help',

  // Quick actions
  action_navigate:     'Navigate',
  action_find_facility: 'Find Facility',
  action_help:         'Help',
  action_get_guide:    'Get a Guide',

  // Greetings
  greeting_morning:   'Good Morning',
  greeting_afternoon: 'Good Afternoon',
  greeting_evening:   'Good Evening',
  greeting_welcome:   'Welcome',
  greeting_tagline:   'Calvary Greetings!',

  // Facility categories
  cat_toilet:        'Toilets',
  cat_auditorium:    'Auditoriums',
  cat_food:          'Food & Eateries',
  cat_medical:       'Medical Centres',
  cat_parking:       'Parking',
  cat_shuttle:       'Shuttle Stops',
  cat_hotel:         'Hotels',
  cat_accommodation: 'Accommodation',

  // Common
  no_facilities: 'No facilities listed yet.',
} as const

export type UiStringKey = keyof typeof UI_STRINGS
