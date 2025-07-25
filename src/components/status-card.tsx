import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
};

export default function StatusCard({ title, value, description, icon: Icon, variant = 'default' }: StatusCardProps) {
  const variantClasses = {
    default: 'text-muted-foreground',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', variantClasses[variant])} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', variantClasses[variant])}>{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
