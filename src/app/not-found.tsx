import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 text-center">
        <h1 className="font-serif text-4xl">Page not found</h1>
        <p className="text-lg text-dusk">
          The page you&rsquo;re looking for isn&rsquo;t here.
        </p>
        <Link className="btn-secondary mx-auto" href="/">
          Back to home
        </Link>
      </div>
    </Container>
  );
}
