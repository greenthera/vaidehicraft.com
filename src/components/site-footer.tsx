import { CookieSettings } from "@/components/cookie-consent";
import Image from "@/components/site-image";
import Link from "next/link";
import { navigation } from "@/lib/navigation";
import logo from "../../public/images/vaidehi-craft-green-logo.avif";

const heading = "mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#b9c4b9]";
const link = "inline-flex min-h-11 items-center text-[15px] hover:text-white hover:underline min-[1000px]:min-h-9";
const locations = [{ label: "Surat", href: "/contact#surat" }, { label: "Pune", href: "/contact#pune" }];

export function SiteFooter() {
  return (
    <footer data-site-footer className="bg-[#244536] text-[#ede7df]">
      <div className="px-5 pt-12 min-[640px]:px-[7.5%] min-[1000px]:pt-[72px]">
        <Link href="/" aria-label="Vaidehi Craft home" className="mb-4 block w-44 min-[1000px]:mb-5 min-[1000px]:w-[208px]"><Image src={logo} unoptimized alt="Vaidehi Craft" width={208} className="h-auto w-full brightness-0 invert" /></Link>
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 min-[1000px]:grid-cols-[1.6fr_1fr_1fr_1fr] min-[1000px]:gap-14">
          <div className="col-span-2 flex flex-col items-start gap-3.5 border-b border-[#ede7df]/20 pb-9 min-[1000px]:col-span-1 min-[1000px]:border-0 min-[1000px]:pb-0">
            <p className="max-w-[300px] text-[15px] leading-[26px] text-[#c9d2c9]">Handcrafted cane furniture for homes that love natural materials. Since 1998.</p>
            <div className="flex flex-col">
              <a href="tel:+919824177913" className={`${link} gap-2.5 font-bold`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                098241 77913
              </a>
              <a href="mailto:connect@vaidehicraft.com" className={`${link} gap-2.5`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                connect@vaidehicraft.com
              </a>
            </div>
            <Link href="/contact" className="mt-1 inline-flex min-h-12 w-full items-center justify-center bg-[#ede7df] px-6 text-sm font-bold tracking-[0.04em] text-[#244536] transition-colors hover:bg-white min-[1000px]:w-auto">Get in touch</Link>
          </div>
          <nav aria-label="Collections" className="flex flex-col">
            <h2 className={heading}>Collections</h2>
            {navigation.slice(1, 5).map((item) => <Link key={item.href} href={item.href} className={link}>{item.label}</Link>)}
          </nav>
          <div className="flex flex-col gap-7 min-[1000px]:contents">
            <nav aria-label="Explore" className="flex flex-col">
              <h2 className={heading}>Explore</h2>
              <Link href="/contact" className={link}>Contact us</Link>
            </nav>
            <nav aria-label="Store locations" className="flex flex-col">
              <h2 className={heading}>Location</h2>
              {locations.map((item) => <Link key={item.href} href={item.href} className={link}>{item.label}</Link>)}
            </nav>
          </div>
        </div>
        <div className="mt-12 grid justify-items-center border-t border-[#ede7df]/20 pb-12 pt-6 text-center min-[640px]:pb-7 text-[13px] text-[#c9d2c9] min-[1000px]:mt-16 min-[1000px]:flex min-[1000px]:items-end min-[1000px]:justify-between min-[1000px]:gap-6 min-[1000px]:py-5">
          {/* Desktop: policy links sit above the copyright on the left; smaller screens keep the copyright first. */}
          <div className="flex flex-col items-center min-[1000px]:flex-col-reverse min-[1000px]:items-start">
          <p className="flex min-h-11 items-center">© 1998 – {new Date().getUTCFullYear()} Vaidehi Craft. All rights reserved.</p>
          <nav aria-label="Privacy and cookies" className="flex flex-wrap items-center justify-center gap-x-6 min-[1000px]:justify-start min-[1000px]:gap-x-7">
            <Link href="/privacy-policy" className="inline-flex min-h-11 items-center text-[#ede7df] hover:text-white hover:underline">Privacy policy</Link>
            <Link href="/cookie-policy" className="inline-flex min-h-11 items-center text-[#ede7df] hover:text-white hover:underline">Cookie policy</Link>
            <CookieSettings className="inline-flex min-h-11 cursor-pointer items-center normal-case text-[#ede7df] hover:text-white hover:underline" />
          </nav>
          </div>
          <p className="flex min-h-11 items-center gap-1">Developed by <a href="https://www.shivantra.com/?utm_source=vaidehi_craft&utm_medium=referral&utm_campaign=footer_credit" target="_blank" rel="noopener noreferrer" aria-label="Shivantra (opens in a new tab)" className="font-bold text-[#ede7df] hover:text-white hover:underline">Shivantra</a></p>
        </div>
      </div>
    </footer>
  );
}
