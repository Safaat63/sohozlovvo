"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { bulkUpdateCategories } from "@/actions/admin-categories"
import { Edit2 } from "lucide-react"

type Category = {
    id: string
    name: string
    slug: string
    isActive: boolean
    showInMenu?: boolean
}

export function BulkEditDialog({ categories }: { categories: Category[] }) {
    const [open, setOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [action, setAction] = useState<"activate" | "deactivate" | "show-in-menu" | "hide-from-menu">("activate")
    const [isPending, startTransition] = useTransition()

    const toggleCategory = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === categories.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(categories.map((c) => c.id)))
        }
    }

    const handleBulkUpdate = () => {
        if (selectedIds.size === 0) {
            alert("Please select at least one category")
            return
        }

        startTransition(async () => {
            const updates: Record<string, { isActive?: boolean; showInMenu?: boolean }> = {}

            selectedIds.forEach((id) => {
                if (action === "activate") {
                    updates[id] = { isActive: true }
                } else if (action === "deactivate") {
                    updates[id] = { isActive: false }
                } else if (action === "show-in-menu") {
                    updates[id] = { showInMenu: true }
                } else if (action === "hide-from-menu") {
                    updates[id] = { showInMenu: false }
                }
            })

            const result = await bulkUpdateCategories(updates)

            if (result.error) {
                alert(result.error)
            } else {
                setOpen(false)
                setSelectedIds(new Set())
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Bulk Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Edit Categories</DialogTitle>
                    <DialogDescription>
                        Select categories and choose an action to apply to all of them.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <Select value={action} onValueChange={(v) => setAction(v as "activate" | "deactivate" | "show-in-menu" | "hide-from-menu")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="activate">Activate Selected</SelectItem>
                                <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                                <SelectItem value="show-in-menu">Show in Menu</SelectItem>
                                <SelectItem value="hide-from-menu">Hide from Menu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Checkbox
                                id="select-all"
                                checked={selectedIds.size === categories.length && categories.length > 0}
                                onCheckedChange={toggleAll}
                            />
                            <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                                Select All ({selectedIds.size} of {categories.length})
                            </Label>
                        </div>

                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={category.id}
                                    checked={selectedIds.has(category.id)}
                                    onCheckedChange={() => toggleCategory(category.id)}
                                />
                                <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <span>{category.name}</span>
                                        <div className="flex gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {category.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.showInMenu !== false
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {category.showInMenu !== false ? "In Menu" : "Hidden"}
                                            </span>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate} disabled={isPending || selectedIds.size === 0}>
                        {isPending ? "Updating..." : `Update ${selectedIds.size} Categories`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
