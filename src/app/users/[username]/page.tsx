import UserProfileClient from "./UserProfileClient";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <UserProfileClient username={username} />;
}
