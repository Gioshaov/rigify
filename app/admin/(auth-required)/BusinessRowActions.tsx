'use client';

import Link from 'next/link';
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';

interface BusinessRowActionsProps {
  business: {
    id: string;
    name: string;
    subdomain: string | null;
    status: string;
  };
}

export function BusinessRowActions({ business }: BusinessRowActionsProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${business.name}?`)) {
      // TODO: Implement delete functionality
      alert('Delete functionality coming soon');
    }
  };

  return (
    <div className="w-[100px] flex items-center justify-end gap-4">
      <Link
        href={`/admin/businesses/${business.id}/edit`}
        data-testid={`admin-business-edit-${business.id}`}
        className="text-[#555555] hover:text-[#d4a843] transition-colors"
        title="Edit business"
        aria-label={`Edit ${business.name}`}
      >
        <Pencil className="w-4 h-4" />
      </Link>
      {business.subdomain ? (
        <Link
          href={`/businesses/${business.subdomain}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`admin-business-view-${business.id}`}
          className="text-[#555555] hover:text-white transition-colors"
          title="View business page"
          aria-label={`View ${business.name} page`}
        >
          {business.status === 'active' ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Link>
      ) : (
        <span className="text-[#333333] cursor-not-allowed" title="No subdomain set">
          <EyeOff className="w-4 h-4" />
        </span>
      )}
      <button
        data-testid={`admin-business-delete-${business.id}`}
        className="text-[#555555] hover:text-[#ef4444] transition-colors"
        title="Delete business"
        aria-label={`Delete ${business.name}`}
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
