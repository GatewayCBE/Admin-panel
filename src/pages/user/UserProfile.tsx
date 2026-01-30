import React, { useEffect, useState } from "react";
import {
  getUserByUserId,
  updateUserProfile,
} from "../../services/firestoreService";
import { uploadTurfImages } from "../../services/storageService";

interface UserProfileData {
  doc_id: string;
  user_name: string;
  user_mobile_number: string;
  user_profile_image_url?: string;
}

const UserProfile: React.FC = () => {
  const ownerId = localStorage.getItem("user_id") || "";

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [originalProfile, setOriginalProfile] =
    useState<UserProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!ownerId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserByUserId(ownerId);
        if (!data) return;

        const profileData: UserProfileData = {
          doc_id: data.doc_id,
          user_name: data.user_name || "",
          user_mobile_number: data.user_mobile_number || "",
          user_profile_image_url: data.user_profile_image_url || "",
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
        setPreviewUrl(profileData.user_profile_image_url || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [ownerId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!profile) return;

    if (!profile.user_name.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      let imageUrl = profile.user_profile_image_url || "";

      if (imageFile) {
        const urls = await uploadTurfImages(
          "profile",
          ownerId,
          [imageFile]
        );
        imageUrl = urls[0];
      }

      await updateUserProfile(profile.doc_id, {
        user_name: profile.user_name.trim(),
        user_profile_image_url: imageUrl,
      });

      const updatedProfile = {
        ...profile,
        user_profile_image_url: imageUrl,
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setPreviewUrl(imageUrl || null);
      setImageFile(null);
      setIsEditing(false);

      alert("✅ Profile updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!originalProfile) return;

    setProfile(originalProfile);
    setPreviewUrl(originalProfile.user_profile_image_url || null);
    setImageFile(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5 text-center">
        <h4>Profile not found</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5 mb-2">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-success text-white text-center py-4">
          <h3 className="fw-bold mb-0">MY PROFILE</h3>
        </div>

        <div className="card-body p-4 p-md-5">
          {/* PROFILE IMAGE */}
          <div className="text-center mb-5">
            <div className="position-relative d-inline-block">
              <img
                src={
                  previewUrl ||
                  profile.user_profile_image_url ||
                  "/default-avatar.png"
                }
                alt="Profile"
                width={120}
                height={120}
                className="rounded-circle shadow"
                style={{
                  objectFit: "cover",
                  border: "4px solid #fff",
                }}
              />

              {isEditing && (
                <>
                  <label
                    htmlFor="profileImageInput"
                    className="btn btn-sm btn-success position-absolute bottom-0 end-0 rounded-circle p-2"
                  >
                    <i className="bi bi-camera-fill text-white"></i>
                  </label>
                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>

            {!isEditing && (
              <button
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* DETAILS */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="list-group list-group-flush border rounded shadow-sm">
                {/* NAME */}
                <div className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                  <strong>Name</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control w-50"
                      value={profile.user_name}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          user_name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{profile.user_name || "—"}</span>
                  )}
                </div>

                {/* MOBILE */}
                <div className="list-group-item d-flex justify-content-between px-4 py-3">
                  <strong>Mobile Number</strong>
                  <span>{profile.user_mobile_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          {isEditing && (
            <div className="d-flex justify-content-center gap-3 mt-5">
              <button
                className="btn btn-secondary px-4"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-success px-5 fw-semibold"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
