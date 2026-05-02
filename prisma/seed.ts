import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Utility to create URL-friendly slugs
 */
function slugify(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

const sampleCategories = [
    {
        name: 'Clothing',
        description: 'Apparel for men and women',
        children: [
            {
                name: "Men's Clothing",
                children: [
                    { name: 'Shirts' },
                    { name: 'Pants' },
                ],
            },
            {
                name: "Women's Clothing",
                children: [
                    { name: 'Dresses' },
                    { name: 'Tops' },
                ],
            },
        ],
    },
    {
        name: 'Electronics',
        description: 'Phones, accessories and gadgets',
        children: [
            {
                name: 'Phones',
                children: [{ name: 'Smartphones' }],
            },
            { name: 'Accessories' },
        ],
    },
    {
        name: 'Home & Living',
        children: [
            { name: 'Bedding' },
            { name: 'Kitchen' },
        ],
    },
]

const unsplash = (sig: number, q = 'product') => 
    `https://images.unsplash.com/photo-${sig}?auto=format&fit=crop&w=800&q=60&q=${encodeURIComponent(q)}`

/**
 * Clears database in correct order to respect FK constraints
 */
async function clearAll() {
    console.log('Cleaning database...')
    
    // 1. Delete junction/child tables first
    await prisma.productVariantCombinationOption.deleteMany()
    await prisma.productVariantCombination.deleteMany()
    await prisma.productVariationOption.deleteMany()
    await prisma.productVariation.deleteMany()
    await prisma.productSpec.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.review.deleteMany()
    await prisma.wishlistItem.deleteMany()
    
    // 2. Delete main entities
    await prisma.product.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cart.deleteMany()
    await prisma.address.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
}

/**
 * Recursively builds nested category creation objects
 */
function buildNestedCreate(node: any): any {
    return {
        name: node.name,
        slug: node.slug || slugify(node.name),
        description: node.description || null,
        children: node.children?.length 
            ? { create: node.children.map((c: any) => buildNestedCreate(c)) }
            : undefined
    }
}

async function createSampleUsers() {
    console.log('Creating users...')
    
    // Hash the admin password using bcryptjs
    const adminPassword = await bcrypt.hash('admin123', 12)

    const customer = await prisma.user.create({
        data: {
            email: 'customer@example.test',
            password: await bcrypt.hash('password123', 12),
            name: 'Sample Customer',
            phone: '01710000000',
            role: 'CUSTOMER',
        },
    })

    const admin = await prisma.user.create({
        data: {
            email: 'sohzolovvo@gmail.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    })

    return { customer, admin }
}

async function seed() {
    await clearAll()

    // Create Categories
    console.log('Seeding categories...')
    for (const cat of sampleCategories) {
        await prisma.category.create({
            data: buildNestedCreate(cat)
        })
    }

    // Get all leaf categories to assign products to
    const allCategories = await prisma.category.findMany()
    
    await createSampleUsers()

    console.log('Seeding products...')
    const productNames = [
        'Classic White Shirt', 'Everyday Hoodie', 'Slim Fit Jeans', 'Summer Dress',
        'Cotton T-Shirt', 'Wireless Earbuds', 'Bluetooth Speaker', 'Smartphone X',
        'Laptop Sleeve', 'Ceramic Mug', 'Scented Candle', 'Bamboo Cutting Board',
        'Comfort Pillow', 'Running Shoes', 'Baseball Cap', 'Leather Wallet'
    ]

    for (let i = 0; i < productNames.length; i++) {
        const name = productNames[i]
        const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
        
        const product = await prisma.product.create({
            data: {
                name,
                slug: `${slugify(name)}-${Math.floor(Math.random() * 1000)}`,
                description: `${name} is a high-quality sample product.`,
                price: (10 + Math.random() * 100).toFixed(2),
                stock: Math.floor(Math.random() * 50) + 10,
                brand: 'BrandX',
                images: [unsplash(i + 1, name)],
                categoryId: randomCategory.id,
                isActive: true,
                specifications: {
                    create: [
                        { key: 'Material', value: 'Premium' },
                        { key: 'Origin', value: 'Bangladesh' }
                    ]
                }
            }
        })
    }

    console.log('Seeding completed successfully.')
}

seed()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })