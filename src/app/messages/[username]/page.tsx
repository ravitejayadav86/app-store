import ChatClient from "./ChatClient";

export function generateStaticParams() {
  return [{ username: 'placeholder' }];
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ChatClient username={username} />;
}