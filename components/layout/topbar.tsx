
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
    Bell,
    ChevronDown,
    Menu,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

interface User {
    id: string
    name: string
    email: string
    role: string
}

const roleLabels: Record<string, string> = {
    ADMIN: "Administrator",
    SUB_ADMIN: "Sub Administrator",
    CLIENT: "Client",
    BDE: "Business Development Executive",
    TRAINER: "Trainer",
}

export function Topbar() {
    const router = useRouter()

    const [loggingOut, setLoggingOut] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    // Fetch logged-in user details
    useEffect(() => {
        let isMounted = true

        async function fetchUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    cache: "no-store",
                })

                if (!response.ok) {
                    if (response.status === 401 && isMounted) {
                        router.replace("/login")
                    }
                    return
                }

                const data = await response.json()

                if (isMounted && data.success && data.user) {
                    setUser(data.user)
                }
            } catch (error) {
                console.error("User fetch error:", error)
            }
        }

        fetchUser()

        return () => {
            isMounted = false
        }
    }, [router])

    // Logout
    async function handleLogout() {
        if (loggingOut) return

        setLoggingOut(true)

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Logout failed")
            }

            router.replace("/login")
            router.refresh()
        } catch (error) {
            console.error("Logout error:", error)
            setLoggingOut(false)
            alert("Unable to logout. Please try again.")
        }
    }

    // Generate avatar initials
    const initials = user?.name
        ? user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()
        : "U"

    const displayRole = user?.role
        ? roleLabels[user.role] || user.role
        : "Loading..."

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-indigo-100/70 bg-white/90 px-4 backdrop-blur-xl md:px-6">

            {/* Mobile menu */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
            >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
            </Button>

            {/* Portal label */}
            <div className="hidden md:block">
                <p className="text-sm text-muted-foreground">
                    Corporate Learning Portal
                </p>
            </div>

            <div className="ml-auto flex items-center gap-2">

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
                >
                    <Bell className="size-5" />

                    <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />

                    <span className="sr-only">
                        Notifications
                    </span>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 px-2"
                            />
                        }
                    >
                        <Avatar className="size-9 ring-2 ring-indigo-100">
                            <AvatarFallback>
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium">
                                {user?.name || "Loading..."}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {displayRole}
                            </p>
                        </div>

                        <ChevronDown className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">

                        {/* User information */}
                        <div className="px-3 py-2">
                            <p className="text-sm font-medium">
                                {user?.name || "Loading..."}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                                {user?.email || ""}
                            </p>
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <LogOut className="mr-2 size-4" />
                            {loggingOut ? "Logging out..." : "Logout"}
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    )
}
