"use client"

import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { 
  updateProfileInfo, 
  updateLocation, 
  updatePreferences, 
  deleteAccount 
} from "./actions"

const STYLE_OPTIONS = ["Minimal", "Classic", "Streetwear", "Smart Casual", "Athleisure", "Boho", "Preppy", "Edgy"];

export default function ProfileClient({ user }: { user: any }) {
  const { addToast } = useToast()
  
  // States
  const [name, setName] = React.useState(user.name || "");
  const [location, setLocation] = React.useState(user.location || "");
  
  const [styles, setStyles] = React.useState<string[]>(
    user.stylePreferences && user.stylePreferences !== "[]" 
      ? JSON.parse(user.stylePreferences) 
      : []
  );
  
  const parsedSizes = user.sizes && user.sizes !== "{}" ? JSON.parse(user.sizes) : { top: "", bottom: "", shoe: "" };
  const [sizes, setSizes] = React.useState(parsedSizes);

  // Modals
  const [isPasswordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

  // Handlers
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    const res = await updateProfileInfo(formData);
    if (res.error) addToast(res.error, "error");
    else addToast("Profile updated", "success");
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateLocation(location);
    if (res.error) addToast(res.error, "error");
    else addToast("Location saved", "success");
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      addToast("Detecting location...", "info");
      // Simulate geolocation to avoid complexity in MVP
      setTimeout(() => {
        setLocation("London");
        addToast("Location detected as London", "success");
      }, 800);
    }
  };

  const toggleStyle = async (style: string) => {
    const newStyles = styles.includes(style)
      ? styles.filter((s: string) => s !== style)
      : [...styles, style];
    
    setStyles(newStyles);
    const res = await updatePreferences('styles', newStyles);
    if (res.success) addToast("Style saved", "success");
  };

  const handleSizeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSizes = { ...sizes, [e.target.name]: e.target.value };
    setSizes(newSizes);
  };

  const handleSaveSizes = async () => {
    const res = await updatePreferences('sizes', sizes);
    if (res.success) addToast("Sizes saved", "success");
    else addToast("Failed to save sizes", "error");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText === "DELETE") {
      const res = await deleteAccount();
      if (res.success) {
        addToast("Account deleted", "success");
        await signOut({ callbackUrl: "/" });
      } else {
        addToast(res.error || "Failed to delete", "error");
      }
    }
  };

  return (
    <div className="max-w-[600px] mx-auto py-12 px-4 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-8">Profile & Settings</h1>
      
      {/* Personal Info */}
      <section className="py-8 border-b border-border">
        <h2 className="text-lg font-medium mb-6">Personal Information</h2>
        <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
          <Input 
            label="Display name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div>
            <Input 
              label="Email" 
              value={user.email} 
              disabled 
              className="bg-muted/5 text-muted cursor-not-allowed"
            />
            <p className="text-[13px] text-muted mt-1">To change your email, contact support</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button 
              type="button"
              className="text-[14px] text-primary hover:underline"
              onClick={() => setPasswordModalOpen(true)}
            >
              Change password
            </button>
            <Button size="sm" type="submit">Save Changes</Button>
          </div>
        </form>
      </section>

      {/* Location */}
      <section className="py-8 border-b border-border">
        <h2 className="text-lg font-medium mb-6">Location</h2>
        <form onSubmit={handleSaveLocation} className="flex flex-col gap-4">
          <div>
            <Input 
              placeholder="e.g. London" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-[13px] text-muted">This helps the AI give weather-appropriate suggestions.</p>
              <button 
                type="button" 
                onClick={detectLocation}
                className="text-[13px] text-primary hover:underline whitespace-nowrap"
              >
                Detect my location
              </button>
            </div>
          </div>
          <div className="flex justify-end">
             <Button size="sm" type="submit">Save Location</Button>
          </div>
        </form>
      </section>

      {/* Style Preferences */}
      <section className="py-8 border-b border-border">
        <h2 className="text-lg font-medium mb-6">Style Preferences</h2>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                styles.includes(style) 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "border-border text-foreground hover:border-muted"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className="py-8 border-b border-border">
        <h2 className="text-lg font-medium mb-6">Your Sizes</h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <select 
              name="top" 
              value={sizes.top} 
              onChange={handleSizeChange}
              className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
            >
              <option value="">Top Size</option>
              {["XS","S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              name="bottom" 
              value={sizes.bottom} 
              onChange={handleSizeChange}
              className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
            >
              <option value="">Bottom Size</option>
              {["28","30","32","34","36","38","40"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              name="shoe" 
              value={sizes.shoe} 
              onChange={handleSizeChange}
              className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
            >
              <option value="">Shoe Size</option>
              {["6","7","8","9","10","11","12"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveSizes}>Save Sizes</Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="py-8">
        <h2 className="text-[15px] font-medium text-muted mb-4 uppercase tracking-wider">Account</h2>
        <button 
          onClick={() => setDeleteModalOpen(true)}
          className="text-error hover:underline text-[15px] font-medium"
        >
          Delete my account
        </button>
      </section>

      {/* Password Modal (Mock) */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
      >
        <div className="flex flex-col gap-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <Button onClick={() => setPasswordModalOpen(false)} className="mt-2">Update Password</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmText("");
        }}
        title="Delete Account"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[15px] text-muted">
            This will permanently delete your account, wardrobe, and order history. This cannot be undone.
          </p>
          <Input 
            label="Type 'DELETE' to confirm" 
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirmText !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
