'use client'

type ViewMode = 'list' | 'map' | 'split';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  isMobile: boolean;
}

export function ViewModeToggle({ viewMode, onViewChange, isMobile }: ViewModeToggleProps) {
  const buttonClass = (mode: ViewMode) => `
    px-6 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium
    transition-all
    ${viewMode === mode
      ? 'bg-primary text-background'
      : 'border border-white/10 text-on-surface hover:border-primary/30'
    }
  `;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-0">
        <button
          onClick={() => onViewChange('list')}
          className={buttonClass('list')}
          data-testid="marketplace-view-list-btn"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            LIST
          </span>
        </button>

        <button
          onClick={() => onViewChange('map')}
          className={buttonClass('map')}
          data-testid="marketplace-view-map-btn"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">map</span>
            MAP
          </span>
        </button>

        {!isMobile && (
          <button
            onClick={() => onViewChange('split')}
            className={buttonClass('split')}
            data-testid="marketplace-view-split-btn"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">view_sidebar</span>
              SPLIT
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
