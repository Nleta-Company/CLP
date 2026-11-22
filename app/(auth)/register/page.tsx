
"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  MapPin,
  User,
} from "lucide-react";

type FormValues = {
  name: string;
  email: string;
  password: string;
  organisation: string;
  gstin: string;
  address: string;
  country: string;
  state: string;
  city: string;
  contactName: string;
  designation: string;
  phone: string;
};

const initialForm: FormValues = {
  name: "",
  email: "",
  password: "",
  organisation: "",
  gstin: "",
  address: "",
  country: "India",
  state: "",
  city: "",
  contactName: "",
  designation: "",
  phone: "",
};

type FieldProps = {
  label: string;
  name: keyof FormValues;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Field({
  label,
  name,
  value,
  placeholder,
  required = false,
  type = "text",
  onChange,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        autoComplete={name === "email" ? "email" : "off"}
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormValues>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message || "Registration failed. Please try again."
        );
        return;
      }

      router.replace("/client/services");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-[500px] rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-blue-800 px-6 py-8 text-white sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/15">
              <GraduationCap className="size-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">CLP Portal</h1>
              <p className="text-sm text-indigo-100">
                Corporate Learning & Training Portal
              </p>
            </div>
          </div>

          <h2 className="mt-7 text-2xl font-bold sm:text-3xl">
            Create Your Client Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-indigo-100">
            Register your organisation to access training programmes and
            manage your service requests.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-6 sm:p-10"
        >
          {/* Account Information */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <User className="size-5 text-indigo-600" />

              <h3 className="text-lg font-bold text-slate-900">
                Account Information
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <Field
                label="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                type="email"
                required
              />

              {/* Password */}
              <div className="sm:col-span-2">
                <label htmlFor="password" className={labelClass}>
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password (minimum 12 characters)"
                    minLength={12}
                    maxLength={72}
                    required
                    autoComplete="new-password"
                    className={`${inputClass} pl-12 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Use at least 12 characters.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Organisation Details */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600" />

              <h3 className="text-lg font-bold text-slate-900">
                Organisation Details
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Organisation Name"
                name="organisation"
                value={form.organisation}
                onChange={handleChange}
                placeholder="Enter organisation name"
                required
              />

              <Field
                label="GSTIN"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                placeholder="Enter GSTIN (optional)"
              />

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Complete Address <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete organisation address"
                  required
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <Field
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
                required
              />

              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />

              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Contact Information */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="size-5 text-indigo-600" />

              <h3 className="text-lg font-bold text-slate-900">
                Contact Information
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Contact Person"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                required
              />

              <Field
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />

              <Field
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter contact number"
                type="tel"
                required
              />
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Client Account
                <ArrowRight className="size-5" />
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-violet-700"
            >
              Sign In
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400">
            © 2026 NLETA. All rights reserved.
          </p>
        </form>
      </div>
    </main>
  );
}
