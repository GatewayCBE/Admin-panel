export interface Turf {
  id: string;
  turf_id: string;
  turf_name: string;
  turf_mobile_number: string;
  turf_location: string;
  booking_type?: "call_now" | "book_now";
  owner_id: string;
  owner_name: string;
  owner_mobile_number: string;
  owner_email: string;
  turf_closing_time: string;
  turf_opening_time: string;

  turf_image_url?: string | null;
  turf_images?: string[] | null;

  // NEW OPTIONAL FIELDS FROM FIRESTORE
  amenities?: string[];
  available_sports_list?: string[];

  turf_description?: string;

  sports_specific_person_count?: { 
    [sport: string]: number 
  };

  sport_specific_price?: {
    [sport: string]: {
      [day: string]: {
        day?: number;
        night?: number;
      };
    };
  };

  sport_specific_timing?: {
    [sport: string]: {
      opening_time?: string;
      closing_time?: string;
      day_start_time?: string;
      day_end_time?: string;
      night_start_time?: string;
      night_end_time?: string;
      sport_available?: boolean;
      court_count?: number;
    };
  };

  turf_length?: string;
  turf_breadth?: string;
  turf_height?: string;

  turf_active_status?: boolean;
}

export interface TurfListItem {
  id: string;
  turf_id: string;
  turf_name?: string;
  turf_location?: string;
  turf_active_status?: boolean;
  created_at?: any;
  available_sports_list?: string[];
  // add only what you actually display in the list
}