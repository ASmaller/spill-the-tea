import { SuggestForm } from "@/components/SuggestForm/SuggestForm";

export default function Suggest() {
  return (
    <main className="bg-cream relative min-h-[100svh] pb-10">
      <h1
        className="text-ink-muted mt-1 px-4 pt-6 pb-2 font-serif leading-[1.05]"
        style={{ fontSize: 34, letterSpacing: -0.6 }}
      >
        Leave a suggestion
      </h1>
      <SuggestForm />
    </main>
  );
}
