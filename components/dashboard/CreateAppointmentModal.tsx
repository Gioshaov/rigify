"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/app/dashboard/appointments/actions";
import { useToast } from "@/lib/contexts/ToastContext";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_min: number;
}

interface Staff {
  id: string;
  name: string;
}

interface CreateAppointmentModalProps {
  businessId: string;
  services: Service[];
  staff: Staff[];
  onClose: () => void;
}

// Generate time slots from 9 AM to 9 PM in 15-minute intervals
function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour < 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayString = `${displayHour}:${min
        .toString()
        .padStart(2, "0")} ${ampm}`;
      slots.push({ value: timeString, label: displayString });
    }
  }
  return slots;
}

export function CreateAppointmentModal({
  businessId,
  services,
  staff,
  onClose,
}: CreateAppointmentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  const timeSlots = generateTimeSlots();

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!serviceId) {
      setError("Please select a service");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (!time) {
      setError("Please select a time");
      return;
    }

    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!customerPhone.trim()) {
      setError("Customer phone is required");
      return;
    }

    startTransition(async () => {
      const result = await createAppointment({
        businessId,
        serviceId,
        staffId: staffId || null,
        date,
        startTime: time,
        customerName,
        customerPhone,
        customerEmail,
        notes,
      });

      if (result.success) {
        showToast(result.message, "success");
        // Close modal and refresh after short delay
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1500);
      } else {
        setError(result.message);
      }
    });
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div
          className="bg-surface-container border border-primary/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          data-testid="create-appointment-modal"
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface-container border-b border-white/10 p-6 flex items-center justify-between">
            <div>
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary">
                Create Appointment
              </h2>
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase text-on-surface-variant mt-1">
                Manually book an appointment
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors"
              data-testid="close-modal-btn"
            >
              <span className="material-symbols-outlined text-[24px]">
                close
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Banner */}
            {error && (
              <div
                className="p-4 border border-error/20 bg-error/10"
                data-testid="form-error"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">
                    error
                  </span>
                  <p className="font-hanken text-[14px] leading-[1.5] text-error">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label
                htmlFor="service"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
              >
                Service <span className="text-error">*</span>
              </label>
              <select
                id="service"
                data-testid="service-select"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors"
                required
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration_minutes}min - ₾
                    {(service.price_min ?? 0).toFixed(0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Selection */}
            <div>
              <label
                htmlFor="staff"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
              >
                Staff Member
              </label>
              <select
                id="staff"
                data-testid="staff-select"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="">Any Available Staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                >
                  Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  data-testid="date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                >
                  Time <span className="text-error">*</span>
                </label>
                <select
                  id="time"
                  data-testid="time-select"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors"
                  required
                >
                  <option value="">Select time...</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase">
                Customer Information
              </p>

              <div>
                <label
                  htmlFor="customerName"
                  className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                >
                  Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  data-testid="customer-name-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  maxLength={100}
                  className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customerPhone"
                    className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                  >
                    Phone <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    data-testid="customer-phone-input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="5XX XXX XXX"
                    className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerEmail"
                    className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    data-testid="customer-email-input"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  data-testid="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about the appointment"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Summary */}
            {selectedService && (
              <div className="bg-primary/10 border border-primary/20 p-4">
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-2">
                  Appointment Summary
                </p>
                <div className="space-y-1">
                  <p className="font-hanken text-[14px] leading-[1.5] text-on-surface">
                    <span className="text-on-surface-variant">Service:</span>{" "}
                    {selectedService.name}
                  </p>
                  <p className="font-hanken text-[14px] leading-[1.5] text-on-surface">
                    <span className="text-on-surface-variant">Duration:</span>{" "}
                    {selectedService.duration_minutes} minutes
                  </p>
                  <p className="font-hanken text-[14px] leading-[1.5] text-on-surface">
                    <span className="text-on-surface-variant">Price:</span> ₾
                    {(selectedService.price_min ?? 0).toFixed(0)}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-primary text-background hover:bg-primary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2"
                data-testid="create-appointment-btn"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">
                      add
                    </span>
                    Create Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
