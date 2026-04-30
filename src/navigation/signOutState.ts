let signingOut = false;

export const isSigningOut = () => signingOut;

export const setSigningOut = (value: boolean) => {
  signingOut = value;
};
