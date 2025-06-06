"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { Check, Save, Upload } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [birthday, setBirthday] = useState(
    user?.birthday ? user.birthday.slice(0, 10) : ""
  );
  const [createdAt, setCreatedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePasswordConfirm, setShowSavePasswordConfirm] = useState(false);

  const [initialProfile, setInitialProfile] = useState({
    username: user?.username,
    email: user?.email,
    birthday: user?.birthday ? user.birthday.slice(0, 10) : "",
  });

  const isProfileChanged =
    username !== initialProfile.username ||
    email !== initialProfile.email ||
    birthday !== initialProfile.birthday;

  const isPasswordChanged =
    currentPassword.length > 0 && newPassword.length > 0;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put("/user/info", {
        username,
        email,
        birthday,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setInitialProfile({ username, email, birthday });
    } catch (err) {
      // handle error (có thể show toast)
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axiosClient.delete("/user/info");
      logout();
      router.push("/register");
    } catch (err) {
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Hàm handle đổi mật khẩu
  const handleChangePassword = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put("/user/change-password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      // handle error (có thể show toast)
    } finally {
      setIsSaving(false);
      setShowSavePasswordConfirm(false);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosClient.get("/user/info");
        const apiUser = res.data.data;
        setUsername(apiUser.username || "");
        setEmail(apiUser.email || "");
        setBirthday(apiUser.birthday ? apiUser.birthday.slice(0, 10) : "");
        setCreatedAt(
          apiUser.created_at
            ? new Date(apiUser.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : ""
        );
        setInitialProfile({
          username: apiUser.username || "",
          email: apiUser.email || "",
          birthday: apiUser.birthday ? apiUser.birthday.slice(0, 10) : "",
        });
      } catch (err) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          try {
            const parsedUser = JSON.parse(localUser);
            setUsername(parsedUser.username || "");
            setEmail(parsedUser.email || "");
            setBirthday(
              parsedUser.birthday ? parsedUser.birthday.slice(0, 10) : ""
            );
          } catch {}
        }
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <Avatar className="h-32 w-32 border-4 border-background">
                          {user?.avatar_url ? (
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user?.username || "User"}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Button>
                      </div>
                      <h2 className="text-xl font-bold">{username}</h2>
                      <p className="text-sm text-muted-foreground">{email}</p>

                      <Separator className="my-4" />

                      <div className="text-sm text-muted-foreground text-center">
                        <p>Member since {createdAt || "..."}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal information and account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setShowSaveConfirm(true)}
                        disabled={!isProfileChanged || isSaving}
                      >
                        {isSaving ? (
                          "Saving..."
                        ) : saveSuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => setShowSavePasswordConfirm(true)}
                            disabled={!isPasswordChanged || isSaving}
                          >
                            {isSaving ? (
                              "Saving..."
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Change
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Danger Zone</h3>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveProfile}
        title="Confirm Save"
        description="Are you sure you want to save the changes to your profile?"
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone."
      />
      <ConfirmDialog
        open={showSavePasswordConfirm}
        onClose={() => setShowSavePasswordConfirm(false)}
        onConfirm={handleChangePassword}
        title="Change Password"
        description="Are you sure you want to change your password?"
      />
    </div>
  );
}
