export enum Gender {
  HOMME = "Homme",
  FEMME = "Femme",
  NON_SPECIFIE = "Non spécifié",
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
  acceptTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}
