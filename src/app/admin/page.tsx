import { Container } from "@/components/Container";
import AdminClient from "@/app/admin/admin-client";

export default function AdminPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Admin</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Moderation queue
          </h1>
        </div>
        <AdminClient />
      </div>
    </Container>
  );
}
