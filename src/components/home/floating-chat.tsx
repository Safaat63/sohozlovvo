"use client";

import Image from "next/image";
import Link from "next/link";

function FloatingChat() {
  return (
    <Link
      href={"https://wa.me/+8801637469920"}
      className="fixed top-[80%] right-6 flex items-center gap-2.5"
    >
      <h4
        style={{
          boxShadow:
            "0.5px 0.5px 3px var(--muted-foreground), -0.5px 0px 3px var(--muted-foreground)",
        }}
        className="rounded-full rounded-tr-md bg-background px-3 py-1 text-sm lg:text-[1rem] text-muted-foreground"
      >
        👋 Chat with us ...
      </h4>
      {/* <div className='bg-accent-foreground p-2 lg:p-2.5 rounded-lg'> */}
      <Image
        alt="chat logo"
        src={"/svg/whatsapp.svg"}
        width={30}
        height={30}
        className="size-8 md:size-10 lg:size-12 stroke-2 stroke-foreground"
      />
      {/* </div> */}
    </Link>
  );
}

export default FloatingChat;
