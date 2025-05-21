import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
  onSwitchType: (type: "login" | "register") => void;
}

export function AuthModal({ isOpen, onClose, type, onSwitchType }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        {type === "login" ? (
          <LoginForm onSwitchToRegister={() => onSwitchType("register")} onSuccess={onClose} />
        ) : (
          <RegisterForm onSwitchToLogin={() => onSwitchType("login")} onSuccess={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
