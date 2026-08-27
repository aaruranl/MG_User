export interface UserDetails {
  UserId: string;
  Email: string;
  PhoneNumber: string;
  UserType: 'Member' | 'Agent' | 'Admin' | string;
  FirstName: string;
  LastName: string;
  LoginType: string;
  TokenType: string;
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
  LoginUserType: 'Member' | 'Agent' | 'Admin';
}
