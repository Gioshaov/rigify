'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createBooking, searchCustomers } from '../actions';
import { formatTbilisi } from '@/lib/utils/datetime';
import { Calendar, Clock, User, FileText, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

type Business = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
};

type Staff = {
  id: string;
  name: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

interface CreateBookingWizardProps {
  businesses: Business[];
}

export function CreateBookingWizard({ businesses }: CreateBookingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [businessId, setBusinessId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isGuestBooking, setIsGuestBooking] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Dynamic data
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch services and staff when business changes
  useEffect(() => {
    if (!businessId) return;

    const supabase = createClient();
    Promise.all([
      supabase.from('services').select('id, name, duration_minutes, price').eq('business_id', businessId).order('name'),
      supabase.from('staff').select('id, name').eq('business_id', businessId).eq('is_active', true).order('name')
    ]).then(([servicesRes, staffRes]) => {
      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
    });
  }, [businessId]);

  // Fetch customers for autocomplete (debounced server action)
  useEffect(() => {
    if (isGuestBooking || searchQuery.length < 2) {
      setCustomers([]);
      return;
    }

    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Debounce search
    searchTimerRef.current = setTimeout(async () => {
      const result = await searchCustomers(searchQuery);
      if (result.success) {
        setCustomers(result.customers);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, isGuestBooking]);

  // Auto-fill duration when service changes
  useEffect(() => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setDurationMinutes(selectedService.duration_minutes);
    }
  }, [serviceId, services]);

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email);
    setSearchQuery('');
    setCustomers([]);
  };

  const handleSubmit = () => {
    setMessage(null);

    const formData = new FormData();
    formData.append('business_id', businessId);
    formData.append('service_id', serviceId);
    formData.append('staff_id', staffId);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('duration_minutes', durationMinutes.toString());
    formData.append('notes', notes);

    if (isGuestBooking) {
      formData.append('customer_name', customerName);
      formData.append('customer_phone', customerPhone);
      if (customerEmail) formData.append('customer_email', customerEmail);
    } else {
      formData.append('customer_id', customerId);
      formData.append('customer_name', customerName);
      formData.append('customer_phone', customerPhone);
      if (customerEmail) formData.append('customer_email', customerEmail);
    }

    startTransition(async () => {
      const result = await createBooking(formData);

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          if (result.bookingId) {
            router.push(`/admin/bookings/${result.bookingId}`);
          } else {
            router.push('/admin/bookings');
          }
        }, 1000);
      }
    });
  };

  const canProceedStep1 = businessId !== '';
  const canProceedStep2 = serviceId !== '' && staffId !== '';
  const canProceedStep3 = date !== '' && time !== '';
  const canProceedStep4 = customerName !== '' && customerPhone !== '';

  const selectedBusiness = businesses.find(b => b.id === businessId);
  const selectedService = services.find(s => s.id === serviceId);
  const selectedStaff = staff.find(s => s.id === staffId);

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-nav">
          <h1 className="text-xl font-bold text-white">Create New Booking</h1>
          <Link
            href="/admin/bookings"
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
            data-testid="create-booking-back-btn"
          >
            ← Cancel
          </Link>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mx-8 mt-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e]'
                : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
            }`}
            data-testid="create-booking-message"
          >
            {message.text}
          </div>
        )}

        {/* Wizard Steps Indicator */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step === currentStep
                      ? 'bg-[#d4a843] text-black'
                      : step < currentStep
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-0.5 ${step < currentStep ? 'bg-[#22c55e]' : 'bg-[#2a2a2a]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-8 pb-8">
          {/* Step 1: Select Business */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-white text-lg font-bold">Step 1: Select Business</h2>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                data-testid="create-booking-business-select"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843]"
              >
                <option value="">Choose a business...</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Select Service & Staff */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-white text-lg font-bold">Step 2: Select Service & Staff</h2>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2">Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  data-testid="create-booking-service-select"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes}min{service.price ? `, ₾${service.price}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2">Staff Member</label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  data-testid="create-booking-staff-select"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                >
                  <option value="">Choose a staff member...</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  min="15"
                  max="480"
                  step="15"
                  data-testid="create-booking-duration-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                />
                <p className="text-[#888888] text-xs mt-1">Auto-filled from service, can be adjusted</p>
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-white text-lg font-bold">Step 3: Select Date & Time</h2>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date (Tbilisi local)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="create-booking-date-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time (Tbilisi local)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="create-booking-time-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Customer Info */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-white text-lg font-bold">Step 4: Customer Information</h2>

              {/* Toggle Guest vs Existing Customer */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsGuestBooking(false);
                    setCustomerId('');
                    setCustomerName('');
                    setCustomerPhone('');
                    setCustomerEmail('');
                  }}
                  className={`flex-1 px-4 py-2 text-sm rounded ${
                    !isGuestBooking
                      ? 'bg-[#d4a843] text-black font-bold'
                      : 'bg-[#2a2a2a] text-[#888888] hover:text-white'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  onClick={() => {
                    setIsGuestBooking(true);
                    setCustomerId('');
                    setCustomerName('');
                    setCustomerPhone('');
                    setCustomerEmail('');
                  }}
                  className={`flex-1 px-4 py-2 text-sm rounded ${
                    isGuestBooking
                      ? 'bg-[#d4a843] text-black font-bold'
                      : 'bg-[#2a2a2a] text-[#888888] hover:text-white'
                  }`}
                >
                  Guest Booking
                </button>
              </div>

              {!isGuestBooking && (
                <div className="relative">
                  <label className="block text-[#cccccc] text-sm mb-2">Search Customer</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, or email..."
                    data-testid="create-booking-customer-search"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  />
                  {customers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded max-h-48 overflow-y-auto z-dropdown">
                      {customers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full px-4 py-2 text-left hover:bg-[#2a2a2a] transition-colors text-white text-sm"
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-[#888888] text-xs">{customer.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(isGuestBooking || customerId) && (
                <>
                  <div>
                    <label className="block text-[#cccccc] text-sm mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      data-testid="create-booking-guest-name-input"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                      disabled={!isGuestBooking && customerId !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-[#cccccc] text-sm mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+995XXXXXXXXX"
                      data-testid="create-booking-guest-phone-input"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                      disabled={!isGuestBooking && customerId !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-[#cccccc] text-sm mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      data-testid="create-booking-guest-email-input"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                      disabled={!isGuestBooking && customerId !== ''}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Notes & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-white text-lg font-bold">Step 5: Notes & Confirmation</h2>

              <div>
                <label className="block text-[#cccccc] text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this booking..."
                  rows={4}
                  data-testid="create-booking-notes-textarea"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a843] resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded p-6 space-y-3">
                <h3 className="text-white font-bold mb-4">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#888888]">Business:</span>
                    <p className="text-white">{selectedBusiness?.name}</p>
                  </div>
                  <div>
                    <span className="text-[#888888]">Service:</span>
                    <p className="text-white">{selectedService?.name}</p>
                  </div>
                  <div>
                    <span className="text-[#888888]">Staff:</span>
                    <p className="text-white">{selectedStaff?.name}</p>
                  </div>
                  <div>
                    <span className="text-[#888888]">Duration:</span>
                    <p className="text-white">{durationMinutes} minutes</p>
                  </div>
                  <div>
                    <span className="text-[#888888]">Date & Time:</span>
                    <p className="text-white font-mono">
                      {date} {time}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#888888]">Customer:</span>
                    <p className="text-white">
                      {customerName}
                      {isGuestBooking && <span className="text-[10px] text-[#888888] ml-2">(GUEST)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2a2a2a]">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isPending}
              data-testid="create-booking-prev-btn"
              className="flex items-center gap-2 px-4 py-2 text-[#888888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                disabled={
                  isPending ||
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3) ||
                  (currentStep === 4 && !canProceedStep4)
                }
                data-testid="create-booking-next-btn"
                className="flex items-center gap-2 bg-[#d4a843] text-black font-bold px-6 py-2 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                data-testid="create-booking-confirm-btn"
                className="flex items-center gap-2 bg-[#22c55e] text-white font-bold px-6 py-2 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creating...' : 'Create Booking'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
