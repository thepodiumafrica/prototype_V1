import { PostDetail } from "@/components/PostDetail";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetail id={id} otype="Forum Post" backHref="/forum" />;
}
