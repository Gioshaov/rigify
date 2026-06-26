"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArtisanAction } from "@/app/dashboard/staff/invite/actions";
import { CancelButton } from "@/components/ui/CancelButton";
import { useToast } from "@/lib/contexts/ToastContext";

const DAYS = [
  { short: "Mo", full: "Monday" },
  { short: "Tu", full: "Tuesday" },
  { short: "We", full: "Wednesday" },
  { short: "Th", full: "Thursday" },
  { short: "Fr", full: "Friday" },
  { short: "Sa", full: "Saturday" },
  { short: "Su", full: "Sunday" },
];

const TIME_SLOTS = [
  "12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM", "05:00 AM",
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM",
];

type AddArtisanFormProps = {
  onClose?: () => void;
};

export function AddArtisanForm({ onClose }: AddArtisanFormProps = {}) {
  const router = useRouter();
  const showToast = useToast();

  // Form state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"standard" | "manager">("standard");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [workDays, setWorkDays] = useState([true, true, true, true, true, false, false]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleWorkDay = (index: number) => {
    const newWorkDays = [...workDays];
    newWorkDays[index] = !newWorkDays[index];
    setWorkDays(newWorkDays);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!fullName.trim()) {
      showToast("Please enter the artisan's full name", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Please enter an email address", "error");
      return;
    }
    if (!password || password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call server action to create artisan
      const result = await createArtisanAction({
        fullName,
        title,
        bio,
        email,
        password,
        role,
      });

      if (!result.success) {
        showToast(result.error || "Failed to create artisan", "error");
        setIsSubmitting(false);
        return;
      }

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      console.error("Error creating artisan:", error);
      showToast("An error occurred while creating the artisan", "error");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-20">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-primary/10 border-2 border-primary mx-auto mb-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-primary">
              check_circle
            </span>
          </div>

          {/* Success Message */}
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-white mb-4">
            Artisan Added Successfully
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] font-normal text-on-surface-variant mb-12 max-w-lg mx-auto">
            {fullName} has been added to your team. They can now log in with their credentials and manage their schedule.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              type="button"
              data-testid="view-team-btn"
              onClick={() => {
                if (onClose) {
                  onClose();
                  router.refresh();
                } else {
                  router.push("/dashboard/staff");
                }
              }}
              className="flex-1 bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold py-4 hover:bg-primary-fixed transition-colors"
            >
              View Team
            </button>
            <button
              type="button"
              data-testid="add-another-btn"
              onClick={() => {
                setShowSuccess(false);
                setFullName("");
                setTitle("");
                setBio("");
                setEmail("");
                setPassword("");
                setPhoto(null);
                setPhotoPreview(null);
                setRole("standard");
                setStartTime("09:00 AM");
                setEndTime("06:00 PM");
                setWorkDays([true, true, true, true, true, false, false]);
              }}
              className="flex-1 bg-surface-container border border-white/10 text-on-surface font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium py-4 hover:border-primary/30 transition-colors"
            >
              Add Another Artisan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 font-mono text-[10px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase">
          ADMIN PORTAL
        </span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-white mb-2">
          Add New Artisan
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant">
          Expand your team with elite talent.
        </p>
      </div>

      {/* Section 01 - Personal Profile */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-6 bg-primary"></div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant/50">
              01
            </span>
            <h2 className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase">
              Personal Profile
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <input
              type="file"
              id="photo-upload"
              data-testid="photo-upload-input"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              data-testid="photo-upload-box"
              className="w-[120px] h-[120px] border-2 border-dashed border-white/20 bg-surface-container flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- photoPreview is a base64 data URL from FileReader; next/image can't optimize data URLs
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                    photo_camera
                  </span>
                  <span className="font-mono text-[9px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant/50 uppercase">
                    Upload Photo
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Name & Title */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="full-name"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
              >
                Full Name
              </label>
              <input
                id="full-name"
                data-testid="full-name-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexander Voss"
                className="w-full bg-surface-container border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="professional-title"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
              >
                Professional Title
              </label>
              <input
                id="professional-title"
                data-testid="professional-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Barber & Style Director"
                className="w-full bg-surface-container border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label
            htmlFor="artisan-bio"
            className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
          >
            Artisan Bio
          </label>
          <textarea
            id="artisan-bio"
            data-testid="artisan-bio-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe the artisan's expertise, philosophy, and years of experience..."
            rows={4}
            className="w-full bg-surface-container border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/60 transition-colors resize-none"
          />
        </div>

        {/* Account Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
            >
              Email Address <span className="text-error">*</span>
            </label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@studio.com"
              className="w-full bg-surface-container border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/60 transition-colors"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
            >
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                data-testid="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-surface-container border border-white/10 px-4 py-3 pr-12 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/60 transition-colors"
                required
              />
              <button
                type="button"
                data-testid="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 - Role & Permissions */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-6 bg-primary"></div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant/50">
              02
            </span>
            <h2 className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase">
              Role & Permissions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Standard Artisan */}
          <button
            data-testid="role-standard-btn"
            onClick={() => setRole("standard")}
            className={`
              p-6 border text-left transition-all relative
              ${
                role === "standard"
                  ? "border-primary bg-primary/5"
                  : "border-white/10 bg-surface-container hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="material-symbols-outlined text-[28px] text-primary">
                content_cut
              </span>
              <div
                className={`
                  w-5 h-5 border-2 flex items-center justify-center
                  ${role === "standard" ? "border-primary bg-primary" : "border-white/20"}
                `}
              >
                {role === "standard" && (
                  <span className="material-symbols-outlined text-[14px] text-background">
                    check
                  </span>
                )}
              </div>
            </div>
            <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white mb-2">
              Standard Artisan
            </h3>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
              Can manage own schedule, services, and client gallery.
            </p>
          </button>

          {/* Lead / Manager */}
          <button
            data-testid="role-manager-btn"
            onClick={() => setRole("manager")}
            className={`
              p-6 border text-left transition-all relative
              ${
                role === "manager"
                  ? "border-primary bg-primary/5"
                  : "border-white/10 bg-surface-container hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="material-symbols-outlined text-[28px] text-primary">
                key
              </span>
              <div
                className={`
                  w-5 h-5 border-2 flex items-center justify-center
                  ${role === "manager" ? "border-primary bg-primary" : "border-white/20"}
                `}
              >
                {role === "manager" && (
                  <span className="material-symbols-outlined text-[14px] text-background">
                    check
                  </span>
                )}
              </div>
            </div>
            <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white mb-2">
              Lead / Manager
            </h3>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
              Full access to shop settings, analytics, and team management.
            </p>
          </button>
        </div>
      </section>

      {/* Section 03 - Primary Shift */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-6 bg-primary"></div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant/50">
              03
            </span>
            <h2 className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase">
              Primary Shift
            </h2>
          </div>
        </div>

        <div className="border border-white/10 bg-surface-container p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Time */}
            <div>
              <label
                htmlFor="start-time"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
              >
                Start Time
              </label>
              <select
                id="start-time"
                data-testid="start-time-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer focus:border-primary/60 transition-colors"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="end-time"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2"
              >
                End Time
              </label>
              <select
                id="end-time"
                data-testid="end-time-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer focus:border-primary/60 transition-colors"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Days */}
            <div>
              <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                Work Days
              </label>
              <div className="flex gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={`${day.full}-${index}`}
                    data-testid={`work-day-${day.full.toLowerCase()}`}
                    onClick={() => toggleWorkDay(index)}
                    className={`
                      w-10 h-10 border font-mono text-[11px] font-medium transition-all
                      ${
                        workDays[index]
                          ? "bg-primary border-primary text-background"
                          : "bg-surface-container-low border-white/10 text-on-surface-variant hover:border-primary/30"
                      }
                    `}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          data-testid="create-profile-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold py-4 hover:bg-primary-fixed transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin rounded-full"></div>
              Creating...
            </>
          ) : (
            "Create Profile"
          )}
        </button>
        <button
          type="button"
          data-testid="cancel-btn"
          onClick={handleCancel}
          className="flex-1 bg-surface-container border border-white/10 text-on-surface font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium py-4 hover:border-primary/30 transition-colors active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
