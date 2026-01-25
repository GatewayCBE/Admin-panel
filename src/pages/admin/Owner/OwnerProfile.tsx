import React, { useEffect, useState } from "react";
import { getOwnerByOwnerId, updateOwnerProfile } from "../../../services/firestoreService";
import { uploadTurfImages } from "../../../services/storageService";

interface OwnerProfileData {
  owner_name: string;
  owner_mobile_number: string;
  owner_profile_image?: string;
}

const OwnerProfile: React.FC = () => {
  const ownerId = localStorage.getItem("user_id") || "";
  const [profile, setProfile] = useState<OwnerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!ownerId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOwnerByOwnerId(ownerId);
        console.log("Fetched Owner Data:", data);

        if (data) {
          setProfile({
            owner_name: data.owner_name || "",
            owner_mobile_number: data.owner_mobile_number || "",
            owner_profile_image: data.owner_profile_image || "",
          });
          setPreviewUrl(data.owner_profile_image || "");
        }
      } catch (err) {
        console.error("Error fetching owner profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [ownerId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;

    try {
      let imageUrl = profile.owner_profile_image;

      // Upload new image if selected
      if (imageFile) {
        const urls = await uploadTurfImages("profile", ownerId, [imageFile]);
        imageUrl = urls[0];
      }

      // Prepare update payload
      const updateData: Partial<OwnerProfileData> = {
        owner_name: profile.owner_name.trim(),
        owner_mobile_number: profile.owner_mobile_number.trim(),
        owner_profile_image: imageUrl || "",
      };

      await updateOwnerProfile(ownerId, updateData);

      // Update local state
      setProfile((prev) =>
        prev ? { ...prev, owner_profile_image: imageUrl || "" } : null
      );
      setImageFile(null); // clear file input

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5 text-center">
        <h4>Profile not found</h4>
        <p className="text-muted">Unable to load owner information.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4">
      <div className="card shadow-lg border-0" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-success text-white text-center py-4">
          <h3 className="mb-0 fw-bold">My Profile</h3>
        </div>

        <div className="card-body p-4 p-md-5">
          {/* Profile Image Section */}
          <div className="text-center mb-5">
            <div className="position-relative d-inline-block">
              <img
                src={previewUrl || profile.owner_profile_image || "/default-avatar.png"}
                alt="Profile"
                className="rounded-circle shadow"
                width="140"
                height="140"
                style={{ objectFit: "cover", border: "4px solid #fff" }}
              />
              <label
                htmlFor="profileImageInput"
                className="btn btn-sm btn-outline-success position-absolute bottom-0 end-0 rounded-circle p-2"
                style={{ cursor: "pointer" }}
              >
                <i className="bi bi-camera-fill"></i>
              </label>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-muted mt-2 small">Click camera icon to change photo</p>
          </div>

          {/* Profile Details - Card-like display similar to modal */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="list-group list-group-flush border rounded shadow-sm">
                <div className="list-group-item px-4 py-3">
                  <div className="d-flex justify-content-between">
                    <strong>Name:</strong>
                    <span>{profile.owner_name || "—"}</span>
                  </div>
                </div>

                <div className="list-group-item px-4 py-3">
                  <div className="d-flex justify-content-between">
                    <strong>Mobile Number:</strong>
                    <span>{profile.owner_mobile_number || "—"}</span>
                  </div>
                </div>

              
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-5">
            <button
              className="btn btn-success px-5 py-2 fw-semibold"
              onClick={handleUpdate}
              disabled={!!imageFile} // optional: disable until image is processed
            >
              {imageFile ? "Uploading & Saving..." : "Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;