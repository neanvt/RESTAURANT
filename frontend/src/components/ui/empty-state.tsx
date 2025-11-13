import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4 max-w-sm">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  variant?: "default" | "bordered" | "elevated";
}

export function EmptyStateCard({
  variant = "default",
  ...props
}: EmptyStateCardProps) {
  const variantClasses = {
    default: "bg-gray-50",
    bordered: "border-2 border-dashed border-gray-300 bg-white",
    elevated: "bg-white shadow-sm border",
  };

  return (
    <div className={cn("rounded-lg", variantClasses[variant])}>
      <EmptyState {...props} />
    </div>
  );
}

interface EmptySearchProps {
  searchTerm: string;
  onClear: () => void;
}

export function EmptySearch({ searchTerm, onClear }: EmptySearchProps) {
  return (
    <EmptyState
      title="No results found"
      description={`No results match "${searchTerm}". Try adjusting your search.`}
      action={{
        label: "Clear Search",
        onClick: onClear,
      }}
    />
  );
}

interface EmptyListProps {
  entityName: string;
  onCreate?: () => void;
}

export function EmptyList({ entityName, onCreate }: EmptyListProps) {
  return (
    <EmptyStateCard
      variant="bordered"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase()}.`}
      action={
        onCreate
          ? {
              label: `Create ${entityName}`,
              onClick: onCreate,
            }
          : undefined
      }
    />
  );
}
