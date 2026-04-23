import FollowingClient from "./FollowingClient";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <FollowingClient username={username} />;
}
