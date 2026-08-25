export type AdministrativeUnit = {
  code: number;
  name: string;
};

export type Province = AdministrativeUnit;

export type Ward = AdministrativeUnit & {
  province_code: number;
};

export type ProvinceDetails = Province & {
  wards: Ward[];
};

export type VietnameseAddress = {
  provinceCode: number | null;
  provinceName: string;
  wardCode: number | null;
  wardName: string;
  addressLine: string;
};

export const emptyVietnameseAddress = (): VietnameseAddress => ({
  provinceCode: null,
  provinceName: "",
  wardCode: null,
  wardName: "",
  addressLine: "",
});

export const formatVietnameseAddress = (address: VietnameseAddress) =>
  [address.addressLine, address.wardName, address.provinceName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
