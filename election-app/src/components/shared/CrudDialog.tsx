// components/shared/CrudDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface CrudDialogProps {
  title: string;
  triggerText: string;
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CrudDialog({ title, triggerText, children, isOpen, setIsOpen }: CrudDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}