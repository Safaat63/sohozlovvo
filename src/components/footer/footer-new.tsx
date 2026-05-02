import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Youtube,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Footer() {
  const footerLinks = [
    {
      title: "Information",
      links: [
        { linkText: "About us", url: "/about" },
        { linkText: "Contact us", url: "/contact" },
        { linkText: "Terms & Conditions", url: "/terms" },
        { linkText: "Privacy Policy", url: "/privacy" },
        
      ],
    },
    {
      title: "Shop By",
      links: [
        { linkText: "Oil & Ghee", url: "#" },
        { linkText: "Honey", url: "#" },
        { linkText: "Dates", url: "#" },
        { linkText: "Spices", url: "#" },
        { linkText: "Nuts & Seeds", url: "#" },
        { linkText: "Beverage", url: "#" },
        { linkText: "Functional Foods", url: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { linkText: "Support Center", url: "#" },
        { linkText: "How to Order", url: "#" },
        { linkText: "Order Tracking", url: "/tracking" },
        { linkText: "Payment", url: "#" },
        { linkText: "Shipping", url: "#" },
        { linkText: "FAQ", url: "/faq" },
      ],
    },
    {
      title: "Others",
      links: [
        { linkText: "Affiliate", url: "/affiliate" },
        { linkText: "Wish List", url: "/wishlist" },
        { linkText: "Refund Policy", url: "/privacy" },
      
      ],
    },
  ];

  return (
    <div className="pt-20 px-5 md:px-15 lg:px-25 pb-5 border-t-2 lg:text-sm">
      <div className="lg:flex lg:gap-10">
        {/* website description */}
        <div className="lg:w-1/3 lg:shrink-0">
          {/* Note: Update the src below when you have the official Sohozlovvo logo URL */}
          <Image
            src="https://backoffice.ghorerbazar.com/company_logo/qJaKf1768887846.png"
            alt="Sohozlovvo Logo"
            className="w-60 lg:w-50 h-auto"
            width={60}
            height={50}
          />

          <p className="text-muted-foreground py-5 font-medium">
            প্রাকৃতিক পণ্য ও খাঁটি স্বাদের সহজ ঠিকানা
          </p>

          {/* contact + location */}
          <div className="py-5 space-y-2">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="size-5 shrink-0" />
              <p>Bangladesh</p>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="size-5 shrink-0" />
              <a href="tel:+8801637469920">01637-469920</a>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="size-5 shrink-0" />
              <a href="mailto:sohozlovvoo@gmail.com">
                sohozlovvoo@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MessageCircle className="size-5 shrink-0" />
              <a href="https://wa.me/+8801637469920" target="_blank" rel="noreferrer">
                +880 1637-469920
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MessageSquare className="size-5 shrink-0" />
              <a href="https://m.me/SohozlovvoFood" target="_blank" rel="noreferrer">
                Sohozlovvo Food
              </a>
            </div>
          </div>

          {/* social icon box */}
          <div className="flex flex-wrap gap-4 py-5 pb-10">
            <a
              href="https://instagram.com/sohozlovvo"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <Instagram className="size-5 stroke-[#f48721] group-hover:stroke-white transition-all" />
            </a>
            <a
              href="https://youtube.com/@Sohozlovvos"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <Youtube className="size-5 stroke-[#f48721] group-hover:stroke-white transition-all" />
            </a>
            <a
              href="https://chat.whatsapp.com/BYjadDWo802KAr97hz2AQu?mode=gi_t"
              title="WhatsApp Group"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <MessageCircle className="size-5 stroke-[#f48721] group-hover:stroke-white transition-all" />
            </a>
            
            {/* Custom text-based fallback icons for TikTok and Pinterest since standard Lucide doesn't have them */}
            <a
              href="https://tiktok.com/@Sohozlovvo"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full w-[52px] h-[52px] flex items-center justify-center bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-[#f48721] group-hover:text-white transition-all">TikTok</span>
            </a>
            <a
              href="https://pinterest.com/Sohozlovvo"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full w-[52px] h-[52px] flex items-center justify-center bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
               <span className="text-xs font-bold text-[#f48721] group-hover:text-white transition-all">Pin</span>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-15 lg:flex-1 text-sm">
          {footerLinks.map((linkGroup) => (
            <div key={linkGroup.title} className="space-y-5">
              <h2 className="font-semibold">{linkGroup.title}</h2>
              <div className="space-y-2 flex flex-col">
                {linkGroup.links.map((link) => (
                  <Link
                    key={link.linkText}
                    href={link.url}
                    className="text-muted-foreground hover:text-[#f48721] transition-colors"
                  >
                    {link.linkText}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-3 border-muted-foreground/20" />

      {/* copyright section */}
      <div className="py-5 space-y-2 flex items-center justify-center lg:justify-start">
        <h3 className="text-center lg:text-left text-muted-foreground text-xs sm:text-sm">
          Copyright © {new Date().getFullYear()} Sohozlovvo | Developed by <Link href="https://miftahcoding.com/" className="hover:text-primary font-bold">MiftahCoding</Link>
        </h3>
      </div>
    </div>
  );
}

export default Footer;