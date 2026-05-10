"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { formatDateDhaka } from "@/lib/utils"
import React from "react"

interface ProductTabsProps {
    product: any
    verifiedReviews: any[]
    videoEmbedUrl: string | null
    reviewFormComponent: React.ReactNode
    sessionUser: any
    loginLinkComponent: React.ReactNode
}

export function ProductTabs({
    product,
    verifiedReviews,
    videoEmbedUrl,
    reviewFormComponent,
    sessionUser,
    loginLinkComponent
}: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState("description")

    return (
        <div className="mt-10 bg-white rounded-lg border border-[#eaeaea] shadow-sm overflow-hidden">
            {/* Tab Headers */}
            <div className="flex flex-wrap items-center bg-[#Fbf9f5] border-b border-[#eaeaea] p-3 gap-2">
                <button 
                    onClick={() => setActiveTab("description")}
                    className={`px-6 py-2 rounded text-sm font-bold transition-colors ${activeTab === "description" ? "bg-[#f48721] text-white" : "bg-transparent text-[#252a34] hover:bg-gray-200"}`}
                >
                    Description
                </button>
                {videoEmbedUrl && (
                    <button 
                        onClick={() => setActiveTab("video")}
                        className={`px-6 py-2 rounded text-sm font-bold transition-colors ${activeTab === "video" ? "bg-[#f48721] text-white" : "bg-transparent text-[#252a34] hover:bg-gray-200"}`}
                    >
                        Product Video
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab("reviews")}
                    className={`px-6 py-2 rounded text-sm font-bold transition-colors ${activeTab === "reviews" ? "bg-[#f48721] text-white" : "bg-transparent text-[#252a34] hover:bg-gray-200"}`}
                >
                    Reviews ({verifiedReviews.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-10">
                {/* Description Tab */}
                {activeTab === "description" && (
                    <div className="animate-in fade-in duration-300">
                        <h3 className="text-xl font-bold text-[#222831] mb-6 inline-block border-b-2 border-[#f48721] pb-1">
                            Product Details
                        </h3>
                        <div className="text-[#252a34] leading-loose text-[15px] space-y-6">
                            <p className="whitespace-pre-line">{product.description}</p>
                        </div>
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="mt-8 bg-[#FBF9F5] rounded border border-[#cccccc] p-5">
                                <h4 className="font-bold text-[#222831] mb-4">Specifications</h4>
                                <div className="flex flex-col">
                                    {product.specifications.map((spec: any, idx: number) => (
                                        <div key={spec.id} className={`flex py-2 px-4 ${idx % 2 === 0 ? 'bg-white' : ''} border-b border-[#cccccc] last:border-b-0`}>
                                            <span className="text-[#252a34] font-medium w-1/3">{spec.key}</span>
                                            <span className="text-[#252a34] w-2/3">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Video Tab */}
                {activeTab === "video" && videoEmbedUrl && (
                    <div className="animate-in fade-in duration-300">
                        <div className="w-full h-[250px] sm:h-[350px] md:h-[460px] bg-black rounded overflow-hidden relative shadow-md">
                            <iframe src={videoEmbedUrl} className="absolute top-0 left-0 w-full h-full border-0" allowFullScreen></iframe>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            
                            {/* Left: Rating Summary */}
                            <div className="lg:col-span-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-[56px] font-bold text-[#222831] leading-none">
                                        {Number(product.rating).toFixed(1)}
                                    </span>
                                    <div>
                                        <p className="text-[#252a34] font-medium mb-1">Average Rating</p>
                                        <div className="flex gap-1 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating.toString())) ? "fill-[#f48721] text-[#f48721]" : "fill-gray-200 text-gray-200"}`} />
                                            ))}
                                            <span className="ml-2 text-gray-500">({verifiedReviews.length} Reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-[#222831] mb-6">
                                    0.00% <span className="font-normal text-gray-500">Recommended (0 of 0)</span>
                                </p>
                                
                                <div className="space-y-3">
                                    {[5,4,3,2,1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-3">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < stars ? "fill-[#f48721] text-[#f48721]" : "fill-gray-200 text-gray-200"}`} />
                                                ))}
                                            </div>
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full"></div>
                                            <span className="text-xs text-gray-500 w-6 text-right">0%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Form & Review List */}
                            <div className="lg:col-span-8">
                                {sessionUser ? (
                                    <div className="mb-10">
                                        <h3 className="text-xl font-bold text-[#222831] mb-2 border-b-2 border-[#f48721] pb-2 inline-block">Submit Your Review</h3>
                                        <p className="text-sm text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
                                        {reviewFormComponent}
                                    </div>
                                ) : (
                                    <div className="mb-10 p-6 bg-[#FBF9F5] border border-[#eaeaea] rounded text-center">
                                        <p className="text-sm text-[#252a34] mb-3">Please sign in to write a review</p>
                                        {loginLinkComponent}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {verifiedReviews.length > 0 ? (
                                        verifiedReviews.map((review) => (
                                            <div key={review.id} className="py-4 border-b border-[#eaeaea] last:border-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-[#f48721] text-[#f48721]" : "fill-gray-200 text-gray-200"}`} />
                                                        ))}
                                                    </div>
                                                    <span className="font-bold text-sm text-[#222831] ml-2">{review.user.name}</span>
                                                    <span className="text-xs text-gray-400">• {formatDateDhaka(review.createdAt, "PP")}</span>
                                                </div>
                                                {review.title && <h5 className="font-bold text-[#222831] mb-1 text-sm">{review.title}</h5>}
                                                {review.comment && <p className="text-[#555] text-sm">{review.comment}</p>}
                                            </div>
                                        ))
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}