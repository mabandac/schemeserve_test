export interface PostcodeData {
  postcode: string;
  status: string;
  usertype: string;
  easting: number;
  northing: number;
  positional_quality_indicator: number;
  country: string;
  latitude: string;
  longitude: string;
  postcode_no_space: string;
  postcode_fixed_width_seven?: string;
  postcode_fixed_width_eight?: string;
  postcode_area?: string;
  postcode_district?: string;
  postcode_sector?: string;
  outcode?: string;
  incode?: string;
}

export interface PostcodeResponse {
  status: number;
  result: PostcodeData;
}

export interface PostcodeError {
  status: number;
  error: string;
}

export interface PostcodeSearchResult {
  postcode: string;
  latitude: number;
  longitude: number;
  valid: boolean;
}
