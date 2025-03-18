
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function UserProfile() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    // Mock password change
    toast.success("Password updated successfully");
    
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Role</Label>
              <div className="font-medium mt-1">{user.role === "admin" ? "Administrator" : "Regular User"}</div>
            </div>
            {user.department && (
              <div>
                <Label>Department</Label>
                <div className="font-medium mt-1">{user.department}</div>
              </div>
            )}
            {user.position && (
              <div>
                <Label>Position</Label>
                <div className="font-medium mt-1">{user.position}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to maintain security.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordChange}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={logout}>
              Sign Out
            </Button>
            <Button type="submit">Update Password</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
