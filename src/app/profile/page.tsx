import ProfileClient from "./ProfileClient";

export default async function Page() {
  // In a real SSR scenario with cookie-based auth, we would fetch profile data here:
  // const profile = await getProfileFromServer();
  // return <ProfileClient initialProfile={profile} />;

  return <ProfileClient />;
}