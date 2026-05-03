"use client"

import { Button } from '../ui/button'
import { ShoppingBag } from 'lucide-react'

function FloatingCart() {
    return (
        <Button className='fixed top-[50%] right-0 p-0 rounded-none rounded-l-md flex flex-col w-15 md:w-[67.5px] h-20 md:h-22.5 shadow-xl'>
            <div className='flex-1 w-full flex flex-col gap-1 items-center justify-center pt-2'>
                <ShoppingBag className='size-6' />
                <p>0 Items</p>
            </div>
            <div className='flex items-center justify-center bg-background w-full py-1 rounded-bl-sm'>
                <p className='text-xs md:text-sm font-semibold text-accent-foreground'>৳ 0.00</p>
            </div>
        </Button>
    )
}

export default FloatingCart