import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: any) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student" | "";
  rollNo?: string;
  department?: string;
  year?: string;
  adminPasskey?: string;
}

export default function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "",
    rollNo: "",
    department: "",
    year: "",
    adminPasskey: "",
  });

  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (formData.role === "admin") {
        const expected = import.meta.env.VITE_ADMIN_PASSKEY || "ADMIN-1234";
        if (!formData.adminPasskey || formData.adminPasskey !== expected) {
          toast({
            title: "Invalid Passkey",
            description: "Admin passkey is incorrect.",
            variant: "destructive",
          });
          return;
        }
      }

      const result = await register(formData.email, formData.password, formData.name, formData.role);
      if ("error" in result) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success!", description: "Account created successfully." });
      onAuthSuccess(result.user);
      onOpenChange(false);
    } else {
      if (!formData.email || !formData.password) {
        toast({
          title: "Error",
          description: "Please enter email and password",
          variant: "destructive",
        });
        return;
      }

      const result = await login(formData.email, formData.password);
      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Welcome!", description: `Signed in as ${result.user.role}` });
      onAuthSuccess(result.user);
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      rollNo: "",
      department: "",
      year: "",
      adminPasskey: "",
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>{isSignUp ? "Join Attendo" : "Welcome Back"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                required={isSignUp}
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>

          {/* Role */}
          {isSignUp && (
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value as "admin" | "student")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Student Fields */}
          {isSignUp && formData.role === "student" && (
            <>
              <Input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleInputChange}
                required
              />

              <Select
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                  <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                  <SelectItem value="Agriculture Engineering">Agriculture Engineering</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.year}
                onValueChange={(value) => handleChange("year", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st year">1st Year</SelectItem>
                  <SelectItem value="2nd year">2nd Year</SelectItem>
                  <SelectItem value="3rd year">3rd Year</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {/* Admin Field */}
          {isSignUp && formData.role === "admin" && (
            <Input
              type="password"
              name="adminPasskey"
              placeholder="Enter Admin Passkey"
              value={formData.adminPasskey}
              onChange={handleInputChange}
              required
            />
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg">
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-4 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={toggleMode} className="text-primary hover:underline font-medium">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
