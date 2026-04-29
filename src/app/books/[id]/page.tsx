import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BookDetailClient from "./BookDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      }
    >
      <BookDetailClient id={id} />
    </Suspense>
  );
}
