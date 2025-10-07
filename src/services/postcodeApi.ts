import { apiService } from "./api";
import type { PostcodeSearchResult } from "../types/postcode";

export const postcodeApi = {
  async validatePostcode(postcode: string): Promise<PostcodeSearchResult> {
    try {
      const response = await apiService.validatePostcode(postcode);
      return {
        postcode: response.result.postcode,
        latitude: parseFloat(response.result.latitude),
        longitude: parseFloat(response.result.longitude),
        valid: true,
      };
    } catch {
      return {
        postcode,
        latitude: 0,
        longitude: 0,
        valid: false,
      };
    }
  },

  async validateMultiplePostcodes(
    postcodes: string[]
  ): Promise<PostcodeSearchResult[]> {
    const results = await Promise.allSettled(
      postcodes.map((postcode) => this.validatePostcode(postcode))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        // Return invalid result for rejected promises
        return {
          postcode: postcodes[index],
          latitude: 0,
          longitude: 0,
          valid: false,
        };
      }
    });
  },

  formatPostcode(postcode: string): string {
    return postcode.replace(/\s+/g, "").toUpperCase();
  },

  parsePostcodeInput(input: string): string[] {
    return input
      .split(",")
      .map((pc) => this.formatPostcode(pc.trim()))
      .filter((pc) => pc.length > 0);
  },
};
