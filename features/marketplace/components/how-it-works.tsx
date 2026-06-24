import { MessagesSquare, Search, Tag } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Discover",
    body: "Browse thousands of phones and accessories, filtered by brand, price, and city.",
  },
  {
    icon: MessagesSquare,
    title: "Chat",
    body: "Message sellers directly, ask questions, and agree on a fair price.",
  },
  {
    icon: Tag,
    title: "Deal",
    body: "Meet safely, inspect the device, and close the deal with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="bg-primary text-primary-foreground grid size-12 place-items-center rounded-full">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}.</span>
                {title}
              </h3>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
