"use client";

interface BookServiceButtonProps {
  mobile?: boolean;
}

export function BookServiceButton({ mobile }: BookServiceButtonProps) {
  const handleClick = () => {
    const servicesSection = document.getElementById("services-section");
    servicesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (mobile) {
    return (
      <button
        data-testid="book-appointment-btn-mobile"
        onClick={handleClick}
        className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold active:scale-95 transition-all"
      >
        Select Service
      </button>
    );
  }

  return (
    <button
      data-testid="book-appointment-btn-desktop"
      onClick={handleClick}
      className="bg-primary text-on-primary px-10 py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:brightness-110 active:scale-95 transition-all"
    >
      Select Service
    </button>
  );
}
