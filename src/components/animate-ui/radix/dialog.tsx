'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useDragControls,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

type DialogContextType = {
  isOpen: boolean;
};

const DialogContext = React.createContext<DialogContextType | undefined>(
  undefined,
);

const useDialog = (): DialogContextType => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog');
  }
  return context;
};

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Dialog({ children, ...props }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(
    props?.open ?? props?.defaultOpen ?? false,
  );

  React.useEffect(() => {
    if (props?.open !== undefined) setIsOpen(props.open);
  }, [props?.open]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      props.onOpenChange?.(open);
    },
    [props],
  );

  return (
    <DialogContext.Provider value={{ isOpen }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        {...props}
        onOpenChange={handleOpenChange}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>;

function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>;

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> &
  HTMLMotionProps<'div'> & {
    from?: FlipDirection;
    transition?: Transition;
    /**
     * Below `sm`, dock the dialog to the bottom edge as a full-width sheet and
     * slide it up instead of flipping it in. A centred modal on a phone wastes
     * a margin on every side and puts its controls in the middle of the screen,
     * out of thumb reach.
     */
    mobileSheet?: boolean;
  };

function DialogContent({
  className,
  children,
  from = 'top',
  transition = { type: 'spring', stiffness: 150, damping: 25 },
  mobileSheet = false,
  ...props
}: DialogContentProps) {
  const { isOpen } = useDialog();
  const asSheet = useMediaQuery('(max-width: 639px)') && mobileSheet;

  // Drag is started only from the grab handle. Letting the whole sheet listen
  // would fight the scrollable content inside it - pulling down on the thread
  // would drag the sheet instead of scrolling the replies.
  const dragControls = useDragControls();
  // Radix owns the open state (it may be controlled or not), so the honest way
  // to close imperatively is to trigger its own Close.
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const initialRotation =
    from === 'top' || from === 'left' ? '20deg' : '-20deg';
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPortal forceMount data-slot="dialog-portal">
          <DialogOverlay asChild forceMount>
            <motion.div
              key="dialog-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
          </DialogOverlay>
          <DialogPrimitive.Content asChild forceMount {...props}>
            <motion.div
              key="dialog-content"
              data-slot="dialog-content"
              initial={
                asSheet
                  ? { opacity: 0, y: '100%' }
                  : {
                      opacity: 0,
                      filter: 'blur(4px)',
                      transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
                    }
              }
              animate={
                asSheet
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: 1,
                      filter: 'blur(0px)',
                      transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)`,
                    }
              }
              exit={
                asSheet
                  ? { opacity: 0, y: '100%' }
                  : {
                      opacity: 0,
                      filter: 'blur(4px)',
                      transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
                    }
              }
              transition={
                asSheet
                  ? { type: 'spring', stiffness: 300, damping: 32 }
                  : transition
              }
              drag={asSheet ? 'y' : false}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) {
                  closeRef.current?.click();
                }
              }}
              className={cn(
                'fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 rounded-xl',
                mobileSheet &&
                  'max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl max-sm:border-b-0',
                className,
              )}
              {...props}
            >
              {asSheet && (
                <div
                  aria-hidden="true"
                  onPointerDown={(event) => dragControls.start(event)}
                  className="shrink-0 flex justify-center pt-2.5 pb-1 touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="h-1 w-9 rounded-full bg-border" />
                </div>
              )}
              {children}
              <DialogPrimitive.Close ref={closeRef} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

type DialogHeaderProps = React.ComponentProps<'div'>;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  );
}

type DialogFooterProps = React.ComponentProps<'div'>;

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end gap-2',
        className,
      )}
      {...props}
    />
  );
}

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

type DialogDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialog,
  type DialogContextType,
  type DialogProps,
  type DialogTriggerProps,
  type DialogPortalProps,
  type DialogCloseProps,
  type DialogOverlayProps,
  type DialogContentProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
};
