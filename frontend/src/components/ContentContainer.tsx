import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContentContainerProps = {
    children: ReactNode;
    className?: string;
};

export const ContentContainer = ({ children, className }: ContentContainerProps) => (
    <div className={cn('content-container', className)}>{children}</div>
);
