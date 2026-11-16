import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";
import { CookieSettings } from "@/components/cookie-consent";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Privacy Policy", "How Vaidehi Craft handles enquiries, contact permissions, cookies and embedded maps on this website.", "/privacy-policy");

export default function PrivacyPolicy() {
  return <PolicyPage title="Privacy policy" description="How we use the information you share with Vaidehi Craft.">
    <section><h2>Information we collect</h2><p>Our enquiry forms collect your first name, email address, phone number, and selected furniture categories and products. The general enquiry form also accepts an optional message. We record the source page, your form confirmation, and the submission time with your enquiry.</p></section>
    <section><h2>How we use your details</h2><p>We use your details to respond to enquiries, discuss furniture, and prepare quotations. On our enquiry forms, we ask for your agreement to use your contact details for marketing and calls.</p></section>
    <section><h2>Enquiry records</h2><p>Your enquiry is submitted to third-party form-processing and storage services for our team to review. The website does not automatically delete enquiry records after a fixed period. Contact us with questions about information you have submitted.</p></section>
    <section><h2>Cookies and analytics</h2><p>Our preference cookie remembers your choices for 182 days. Analytics is off until you accept it. Analytics tools load only after your permission; advertising consent remains denied.</p><p>You can change analytics preferences using Cookie settings. Read our <Link href="/cookie-policy">Cookie Policy</Link> for details.</p><CookieSettings /></section>
    <section><h2>Continuing on WhatsApp</h2><p>After submitting an enquiry, you are redirected to WhatsApp to continue the conversation with our team. The link prefills a message with your first name and the furniture products you selected, including the selected design or finish where listed. You choose whether to send the message. Messages you send on WhatsApp are handled under its own privacy policy.</p></section>
    <section><h2>Maps and external services</h2><p>Embedded maps load on the contact page as an always-enabled service. They share connection information with the map provider, which may use its own cookies. Messaging, social-media, and external map links open services with their own privacy policies.</p><p>Our hosting and service providers also process technical information needed to deliver the website and handle requests, such as IP addresses and browser details.</p></section>
  </PolicyPage>;
}
