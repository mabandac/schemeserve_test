import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type { PostcodeResponse } from "../types/postcode";
import type { CrimeData } from "../types/crime";
import type { ApiError } from "../types/api";

class ApiService {
  private postcodeApi: AxiosInstance;
  private crimeApi: AxiosInstance;

  constructor() {
    this.postcodeApi = axios.create({
      baseURL: "http://api.getthedata.com/postcode",
      timeout: 10000,
    });

    this.crimeApi = axios.create({
      baseURL: "https://data.police.uk/api/crimes-street/all-crime",
      timeout: 15000,
    });
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message: (error.response.data as any)?.error || "API request failed",
        status: error.response.status,
        code: error.response.statusText,
      };
    } else if (error.request) {
      return {
        message: "Network error - please check your connection",
        status: 0,
        code: "NETWORK_ERROR",
      };
    } else {
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  async validatePostcode(postcode: string): Promise<PostcodeResponse> {
    try {
      const response = await this.postcodeApi.get(`/${postcode}`);
      const data = response.data;

      // Handle the actual API response structure
      if (data.status === "match") {
        return {
          status: 200,
          result: {
            postcode: data.data.postcode,
            latitude: data.data.latitude,
            longitude: data.data.longitude,
            status: data.data.status || "live",
            usertype: data.data.usertype || "small",
            easting: data.data.easting || 0,
            northing: data.data.northing || 0,
            positional_quality_indicator:
              data.data.positional_quality_indicator || 0,
            country: data.data.country || "England",
            postcode_no_space:
              data.data.postcode_no_space ||
              data.data.postcode.replace(/\s+/g, ""),
            postcode_fixed_width_seven:
              data.data.postcode_fixed_width_seven || data.data.postcode,
            postcode_fixed_width_eight:
              data.data.postcode_fixed_width_eight || data.data.postcode,
            postcode_area: data.data.postcode_area || "",
            postcode_district: data.data.postcode_district || "",
            postcode_sector: data.data.postcode_sector || "",
            outcode: data.data.outcode || "",
            incode: data.data.incode || ""
          },
        };
      } else {
        throw new Error("Postcode not found");
      }
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getCrimeData(
    lat: number,
    lng: number,
    date: string
  ): Promise<CrimeData[]> {
    try {
      const response = await this.crimeApi.get<CrimeData[]>("", {
        params: {
          lat,
          lng,
          date,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async validateMultiplePostcodes(
    postcodes: string[]
  ): Promise<PostcodeResponse[]> {
    const validationPromises = postcodes.map((postcode) =>
      this.validatePostcode(postcode).catch((error) => ({ error, postcode }))
    );

    const results = await Promise.allSettled(validationPromises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PostcodeResponse> =>
          result.status === "fulfilled" && !("error" in result.value)
      )
      .map((result) => result.value);
  }
}

export const apiService = new ApiService();
