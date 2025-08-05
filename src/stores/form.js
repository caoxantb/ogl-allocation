import { atomWithStorage } from "jotai/utils";

export const formData = atomWithStorage("formData", {
  fams: "",
  ogsPerFam: "",
});
