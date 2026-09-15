import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import styles from "./EditIdPopup.module.css";
import { useUser } from "../../../../context/UserContext";

export default function EditIdPopup({ onClose, selectedId }) {
  const { user, url } = useUser();
  const toast = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    comment: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when selectedId changes
  useEffect(() => {
    if (selectedId) {
      setFormData({
        username: selectedId.username || "",
        password: selectedId.password || "",
        comment: selectedId.comment || ""
      });
    }
  }, [selectedId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${url}/api/admin/update-id`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedId.id,
          username: formData.username.trim(),
          password: formData.password.trim(),
          comment: formData.comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ID");
      }

      const data = await response.json();
      
      toast.current.show({
        severity: "success",
        summary: "ID Updated",
        detail: "ID information updated successfully",
        life: 3000,
      });

      onClose(true); // Pass true to indicate successful update
    } catch (error) {
      console.error("Error updating ID:", error);
      
      toast.current.show({
        severity: "error",
        summary: "Update Failed",
        detail: error.message || "Failed to update ID information",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={handleCancel}>
          &times;
        </button>

        <Toast ref={toast} />

        <div className={styles.popupContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>Edit ID Information</h2>
            <p className={styles.subtitle}>
              Update username, password, and add comments for {selectedId?.websiteName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
                placeholder="Enter username"
                disabled={isLoading}
              />
              {errors.username && (
                <span className={styles.errorText}>{errors.username}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="Enter password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="comment" className={styles.label}>
                Comment / Remark
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Add any comments or remarks about this ID..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update ID"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
