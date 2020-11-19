export interface followersList {
  ids: string[];
  next_cursor: number;
  next_cursor_str: string;
  previous_cursor: number;
  previous_cursor_str: string;
}

export interface TwitterUserDto {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  derived?: any;
  url: string;
  entities?: any;
  description: string;
  protected: boolean;
  verified: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  favourites_count: number;
  statuses_count: number;
  status?: { [key: string]: any };
  created_at: string;
  profile_banner_url: string;
  profile_image_url_https: string;
  default_profile: boolean;
}
