import * as React from "react";

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TheCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  footerClassName?: string;
  highlightOnHover?: boolean;
}

const TheCard = React.forwardRef<HTMLDivElement, TheCardProps>(
  (
    {
      children,
      className,
      title,
      header,
      footer,
      contentClassName,
      headerClassName,
      titleClassName,
      footerClassName,
      highlightOnHover = true,
      ...props
    },
    ref,
  ) => {
    const hasHeader = Boolean(header || title);

    return (
      <Card
        ref={ref}
        className={cn(
          "border-white/10 bg-card/40 opacity-80 backdrop-blur-sm transition-all duration-200 hover:bg-card/60 hover:opacity-100",
          highlightOnHover && "hover:border-primary/40",
          className,
        )}
        {...props}
      >
        {hasHeader && (
          <CardHeader className={cn("pb-3", headerClassName)}>
            {header ?? (
              <CardTitle
                className={cn("text-base font-semibold", titleClassName)}
              >
                {title}
              </CardTitle>
            )}
          </CardHeader>
        )}

        <div className={cn(contentClassName)}>{children}</div>

        {footer && (
          <CardFooter className={cn("pt-3", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  },
);

TheCard.displayName = "TheCard";

export { TheCard };
export default TheCard;
