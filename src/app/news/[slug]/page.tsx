import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { newsData } from "@/data/news";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Newspaper,
  ArrowRight,
} from "lucide-react";

export async function generateStaticParams() {
  return newsData.map((item) => ({
    slug: item.slug,
  }));
}

export default async function SingleNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = newsData.find((n) => n.slug === slug);

  if (!article) {
    notFound();
  }

  const sourceLabel = article.sourceName || "Media Release";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-white transition-colors">
              News
            </Link>
            <span>/</span>
            <span className="text-[#34D399] truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 text-[11px] font-mono font-bold">
                {article.category}
              </span>
              <span className="text-xs text-emerald-200/70 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#34D399]" /> {article.date}
              </span>
              <span className="text-xs text-emerald-200/70 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#34D399]" /> {article.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs font-mono text-slate-300">
                Published by: <span className="text-white font-bold">{sourceLabel}</span>
              </span>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Read on {sourceLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: ARTICLE BODY & CONTENT
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Back Button */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#087EA4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All News & Press</span>
          </Link>

          {/* Featured Image */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Summary Box */}
          <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-100 text-slate-800 text-sm leading-relaxed font-medium">
            {article.summary}
          </div>

          {/* Article Paragraphs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {Array.isArray(article.content) ? (
              article.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))
            ) : (
              <p>{article.content}</p>
            )}

            <div className="my-6 p-6 rounded-xl bg-slate-50 border-l-4 border-[#087EA4] text-slate-900 font-medium italic text-sm sm:text-base">
              &ldquo;Nepal&apos;s clean energy trajectory represents one of the most formidable multi-billion dollar investment and engineering opportunities in Asia over the next decade.&rdquo;
            </div>

            {article.sourceUrl && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Original Source: {sourceLabel}
                </span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087EA4] hover:underline"
                >
                  <span>Visit original article at {sourceLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
