import FollowersClient from "./FollowersClient";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <FollowersClient username={username} />;
}
