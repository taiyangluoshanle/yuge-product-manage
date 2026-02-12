import { PackageOpen } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="mb-4 h-16 w-16 text-gray-300" />
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-gray-500">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
