import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Footer () {
  const footerLinks = [
    {
      title: "Information",
      links: [
        { linkText: "About us", url: "#" },
        { linkText: "Contact us", url: "#" },
        { linkText: "Company Information", url: "#" },
        { linkText: "Ghorer Bazar Stories", url: "#" },
        { linkText: "Terms & Conditions", url: "#" },
        { linkText: "Privacy Policy", url: "#" },
        { linkText: "Careers", url: "#" },
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
        { linkText: "Order Tracking", url: "#" },
        { linkText: "Payment", url: "#" },
        { linkText: "Shipping", url: "#" },
        { linkText: "FAQ", url: "#" },
      ],
    },
    {
      title: "Consumer Policy",
      links: [
        { linkText: "Happy Return", url: "#" },
        { linkText: "Refund Policy", url: "#" },
        { linkText: "Exchange", url: "#" },
        { linkText: "Cancellation", url: "#" },
        { linkText: "Pre-Order", url: "#" },
        { linkText: "EXtra Discount", url: "#" },
      ],
    },
  ];

  return (
    <div className="pt-20 px-10 md:px-30 lg:px-50 pb-5 border-t-2 lg:text-sm">
      <div className="lg:flex lg:gap-10">
        {/* website description */}
        <div className="lg:w-1/3 lg:shrink-0">
          <Image
            src="https://backoffice.ghorerbazar.com/company_logo/qJaKf1768887846.png"
            alt="Sohozlovvo Logo"
            className="w-60 lg:w-50 h-auto"
            width={60}
            height={50}
          />

          <p className="text-muted-foreground py-5">
            Ghorer Bazar is an e-commerce platform dedicated to providing safe
            and reliable food to every home.
          </p>

          {/* contact + location */}
          <div className="py-5 space-y-2">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin />
              <p>Rampura, Dhaka, Bangladesh</p>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone />
              <a href="tel:+09642922922">09642922922</a>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail />
              <a href="mailto:contact@ghorerbazar.com">
                contact@ghorerbazar.com
              </a>
            </div>
          </div>

          {/* social icon box */}
          <div className="flex gap-4 py-5">
            <a
              href="#"
              target="_blank"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <Facebook className="size-5 fill-[#f48721] stroke-0 group-hover:fill-white transition-all" />
            </a>
            <a
              href="#"
              target="_blank"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <Twitter className="size-5 fill-[#f48721] stroke-0 group-hover:fill-white transition-all" />
            </a>
            <a
              href="#"
              target="_blank"
              className="group rounded-full p-4 bg-muted-foreground/10 hover:bg-[#f48721] transition-all cursor-pointer"
            >
              <Instagram className="size-5 stroke-[#f48721] group-hover:stroke-white transition-all" />
            </a>
          </div>

          {/* mobile app section */}
          <div className="pt-5 pb-10">
            <h2>Download App on Mobile:</h2>
            <div className="flex gap-3 justify-start items-center py-2.5">
              <a
                href="https://play.google.com/store/apps/details?id=com.ghorerbazar.official"
                target="_blank"
              >
                <img
                  src="https://ghorerbazar.com/assets/images/google-play.svg"
                  alt="play-store"
                />
              </a>
              <a href="#" target="_blank">
                <img
                  src="https://ghorerbazar.com/assets/images/app-store.svg"
                  alt="play-store"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-15 lg:flex-1">
          {footerLinks.map((linkGroup) => (
            <div key={linkGroup.title} className="space-y-5">
              <h2>{linkGroup.title}</h2>
              <div className="space-y-2 flex flex-col">
                {linkGroup.links.map((link) => (
                  <Link
                    key={link.linkText}
                    href={link.url}
                    className="text-muted-foreground"
                  >
                    {link.linkText}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-3" />

      {/* payment + copyright section */}
      <div className="py-5 space-y-2 lg:flex lg:flex-row-reverse lg:items-center justify-between">
        <img
          src="https://backoffice.ghorerbazar.com/company_logo/faysy1756641916.png"
          alt="Payment gateways"
          className="sm:w-2xl h-auto mx-auto"
        />
        <h3 className="text-center lg:text-left text-muted-foreground text-xs sm:text-sm lg:flex-1">
          Copyright © 2026 GhorerBazar
        </h3>
      </div>
    </div>
  );
}
export default Footer;
