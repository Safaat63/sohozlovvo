import { getPublicSettings } from "@/actions/settings"
import Image from "next/image"
import Link from "next/link"

export async function FloatingSocialButtons() {
    const settings = await getPublicSettings()

    if (!settings.whatsapp_number) {
        return null
    }

    const whatsappLink = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
    const messengerLink = settings.facebook_url ? `${settings.facebook_url}` : null

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-3 z-40">
            {/* WhatsApp Button */}
            {settings.whatsapp_number && (
                <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label="Chat on WhatsApp"
                    title="Chat on WhatsApp"
                >
                    <Image src="/svg/whatsapp.svg" width={24} height={24} alt="WhatsApp" />
                    <span className="absolute right-16 md:right-20 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat with us
                    </span>
                </Link>
            )}

            {/* Messenger Button */}
            {messengerLink && (
                <Link
                    href={`${messengerLink.replace('facebook.com/', 'm.me/').replace(/\/+$/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label="Chat on Messenger"
                    title="Chat on Messenger"
                >
                    <Image src="/svg/messenger.svg" width={24} height={24} alt="Messenger" />
                    <span className="absolute right-16 md:right-20 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Message us
                    </span>
                </Link>
            )}
        </div>
    )
}
