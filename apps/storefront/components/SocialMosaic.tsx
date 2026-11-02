import Image from "next/image";
import { Camera } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface SocialMosaicProps {
  dict: ReturnType<typeof getDictionary>;
}

export function SocialMosaic({ dict }: SocialMosaicProps) {
  const posts = [
    {
      title: "Vendemmia all'alba",
      tag: "#FianoDelCilento",
      image: "/images/raccolta.jpeg",
    },
    {
      title: "Note di macchia cilentana",
      tag: "#AglianicoRiserva",
      image: "/images/aglianico-cilento.jpg",
    },
    {
      title: "Calici e sapori del Cilento",
      tag: "#LiChiaiExperience",
      image: "/images/fiano-cilento.jpg",
    },
    {
      title: "Il Flysch del Parco del Cilento",
      tag: "#CilentoDOC",
      image: "/images/cilento-rosso.jpg",
    },
  ];

  return (
    <section
      aria-label="Community e Social Cantina de Li Chiai"
      className="py-16 bg-ivory-50 border-b border-ivory-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#4a141b] mb-1.5">
            <Camera className="w-4 h-4 text-[#4a141b]" />
            <span>@cantinadelichiai</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wine-950 mb-2">
            {dict.social.title}
          </h2>
          <p className="text-cellar-600 text-xs sm:text-sm">
            {dict.social.subtitle}
          </p>
        </div>

        {/* 4 Social Mosaic Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-ivory-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cellar-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold leading-tight">{post.title}</span>
                <span className="text-[10px] text-gold-300 mt-0.5">{post.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
