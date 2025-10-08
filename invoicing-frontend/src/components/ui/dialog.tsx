import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({ className, ...props }: DialogPrimitive.DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
      className
    )}
    {...props}
  />
);

const DialogContent = ({ className, ...props }: DialogPrimitive.DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    />
  </DialogPortal>
);

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

