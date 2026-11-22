
"use client"

import { useEffect, useMemo, useState } from "react"
import {
    Users,
    UserPlus,
    Search,
    ShieldCheck,
    UserCheck,
    UserX,
    Pencil,
    Power,
    Mail,
    X,
    Trash2,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

type UserRole = "SUB_ADMIN" | "BDE" | "TRAINER"

interface User {
    id: string
    name: string
    email: string
    role: UserRole
    status: "ACTIVE" | "INACTIVE"
}

const roleLabels: Record<UserRole, string> = {
    SUB_ADMIN: "Sub Admin",
    BDE: "Business Development Executive",
    TRAINER: "Trainer",
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [processingUserId, setProcessingUserId] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "SUB_ADMIN" as UserRole,
    })

    // Fetch users from PostgreSQL
    async function fetchUsers() {
        try {
            setIsLoading(true)
            setLoadError("")

            const response = await fetch("/api/admin/users", {
                method: "GET",
                cache: "no-store",
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch users.")
            }

            setUsers(data.users)
        } catch (error) {
            console.error("Fetch users error:", error)

            setLoadError(
                error instanceof Error
                    ? error.message
                    : "Unable to load users."
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Search and filters
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())

            const matchesRole =
                roleFilter === "ALL" || user.role === roleFilter

            const matchesStatus =
                statusFilter === "ALL" || user.status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, search, roleFilter, statusFilter])

    // Statistics
    const activeUsers = users.filter(
        (user) => user.status === "ACTIVE"
    ).length

    const inactiveUsers = users.filter(
        (user) => user.status === "INACTIVE"
    ).length

    // Open Create Modal
    function openCreateModal() {
        setEditingUser(null)

        setForm({
            name: "",
            email: "",
            password: "",
            role: "SUB_ADMIN",
        })

        setShowModal(true)
    }

    // Open Edit Modal
    function openEditModal(user: User) {
        setEditingUser(user)

        setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        })

        setShowModal(true)
    }

    // Create / Update User
    async function handleSaveUser() {
        const name = form.name.trim()
        const email = form.email.trim().toLowerCase()

        if (!name || !email) {
            alert("Please enter name and email.")
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.")
            return
        }

        if (isSaving) return

        if (!editingUser) {
            if (form.password.length < 12 || form.password.length > 72) {
                alert("Password must be between 12 and 72 characters.")
                return
            }
        }

        try {
            setIsSaving(true)

            const isEditing = Boolean(editingUser)

            const response = await fetch(
                isEditing
                    ? `/api/admin/users/${editingUser!.id}`
                    : "/api/admin/users",
                {
                    method: isEditing ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        role: form.role,
                        ...(isEditing ? {} : { password: form.password }),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save user.")
            }

            alert(
                isEditing
                    ? "User updated successfully!"
                    : "User created successfully!"
            )

            setShowModal(false)
            setEditingUser(null)

            setForm({
                name: "",
                email: "",
                password: "",
                role: "SUB_ADMIN",
            })

            await fetchUsers()
        } catch (error) {
            console.error("Save user error:", error)

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to save user."
            )
        } finally {
            setIsSaving(false)
        }
    }

    // Database Activate / Deactivate
    async function toggleStatus(user: User) {
        if (processingUserId) return

        const newStatus =
            user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

        const confirmed = window.confirm(
            `Are you sure you want to ${newStatus.toLowerCase()} ${user.name}?`
        )

        if (!confirmed) return

        try {
            setProcessingUserId(user.id)

            const response = await fetch(
                `/api/admin/users/${user.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update user status."
                )
            }

            await fetchUsers()

            alert(data.message || "User status updated successfully.")
        } catch (error) {
            console.error("Status update error:", error)

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to update user status."
            )
        } finally {
            setProcessingUserId(null)
        }
    }

    // Delete is not connected to API yet

    async function handleDeleteUser(user: User) {
        if (processingUserId) return

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${user.name}?\n\nThis action cannot be undone.`
        )

        if (!confirmed) return

        try {
            setProcessingUserId(user.id)

            const response = await fetch(
                `/api/admin/users/${user.id}`,
                {
                    method: "DELETE",
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to delete user."
                )
            }

            await fetchUsers()

            alert(data.message || "User deleted successfully.")

        } catch (error) {
            console.error("Delete user error:", error)

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to delete user."
            )
        } finally {
            setProcessingUserId(null)
        }
    }


    return (
        <DashboardShell role="ADMIN">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage portal users, roles and account access.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        <UserPlus className="mr-2 size-4" />
                        Create User
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={users.length}
                        icon={<Users className="size-5" />}
                    />

                    <StatCard
                        title="Active Users"
                        value={activeUsers}
                        icon={<UserCheck className="size-5" />}
                    />

                    <StatCard
                        title="Inactive Users"
                        value={inactiveUsers}
                        icon={<UserX className="size-5" />}
                    />

                    <StatCard
                        title="User Roles"
                        value={3}
                        icon={<ShieldCheck className="size-5" />}
                    />
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                All Users
                            </h2>

                            <p className="text-xs text-slate-500">
                                {filteredUsers.length} users found
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 sm:w-56"
                                />
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="SUB_ADMIN">Sub Admin</option>
                                <option value="BDE">BDE</option>
                                <option value="TRAINER">Trainer</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {/* Loading */}
                                {isLoading && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                )}

                                {/* Error */}
                                {!isLoading && loadError && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-red-500">
                                            {loadError}

                                            <button
                                                onClick={fetchUsers}
                                                className="ml-2 font-semibold underline"
                                            >
                                                Retry
                                            </button>
                                        </td>
                                    </tr>
                                )}

                                {/* Users */}
                                {!isLoading && !loadError &&
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-50/70"
                                        >
                                            {/* User Details */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                            {user.name
                                                                .split(" ")
                                                                .map((part) => part[0])
                                                                .slice(0, 2)
                                                                .join("")
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700">
                                                    {roleLabels[user.role]}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "ACTIVE"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1">

                                                    {/* Edit */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(user)}
                                                        title="Edit user"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>

                                                    {/* Activate / Deactivate */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleStatus(user)}
                                                        disabled={processingUserId === user.id}
                                                        title={
                                                            user.status === "ACTIVE"
                                                                ? "Deactivate user"
                                                                : "Activate user"
                                                        }
                                                    >
                                                        <Power
                                                            className={`size-4 ${user.status === "ACTIVE"
                                                                ? "text-red-500"
                                                                : "text-emerald-600"
                                                                }`}
                                                        />
                                                    </Button>

                                                    {/* Delete */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={processingUserId === user.id}
                                                        title="Delete user"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }

                                {/* Empty State */}
                                {!isLoading &&
                                    !loadError &&
                                    filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b p-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingUser ? "Edit User" : "Create New User"}
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Enter user details below.
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSaving}
                                >
                                    <X className="size-5" />
                                </Button>
                            </div>

                            {/* Modal Form */}
                            <div className="space-y-4 p-5">

                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">
                                        Full Name
                                    </label>

                                    <Input
                                        placeholder="Enter full name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">
                                        Email Address
                                    </label>

                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Initial Password */}
                                {!editingUser && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">
                                            Initial Password
                                        </label>

                                        <Input
                                            type="password"
                                            placeholder="Enter initial password"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    password: e.target.value,
                                                })
                                            }
                                        />

                                        <p className="text-xs text-slate-500">
                                            Minimum 12 characters required.
                                        </p>
                                    </div>
                                )}

                                {/* Role */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">
                                        User Role
                                    </label>

                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                role: e.target.value as UserRole,
                                            })
                                        }
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="SUB_ADMIN">Sub Admin</option>
                                        <option value="BDE">BDE</option>
                                        <option value="TRAINER">Trainer</option>
                                    </select>
                                </div>

                                {!editingUser && (
                                    <p className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                                        <Mail className="size-4 shrink-0" />
                                        The initial password will be securely hashed before saving the account.
                                    </p>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-2 border-t p-5">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleSaveUser}
                                    disabled={isSaving}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : editingUser
                                            ? "Save Changes"
                                            : "Create User"}
                                </Button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </DashboardShell>
    )
}

// Statistics Card
function StatCard({
    title,
    value,
    icon,
}: {
    title: string
    value: number
    icon: React.ReactNode
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    )
}
