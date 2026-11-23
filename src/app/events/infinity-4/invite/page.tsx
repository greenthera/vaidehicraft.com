import Image from "@/components/site-image";
import { EventInviteActions } from "@/components/event-invite-actions";
import { SiteFooter } from "@/components/site-footer";
import { pageMetadata } from "@/lib/seo";
import divider from "../../../../../public/images/events/infinity-4/patterned-room-divider.webp";
import partnership from "../../../../../public/images/events/infinity-4/vaidehi-craft-infinity-4-partnership.webp";
import hangingChair from "../../../../../public/images/events/infinity-4/sculptural-hanging-cane-chair-shadow.webp";
import table from "../../../../../public/images/events/infinity-4/woven-cane-checkerboard-table-shadow.webp";
import lounge from "../../../../../public/images/events/infinity-4/cane-lounge-chair-and-ottoman-shadow.webp";
import showcase from "../../../../../public/images/events/infinity-4/infinity-4-2026-showcase.webp";

export const metadata = pageMetadata(
  "You’re invited to Infinity 4",
  "Discover Vaidehi Craft’s new cane furniture at Infinity 4, IIA-IIID Showcase, 26–28 December 2026. Visit stall F-06 in Sarsana, Surat.",
  "/events/infinity-4/invite",
  "/images/events/infinity-4/vaidehi-craft-infinity-4-invitation-og.jpg",
  false,
);

export default function InfinityInvitePage() {
  return (
    <>
    <main id="main-content" className="bg-[#f6f1e7] pt-20 text-[#6b4941] sm:pt-24">
      <div className="px-5 sm:px-[7.5%]">
      <Image src={divider} alt="Sculptural wooden room divider with circular blue and green patterned panels" priority sizes="(max-width: 639px) calc(100vw - 40px), 85vw" className="block h-auto w-full" />
      <article className="w-full overflow-hidden pb-16 sm:pb-24">
        <h1 className="sr-only">Vaidehi Craft invites you to Infinity 4</h1>
        <Image src={partnership} alt="Vaidehi Craft × Infinity 4, 2026" sizes="(max-width: 639px) calc(88vw - 35px), 75vw" className="mx-auto mt-4 h-auto w-[88%] sm:mt-6" />

        <section aria-label="A new collection inspired by Antoni Gaudí" className="mt-5 grid grid-cols-[54%_46%] items-start sm:mt-8">
          <p className="z-10 px-4 pt-10 text-center text-[13px] leading-relaxed sm:px-8 sm:pt-20 sm:text-xl lg:px-14 lg:pt-28 lg:text-2xl">
            After a successful showcase at Infinity 3.0, we’re back with something even better. Inspired by Antoni Gaudí, we set out to make pieces we had never made before.
          </p>
          <Image src={hangingChair} alt="Handwoven teardrop-shaped cane hanging chair with a sculptural frame and cream cushions" sizes="(max-width: 639px) calc(46vw - 18px), 39vw" className="h-auto w-full" />
        </section>

        <section aria-label="Made with patience and love" className="mt-8 grid grid-cols-[49%_51%] items-center sm:mt-12">
          <Image src={table} alt="Handcrafted cane table with a checkerboard wooden top and flowing woven base" sizes="(max-width: 639px) calc(49vw - 20px), 42vw" className="h-auto w-full" />
          <p className="px-3 text-center text-[13px] leading-relaxed sm:px-7 sm:text-xl lg:px-12 lg:text-2xl">
            Every bend took patience.<br />Every piece was made with love.<br />Our artisans can’t wait for you to see what they’ve made. Neither can we.
          </p>
        </section>

        <section aria-label="Be among the first" className="relative mt-10 sm:mt-16">
          <p className="absolute left-[6%] top-[7%] z-10 w-[51%] text-center text-[13px] leading-relaxed sm:text-xl lg:text-2xl">
            We’d like you to be among the first people to experience the uniqueness.
          </p>
          <Image src={lounge} alt="Curved green woven cane lounge chair and matching ottoman with soft neutral upholstery" sizes="(max-width: 639px) calc(84vw - 34px), 72vw" className="mx-auto h-auto w-[84%]" />
        </section>

        <section aria-labelledby="event-details" className="mx-auto mt-16 max-w-3xl px-6 text-center sm:mt-24 lg:mt-32">
          <EventInviteActions />
          <h2 id="event-details" className="text-lg uppercase tracking-[0.08em] sm:text-2xl">Come find us at</h2>
          <p className="mt-5 text-xl font-bold uppercase tracking-wide sm:text-3xl">Stall No. F-06</p>
          <Image src={showcase} alt="Infinity 4, 2026, IIA-IIID Showcase, 26–27–28 December" sizes="(max-width: 768px) 88vw, 720px" className="mx-auto mt-7 h-auto w-full" />
          <p className="sr-only">26–28 December 2026 · IIA-IIID Showcase</p>
          <address className="mt-7 text-sm not-italic leading-relaxed sm:text-xl">
            146/B, Althan - Sarsana Rd, near Khajod Chowkdi,<br className="hidden sm:block" /> Sarsana, Surat, Gujarat 395007
          </address>
        </section>
      </article>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
