import type { Province, ProvinceDetails, Ward } from "../model/addressTypes";

const apiUrl = "https://provinces.open-api.vn/api/v2";

let provincesRequest: Promise<Province[]> | null = null;
const wardsRequests = new Map<number, Promise<Ward[]>>();

const request = async <TResponse>(path: string): Promise<TResponse> => {
  const response = await fetch(`${apiUrl}${path}`);

  if (!response.ok) {
    throw new Error("Administrative address data is unavailable");
  }

  return response.json() as Promise<TResponse>;
};

export const getProvinces = () => {
  provincesRequest ??= request<Province[]>("/?depth=1").catch((error) => {
    provincesRequest = null;
    throw error;
  });

  return provincesRequest;
};

export const getWards = (provinceCode: number) => {
  const cachedRequest = wardsRequests.get(provinceCode);
  if (cachedRequest) return cachedRequest;

  const wardsRequest = request<ProvinceDetails>(`/p/${provinceCode}?depth=2`)
    .then((province) => province.wards ?? [])
    .catch((error) => {
      wardsRequests.delete(provinceCode);
      throw error;
    });

  wardsRequests.set(provinceCode, wardsRequest);
  return wardsRequest;
};
