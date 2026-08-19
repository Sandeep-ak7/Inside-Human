import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_EMAIL_HEADER = "x-authenticated-user-email";
const USER_FULL_NAME_HEADER = "x-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "x-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin";
const SIGN_OUT_PATH = "/signout";
const CALLBACK_PATH = "/callback";

export async function getAuthUser(): Promise<AuthUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const encoding = requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER);

  const fullName =
    encodedFullName && encoding === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : encodedFullName;

  return {
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function requireAuthUser(
  returnTo: string,
): Promise<AuthUser> {
  const user = await getAuthUser();
  if (user) return user;

  redirect(signInPath(returnTo));
}

export function signInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function signOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
