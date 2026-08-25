import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ChevronDown,
  CircleHelp,
  CreditCard,
  MessageCircleMore,
  PackageCheck,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../app/contexts/LanguageContext";
import {
  frequentlyAskedQuestions,
  supportContent,
  type FrequentlyAskedQuestion,
} from "../features/support/supportContent";
import MainLayout from "../shared/layouts/MainLayout";

const topicIcons: Record<FrequentlyAskedQuestion["topic"], typeof ShoppingBag> = {
  order: ShoppingBag,
  payment: CreditCard,
  shipping: PackageCheck,
  returns: RotateCcw,
};

export default function SupportPage() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<FrequentlyAskedQuestion["topic"] | null>(null);
  const content = supportContent[lang];
  const questions = frequentlyAskedQuestions[lang];

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(lang === "vi" ? "vi-VN" : "en-US");

    return questions.filter((item) => {
      const matchesTopic = !topic || item.topic === topic;
      const matchesQuery = !normalizedQuery
        || `${item.question} ${item.answer}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesTopic && matchesQuery;
    });
  }, [lang, query, questions, topic]);

  const clearFilters = () => {
    setQuery("");
    setTopic(null);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{content.eyebrow} | QuyDung</title>
      </Helmet>

      <main className="bg-bg-secondary">
        <section className="relative overflow-hidden border-b border-border bg-bg px-3 py-14 md:py-20">
          <div className="pointer-events-none absolute -left-24 top-4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary">
              <CircleHelp size={15} />
              {content.eyebrow}
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-text md:text-5xl">
              {content.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              {content.description}
            </p>

            <label className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <Search className="shrink-0 text-text-secondary" size={21} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-secondary/70"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="cursor-pointer rounded-md p-1 text-text-secondary transition hover:bg-bg-secondary hover:text-text"
                  aria-label={content.clearSearch}
                >
                  <X size={18} />
                </button>
              )}
            </label>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-3 py-10 md:px-6 md:py-14">
          <section>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text md:text-3xl">{content.topicsTitle}</h2>
              <p className="mt-2 text-text-secondary">{content.topicsDescription}</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(content.topics) as FrequentlyAskedQuestion["topic"][]).map((key) => {
                const Icon = topicIcons[key];
                const selected = topic === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTopic(selected ? null : key)}
                    className={`cursor-pointer rounded-xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-bg"}`}
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={22} />
                    </span>
                    <span className="mt-4 block font-semibold text-text">{content.topics[key].title}</span>
                    <span className="mt-1 block text-sm leading-6 text-text-secondary">{content.topics[key].description}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-4xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text md:text-3xl">{content.faqTitle}</h2>
              <p className="mt-2 text-text-secondary">{content.faqDescription}</p>
            </div>

            <div className="mt-7 space-y-3">
              {filteredQuestions.map((item) => (
                <details key={item.question} className="group rounded-xl border border-border bg-bg open:border-primary/40 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-text transition hover:text-primary [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="shrink-0 text-text-secondary transition-transform group-open:rotate-180" size={20} />
                  </summary>
                  <p className="border-t border-border px-5 py-4 leading-7 text-text-secondary">{item.answer}</p>
                </details>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-bg px-5 py-10 text-center">
                  <Search className="mx-auto text-text-secondary" size={30} />
                  <p className="mt-3 font-medium text-text">{content.noResults}</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 cursor-pointer font-semibold text-primary transition hover:text-primary/80"
                  >
                    {content.clearSearch}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="relative mt-14 overflow-hidden rounded-2xl bg-primary px-6 py-9 text-white shadow-lg md:px-10">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/10" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:inline-flex">
                  <MessageCircleMore size={25} />
                </span>
                <div>
                  <h2 className="text-2xl font-bold">{content.contactTitle}</h2>
                  <p className="mt-2 max-w-2xl text-white/80">{content.contactDescription}</p>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
              >
                <MessageCircleMore size={19} />
                {content.contactButton}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
