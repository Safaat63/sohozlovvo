"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateLoyaltyPoints, addLoyaltyPoints, deductLoyaltyPoints } from "@/actions/loyalty"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Edit } from "lucide-react"

export function LoyaltyPointsManager({
    userId,
    currentPoints,
}: {
    userId: string
    currentPoints: number
}) {
    const [open, setOpen] = useState(false)
    const [points, setPoints] = useState(currentPoints.toString())
    const [action, setAction] = useState<"set" | "add" | "deduct">("set")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const pointsValue = parseInt(points)
        if (isNaN(pointsValue) || pointsValue < 0) {
            toast.error("Invalid points value")
            setLoading(false)
            return
        }

        let result
        switch (action) {
            case "set":
                result = await updateLoyaltyPoints(userId, pointsValue)
                break
            case "add":
                result = await addLoyaltyPoints(userId, pointsValue)
                break
            case "deduct":
                result = await deductLoyaltyPoints(userId, pointsValue)
                break
        }

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Loyalty points updated successfully")
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Loyalty Points</DialogTitle>
                    <DialogDescription>
                        Current points: {currentPoints}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={action === "set" ? "default" : "outline"}
                                onClick={() => setAction("set")}
                                className="flex-1"
                            >
                                Set
                            </Button>
                            <Button
                                type="button"
                                variant={action === "add" ? "default" : "outline"}
                                onClick={() => setAction("add")}
                                className="flex-1"
                            >
                                Add
                            </Button>
                            <Button
                                type="button"
                                variant={action === "deduct" ? "default" : "outline"}
                                onClick={() => setAction("deduct")}
                                className="flex-1"
                            >
                                Deduct
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="points">
                            {action === "set" ? "New Points" : action === "add" ? "Points to Add" : "Points to Deduct"}
                        </Label>
                        <Input
                            id="points"
                            type="number"
                            min="0"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="Enter points"
                            required
                        />
                        {action === "set" && (
                            <p className="text-xs text-muted-foreground">
                                This will replace current points with the new value
                            </p>
                        )}
                        {action === "add" && (
                            <p className="text-xs text-muted-foreground">
                                New total: {currentPoints + (parseInt(points) || 0)}
                            </p>
                        )}
                        {action === "deduct" && (
                            <p className="text-xs text-muted-foreground">
                                New total: {Math.max(0, currentPoints - (parseInt(points) || 0))}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Updating..." : "Update Points"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
