'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';
import { deleteBusiness } from './businesses/actions';
import { useConfirm } from '@/lib/contexts/ConfirmContext';

interface BusinessRowActionsProps {
  business: {
    id: string;
    name: string;
    subdomain: string | null;
    status: string;
  };
}

export function BusinessRowActions({ business }: BusinessRowActionsProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!(await confirm({
      title: `Delete ${business.name}?`,
      message: "This will permanently delete the business owner's account, all staff, services, bookings, and reviews. This action cannot be undone.",
      confirmLabel: 'Delete',
      destructive: true,
      testId: 'delete-business',
    }))) {
      return;
    }

    setDeleting(true);
    const result = await deleteBusiness(business.id);

    if (result.error) {
      alert(`Failed to delete business: ${result.error}`);
      setDeleting(false);
    } else {
      router.refresh();
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
        className="text-[#555555] hover:text-[#ef4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete business"
        aria-label={`Delete ${business.name}`}
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
