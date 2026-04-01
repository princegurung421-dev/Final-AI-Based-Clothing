import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { HeroInput } from "./HeroInput"
import { Card } from "@/components/ui/Card"

export default async function Home() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { images: true, reviews: true }
    });
  } catch (e) {
    console.error("Failed to fetch featured products:", e);
  }

  const OCCASION_PICKS = [
    { label: "Work outfit", query: "I need an outfit for work today", icon: "briefcase" },
    { label: "Casual weekend", query: "Relaxed outfit for the weekend", icon: "sun" },
    { label: "Date night", query: "Date night outfit ideas", icon: "heart" },
    { label: "Gym gear", query: "Show me activewear for the gym", icon: "dumbbell" },
    { label: "Trending", query: "Show me what's trending right now", icon: "flame" },
    { label: "Style advice", query: "Style advice for today's weather", icon: "cloud" },
  ];

  const CAPABILITIES = [
    { title: "Shop by conversation", desc: "Describe what you need and get instant product recommendations with one-tap Add to Bag.", step: "01", gradient: "from-emerald-500 to-teal-600" },
    { title: "Outfit recommendations", desc: "Weather-aware suggestions tailored to your occasion, budget, and personal style.", step: "02", gradient: "from-amber-500 to-orange-600" },
    { title: "Manage your wardrobe", desc: "Upload what you own and get advice on styling pieces you already have.", step: "03", gradient: "from-violet-500 to-purple-600" },
    { title: "Track everything", desc: "Check your cart, orders, and delivery status -- all through the chat.", step: "04", gradient: "from-sky-500 to-blue-600" },
  ];

  const CATEGORIES = [
    { name: "Outerwear", query: "Show me outerwear", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&q=80" },
    { name: "Dresses", query: "Show me dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80" },
    { name: "Tops", query: "Show me tops", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&q=80" },
    { name: "Footwear", query: "Show me footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { name: "Accessories", query: "Show me accessories", image: "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=400&q=80" },
    { name: "Knitwear", query: "Show me knitwear", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80" },
  ];

  const TESTIMONIALS = [
    { name: "Sophie M.", role: "Marketing Manager", text: "The AI stylist picked the perfect outfit for my interview. I got compliments all day and the job offer.", rating: 5 },
    { name: "James K.", role: "Software Engineer", text: "I hate shopping but WearWise makes it effortless. I just describe the occasion and get a whole outfit in seconds.", rating: 5 },
    { name: "Priya R.", role: "Design Lead", text: "The wardrobe feature is genius. It knows what I own and suggests new pieces that actually work with my existing clothes.", rating: 5 },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F7F2] via-[#FAFAF9] to-[#FDF6E7]" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 md:px-8 py-20 md:py-28">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Styling
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.08] mb-6">
              Your personal<br/>stylist, ready<br/>
              <span className="text-gradient">when you are.</span>
            </h1>
            <p className="text-[17px] text-muted max-w-[440px] leading-relaxed mb-2">
              Tell me what you need -- an outfit, style advice, or help finding something specific. I'll handle the rest.
            </p>
            <HeroInput />
            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-primary/60 to-accent/60" />
                ))}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">2,400+ happy shoppers</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-amber-400 text-[12px]">&#9733;</span>
                  ))}
                  <span className="text-[12px] text-muted ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative h-[520px] w-full">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80"
                alt="Fashion editorial"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -left-6 bottom-16 bg-white rounded-xl shadow-xl shadow-black/8 p-4 max-w-[200px] animate-float">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold mb-1">AI picked for you</p>
              <p className="text-[14px] font-medium">Cashmere Blend Coat</p>
              <p className="text-[13px] text-primary font-semibold">$189.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Occasion Quick Picks */}
      <section className="py-12 px-6 md:px-8 border-b border-border/40">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-muted/50 text-center mb-6">Quick Start -- Ask the Stylist</p>
          <div className="flex flex-wrap justify-center gap-3">
            {OCCASION_PICKS.map((pick) => (
              <Link
                key={pick.label}
                href={`/assistant?q=${encodeURIComponent(pick.query)}`}
                className="px-5 py-2.5 rounded-full border border-border/80 bg-white text-[14px] font-medium hover:border-primary hover:text-primary hover:bg-primary/[0.03] hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
              >
                {pick.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Shop by Category</h2>
            <p className="text-[15px] text-muted max-w-md mx-auto">Browse our curated collections or let the AI stylist find exactly what you need.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/assistant?q=${encodeURIComponent(cat.query)}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-[15px] font-semibold">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:px-8 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Everything through conversation</h2>
            <p className="text-[15px] text-muted max-w-lg mx-auto">No menus, no filters, no browsing. Just tell the AI stylist what you need.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES.map((cap) => (
              <div key={cap.step} className="group bg-white rounded-2xl p-6 border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cap.gradient} flex items-center justify-center mb-5`}>
                  <span className="text-white text-[14px] font-bold">{cap.step}</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2">{cap.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-[14px] font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              Start a conversation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] font-bold text-primary mb-2">Just Arrived</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">New In</h2>
            </div>
            <Link href="/browse" className="text-[14px] font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group">
              View all
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.slice(0, 8).map((product: any) => {
                const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
                const parsedOccasions = (() => {
                  try { return JSON.parse(product.occasions); } catch { return []; }
                })();
                const occasionTag = parsedOccasions[0] || product.category;
                const reviewCount = product.reviews?.length || 0;
                const avgRating = reviewCount > 0
                  ? product.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviewCount
                  : 0;

                return (
                  <Link key={product.id} href={`/product/${product.id}`} className="group block">
                    <Card className="border-none shadow-none bg-transparent">
                      <div className="aspect-[3/4] relative mb-4 bg-[#F5F4F2] overflow-hidden rounded-xl">
                        {primaryImage && (
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        {product.salePrice && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[11px] font-bold rounded-full">Sale</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-[15px] mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                        {reviewCount > 0 && (
                          <div className="flex items-center gap-1.5 text-[13px] text-muted mb-2">
                            <span className="text-amber-400">&#9733;</span>
                            <span>{avgRating.toFixed(1)} ({reviewCount})</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[14px]">
                          <span className="font-semibold">{"\u00A3"}{Number(product.price).toFixed(2)}</span>
                          {occasionTag && (
                            <span className="text-primary bg-primary/8 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              {occasionTag}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted text-[15px] bg-[#F9F9F8] rounded-2xl">
              No products available yet. Run <code className="bg-white px-2 py-1 rounded text-primary font-mono text-[13px]">npm run seed</code> to populate the store.
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-8 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">What our shoppers say</h2>
            <p className="text-[15px] text-muted">Real reviews from people who found their style with WearWise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-border/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-[16px]">&#9733;</span>
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed text-foreground mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[14px] font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">{t.name}</p>
                    <p className="text-[12px] text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-20 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-white">Ready to find your style?</h2>
          <p className="text-[16px] text-white/80 mb-8 max-w-lg mx-auto">Join thousands of shoppers who let AI do the hard work. Get personalized recommendations, weather-aware outfits, and effortless style.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary text-[14px] font-semibold rounded-full hover:bg-white/90 transition-colors shadow-lg"
            >
              Chat with your stylist
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white text-[14px] font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20"
            >
              Browse the store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
