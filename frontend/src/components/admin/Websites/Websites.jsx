import React, { useState, useRef, useEffect } from "react";
import styles from "./Websites.module.css";
import TopNavbar from "../../Navbar/TopNavbar";
import { useUser } from "../../../context/UserContext";
import { getImageUrl } from "../../../utils/imageUrl";
import { FileUpload } from "primereact/fileupload";
import { PulseLoader } from "react-spinners";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-dark-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { MdDeleteForever } from "react-icons/md";
import { FaTrash, FaEdit, FaPlus, FaTools, FaGlobe } from "react-icons/fa";
import DepositPopup from "../../Navbar/DepositPopup";
import { checkIsSuperAdmin } from "../../../utils/roles";

const Websites = () => {
  const { user, url } = useUser();
  const toast = useRef(null); // Add a reference for Toast

  //  new Website Modal State
  const [newWebsite, setNewWebsite] = useState({
    id: "",
    website: "",
    url: "",
    logo: "",
    category: "",
    minimumCoins: "",
    targetAdminId: "",
  });

  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]); // Categories from websites
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true); // Loading state for categories
  const [menuOpen, setMenuOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false); // State for Add Website modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // State for Category management modal
  const [showDepositPopup, setShowDepositPopup] = useState(false); // State for deposit popup

  // Sub-admin & Permission states
  const isSuperAdmin = checkIsSuperAdmin(user);
  const canAddWebsites =
    isSuperAdmin || user?.permissions?.canAddWebsites !== false;
  const canEditWebsites =
    isSuperAdmin || user?.permissions?.canEditWebsites !== false;
  const canDeleteWebsites =
    isSuperAdmin || user?.permissions?.canDeleteWebsites !== false;
  const canManageCategories =
    isSuperAdmin || user?.permissions?.canManageCategories !== false;
  const adminHeaderId = user?.id || user?._id || user?.username || "";

  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdminFilter, setSelectedSubAdminFilter] = useState("all");

  // Category management states
  const [newCategory, setNewCategory] = useState({
    name: "",
    targetAdminId: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(""); // Search bar state
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categorySearch, setCategorySearch] = useState(""); // Separate search for categories

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 websites per page

  // Fetch sub-admins for superadmin
  const fetchSubAdmins = async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch(`${url}/api/admin/get-subadmins`, {
        headers: { "x-admin-id": adminHeaderId },
      });
      if (response.ok) {
        const data = await response.json();
        setSubAdmins(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching sub-admins:", err);
    }
  };

  // Function to fetch websites data
  const fetchWebsites = async (filterId = selectedSubAdminFilter) => {
    try {
      setIsLoading(true);
      const queryParam =
        isSuperAdmin && filterId && filterId !== "all"
          ? `?filterAdminId=${filterId}`
          : "";
      const response = await fetch(
        `${url}/api/admin/get-websites${queryParam}`,
        {
          headers: {
            "x-admin-id": adminHeaderId,
          },
        },
      );
      const data = await response.json();
      if (response.ok) {
        setWebsites(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching websites:", data);
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch categories from websites
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/api/admin/get-all-categories`, {
        headers: {
          "x-admin-id": adminHeaderId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        console.error("Error fetching categories:", data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Function to fetch categories for dropdown (searchable)
  const fetchCategoriesForDropdown = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await fetch(`${url}/api/admin/get-all-categories`, {
        headers: {
          "x-admin-id": adminHeaderId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
        // Ensure selectedCategory is still valid after loading
        if (
          selectedCategory !== "All Categories" &&
          data.categories &&
          data.categories.includes(selectedCategory)
        ) {
          // Keep the current selection if it's still valid
          console.log("Keeping current selection:", selectedCategory);
        } else {
          // Reset to "All Categories" if current selection is no longer valid
          console.log("Resetting to All Categories");
          setSelectedCategory("All Categories");
        }
      } else {
        console.error("Error fetching categories:", data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Fetch data when the component loads or filter changes
  useEffect(() => {
    fetchWebsites(selectedSubAdminFilter);
    fetchCategoriesForDropdown();
    if (isSuperAdmin) {
      fetchSubAdmins();
    }
  }, [selectedSubAdminFilter]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showModal || showAddModal || showCategoryModal || showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, showAddModal, showCategoryModal, showEditModal]);

  // Debug selectedCategory changes
  useEffect(() => {
    console.log("selectedCategory changed to:", selectedCategory);
  }, [selectedCategory]);

  // Filter categories based on search query
  const filteredCategories = (categories || []).filter((category) => {
    // If no category search, show all categories
    if (!categorySearch || categorySearch.trim() === "") {
      return category && typeof category === "string";
    }
    // If there's a search, filter by it
    return (
      category &&
      typeof category === "string" &&
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  });

  // Filter websites based on search query and selected category
  const filteredWebsites = (websites || []).filter((website) => {
    if (!website || (!website.name && !website.website) || !website.url) {
      return false;
    }

    const websiteName = website.name || website.website || "";
    const matchesSearch =
      websiteName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      website.url.toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      website.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWebsites = filteredWebsites.slice(startIndex, endIndex);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Reset category search when category selection changes
  useEffect(() => {
    // Only reset category search if a new category is actually selected
    if (selectedCategory !== "All Categories") {
      setCategorySearch("");
    }
  }, [selectedCategory]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Function to add a new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.current.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Category name is required",
        life: 3000,
      });
      return;
    }

    try {
      setIsCategoryLoading(true);
      const response = await fetch(`${url}/api/admin/add-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminHeaderId,
        },
        body: JSON.stringify({
          name: newCategory.name,
          targetAdminId: isSuperAdmin
            ? newCategory.targetAdminId || ""
            : adminHeaderId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Category Added",
          detail: "Category added successfully",
          life: 2000,
        });
        setNewCategory({ name: "", targetAdminId: "" });
        setCategorySearch(""); // Reset category search
        fetchCategoriesForDropdown(); // Refresh categories
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to add category",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add category",
        life: 3000,
      });
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Function to remove a category from all websites
  const handleRemoveCategory = async (categoryName) => {
    if (
      window.confirm(
        `Are you sure you want to remove the category "${categoryName}" from all websites? This will set their category to empty.`,
      )
    ) {
      try {
        const response = await fetch(`${url}/api/admin/remove-category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-id": adminHeaderId,
          },
          body: JSON.stringify({ categoryName }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.current.show({
            severity: "success",
            summary: "Category Removed",
            detail: data.message,
            life: 3000,
          });
          // Refresh both websites and categories
          fetchWebsites();
          fetchCategoriesForDropdown();
          setCategorySearch(""); // Reset category search
          // Reset selected category if it was removed
          if (selectedCategory === categoryName) {
            setSelectedCategory("All Categories");
          }
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: data.message || "Failed to remove category",
            life: 3000,
          });
        }
      } catch (error) {
        console.error("Error removing category:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to remove category",
          life: 3000,
        });
      }
    }
  };

  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

  const onFileSelect = (e) => {
    try {
      if (e.files && e.files[0]) {
        const selectedFile = e.files[0];
        if (selectedFile.size > 1000000) {
          throw new Error("File is too large. Max size is 1MB.");
        }
        if (!selectedFile.type.startsWith("image/")) {
          throw new Error("Invalid file type. Only images are allowed.");
        }
        setFile(selectedFile);
        setNewWebsite((prev) => ({
          ...prev,
          logo: selectedFile, // Update logo field in state
        }));
        toast.current.show({
          severity: "success",
          summary: "File Selected",
          detail: "File uploaded successfully",
          life: 1000,
        });
      } else {
        throw new Error("No file selected.");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "File Upload Failed",
        detail: error.message,
        life: 3000,
      });
    }
  };

  const handleFocus = () => {
    setErrorMessage("");
  };

  const handleAddWebsite = async () => {
    if (
      !newWebsite.website ||
      !newWebsite.url ||
      !newWebsite.category ||
      !newWebsite.minimumCoins ||
      !file
    ) {
      setErrorMessage(
        "All fields are required to add a website, including the logo.",
      );
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("website", newWebsite.website);
      formData.append("url", newWebsite.url);
      formData.append("category", newWebsite.category);
      formData.append("minimumCoins", newWebsite.minimumCoins);
      formData.append("logo", file);
      if (isSuperAdmin && newWebsite.targetAdminId) {
        formData.append("targetAdminId", newWebsite.targetAdminId);
      }

      const response = await fetch(`${url}/api/admin/add-website`, {
        method: "POST",
        headers: {
          "x-admin-id": adminHeaderId,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Website Added",
          detail: "Website Added successfully",
          life: 1000,
        });
        setShowAddModal(false);
        setNewWebsite({
          id: "",
          website: "",
          url: "",
          category: "",
          logo: "",
          minimumCoins: "",
          targetAdminId: "",
        });
        setFile(null);
        fetchWebsites(selectedSubAdminFilter); // Re-fetch the data after adding a new website
        fetchCategories(); // Also refresh categories
      } else {
        console.error("Error adding website:");
        setErrorMessage(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setErrorMessage("Request failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = (id) => {
    // Check wallet balance before allowing ID creation
    const currentBalance = user?.balance || 0;

    if (currentBalance < 100) {
      // Show toast message
      toast.current.show({
        severity: "warn",
        summary: "Insufficient Balance",
        detail:
          "You need at least ₹100 in your wallet to create an ID. Please deposit money first.",
        life: 4000,
      });

      // Open deposit popup
      setShowDepositPopup(true);
      return;
    }

    // Find the website by its unique ID, instead of using the index
    const website = websites.find((item) => item.id === id);
    // console.log(website)
    setSelectedWebsite(website);
    setMenuOpen(null); // Close the menu
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsername(""); // Reset username
    setPassword(""); // Reset password
    setErrorMessage(""); // Reset error message
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    console.log("Category changed to:", e.target.value); // Debug log
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("User must be logged in to create an ID.");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username and password are required.");
      return;
    }

    // Double-check wallet balance before submitting
    const currentBalance = user?.balance || 0;
    if (currentBalance < 100) {
      setErrorMessage(
        "You need at least ₹100 in your wallet to create an ID. Please deposit money first.",
      );
      toast.current.show({
        severity: "warn",
        summary: "Insufficient Balance",
        detail:
          "You need at least ₹100 in your wallet to create an ID. Please deposit money first.",
        life: 4000,
      });
      setShowDepositPopup(true);
      return;
    }

    const { websiteName, websiteUrl, imgUrl } = {
      websiteName: selectedWebsite.website,
      websiteUrl: selectedWebsite.url,
      imgUrl: selectedWebsite.logo,
    };

    try {
      setIsLoading(true);
      setErrorMessage(""); // Clear previous errors

      const response = await fetch(`${url}/api/user/create-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteName,
          websiteUrl,
          username: username.trim(),
          password: password.trim(),
          imgUrl,
          createdBy: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "ID Created",
          detail: "ID created successfully!",
          life: 3000,
        });
        setShowModal(false);
        setUsername("");
        setPassword("");
        setErrorMessage("");
      } else {
        console.error("Error creating ID:", data);
        // Check for specific error messages
        if (data.message && data.message.includes("username already exists")) {
          setErrorMessage(
            "This username already exists for this website. Please choose a different username.",
          );
        } else if (data.message && data.message.includes("duplicate")) {
          setErrorMessage(
            "A user with this username already exists for this website.",
          );
        } else {
          setErrorMessage(
            data.message || "An error occurred while creating the ID.",
          );
        }
      }
    } catch (error) {
      console.error("Request failed:", error);
      setErrorMessage("Request failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the delete action
  const handleDelete = async (item) => {
    try {
      const itemId = item.id;
      const response = await fetch(
        `${url}/api/admin/delete-website/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "x-admin-id": adminHeaderId,
          },
        },
      );

      if (response.ok) {
        fetchWebsites(selectedSubAdminFilter);
        fetchCategories(); // Also refresh categories
        toast.current.show({
          severity: "success",
          summary: "Website deleted",
          detail: "Website deleted successfully",
          life: 2000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.current.show({
          severity: "error",
          summary: "Delete failed",
          detail: errorData.message || "Failed to delete website",
          life: 2000,
        });
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to handle website editing
  const handleEditWebsite = async () => {
    if (
      !editingWebsite.website ||
      !editingWebsite.url ||
      !editingWebsite.category ||
      !editingWebsite.minimumCoins
    ) {
      setEditErrorMessage("All fields are required to edit a website.");
      return;
    }

    try {
      setIsEditLoading(true);
      const formData = new FormData();
      formData.append("website", editingWebsite.website);
      formData.append("url", editingWebsite.url);
      formData.append("category", editingWebsite.category);
      formData.append("minimumCoins", editingWebsite.minimumCoins);
      if (editFile) {
        formData.append("logo", editFile);
      }

      const response = await fetch(
        `${url}/api/admin/update-website/${editingWebsite.id}`,
        {
          method: "PUT",
          headers: {
            "x-admin-id": adminHeaderId,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Website Updated",
          detail: "Website updated successfully",
          life: 2000,
        });
        setShowEditModal(false);
        setEditingWebsite(null);
        setEditFile(null);
        setEditErrorMessage("");
        fetchWebsites(selectedSubAdminFilter); // Re-fetch the data after updating
        fetchCategories(); // Also refresh categories
      } else {
        setEditErrorMessage(
          data.message || "An error occurred while updating.",
        );
      }
    } catch (error) {
      console.error("Request failed:", error);
      setEditErrorMessage("Request failed, please try again.");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Function to open edit modal
  const openEditModal = (website) => {
    setEditingWebsite({
      id: website.id,
      website: website.name || website.website || "",
      url: website.url || "",
      category: website.category || "",
      minimumCoins: website.minimumCoins || "",
      logo: website.logo || "",
    });
    setEditFile(null);
    setEditErrorMessage("");
    setShowEditModal(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingWebsite(null);
    setEditFile(null);
    setEditErrorMessage("");
  };

  // Function to handle edit file selection
  const onEditFileSelect = (e) => {
    try {
      if (e.files && e.files[0]) {
        const selectedFile = e.files[0];
        if (selectedFile.size > 1000000) {
          throw new Error("File is too large. Max size is 1MB.");
        }
        if (!selectedFile.type.startsWith("image/")) {
          throw new Error("Invalid file type. Only images are allowed.");
        }
        setEditFile(selectedFile);
        toast.current.show({
          severity: "success",
          summary: "File Selected",
          detail: "New logo selected for update",
          life: 1000,
        });
      } else {
        throw new Error("No file selected.");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "File Upload Failed",
        detail: error.message,
        life: 3000,
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <TopNavbar />
      <div className={styles.container}>
        {isLoading && (
          <div className={styles.loading}>
            <PulseLoader
              color="var(--primary-color)"
              loading={isLoading}
              size={15}
            />
          </div>
        )}

        <div className={styles.headerSection}>
          <div className={styles.headerTitleGroup}>
            <FaGlobe className={styles.headerTitleIcon} />
            <h2 className={styles.heading}>Websites Management</h2>
          </div>
          <div className={styles.headerActions}>
            {canAddWebsites && (
              <button
                className={styles.addWebsiteButton}
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className={styles.btnIcon} />
                <span>Add Website</span>
              </button>
            )}

            {canManageCategories && (
              <button
                className={styles.categoryManageButton}
                onClick={() => setShowCategoryModal(true)}
              >
                <FaTools className={styles.btnIcon} />
                <span>Manage Categories</span>
              </button>
            )}
          </div>
        </div>

        {/* Superadmin Sub-admin Filter */}
        {isSuperAdmin && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              padding: "0 1rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                color: "var(--primary-color)",
                fontWeight: "600",
                fontSize: "0.95rem",
                textAlign: "center",
              }}
            >
              Filter Websites by Admin Master:
            </span>
            <select
              value={selectedSubAdminFilter}
              onChange={(e) => {
                setSelectedSubAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "20px",
                background: "rgba(30, 30, 45, 0.95)",
                color: "#fff",
                border: "1.5px solid rgba(var(--primary-color-rgb), 0.5)",
                outline: "none",
                cursor: "pointer",
                fontSize: "0.95rem",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <option value="all">All Admin Masters</option>
              {subAdmins.map((sa) => (
                <option key={sa.id} value={sa.id}>
                  {sa.username} {sa.name ? `(${sa.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.searchSortWrapper}>
          {/* Search and Filter Section */}
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              onFocus={handleFocus}
            />

            {/* Category Filter */}
            <div className={styles.filterSection}>
              <label htmlFor="categoryFilter">All Categories:</label>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className={styles.searchInput}
                onFocus={handleFocus}
              />
              {isCategoriesLoading ? (
                <div className={styles.categoryLoading}>
                  <PulseLoader color="var(--primary-color)" size={10} />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className={styles.categorySelect}
                >
                  {console.log("Current selectedCategory:", selectedCategory)}{" "}
                  {/* Debug log */}
                  <option value="All Categories">All Categories</option>
                  {filteredCategories && filteredCategories.length > 0
                    ? filteredCategories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))
                    : // Fallback: show all categories if filtering fails
                      (categories || []).map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                </select>
              )}
            </div>
          </div>
        </div>
        {/* Loader when data is fetching */}
        {isLoading ? (
          <div className={styles.loader}>
            <PulseLoader color="var(--primary-color)" size={15} />
            <p>Loading websites...</p>
          </div>
        ) : (
          <>
            {/* Websites Count */}
            <div className={styles.websitesCount}>
              {filteredWebsites.length === 0
                ? "No websites found"
                : `${filteredWebsites.length} website${filteredWebsites.length === 1 ? "" : "s"} found`}
              {filteredWebsites.length > itemsPerPage && (
                <span>
                  {" "}
                  • Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredWebsites.length)} of{" "}
                  {filteredWebsites.length}
                </span>
              )}
            </div>

            {/* Website List */}
            {currentWebsites.length > 0 ? (
              currentWebsites.map((website, index) => (
                <div key={website.id || index} className={styles.websiteCard}>
                  <div className={styles.websiteInfo}>
                    <div className={styles.cardHeader}>
                      <img
                        src={getImageUrl(website.logo, url)}
                        alt={website.name || website.website || "Website Logo"}
                        className={styles.websiteLogo}
                      />
                      <h3>
                        {website.name || website.website || "Unnamed Website"}
                      </h3>
                    </div>
                    <div className={styles.websiteDetails}>
                      <p>{website.url || "No URL"}</p>

                      <span className={styles.categoryTag}>
                        {website.category || "No Category"}
                      </span>

                      {website.minimumCoins && (
                        <p className={styles.coinInfo}>
                          <strong>Min Coins:</strong> {website.minimumCoins}
                        </p>
                      )}
                      {website.isActive !== undefined && (
                        <span
                          className={`${styles.statusTag} ${website.isActive ? styles.activeStatus : styles.inactiveStatus}`}
                        >
                          {website.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                      {isSuperAdmin && website.adminId && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--primary-color)",
                            margin: "4px 0 0 0",
                          }}
                        >
                          <strong>Admin Master:</strong>{" "}
                          {subAdmins.find(
                            (s) =>
                              s.id === website.adminId ||
                              s._id === website.adminId,
                          )?.username ||
                            (website.adminId === "1"
                              ? "Default"
                              : website.adminId)}
                        </p>
                      )}
                    </div>
                    <div className={styles.websiteActions}>
                      {canEditWebsites && (
                        <button
                          onClick={() => openEditModal(website)}
                          className={styles.editButton}
                          title="Edit Website"
                          aria-label="Edit Website"
                        >
                          <FaEdit size={17} />
                        </button>
                      )}
                      {canDeleteWebsites && (
                        <button
                          onClick={() => handleDelete(website)}
                          className={styles.deleteButton}
                          title="Delete Website"
                          aria-label="Delete Website"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.loading}>
                {searchQuery || selectedCategory !== "All Categories"
                  ? "No websites found matching your criteria."
                  : "No websites available."}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredWebsites.length > itemsPerPage && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredWebsites.length)} of{" "}
                  {filteredWebsites.length} websites
                </div>
                <div className={styles.paginationControls}>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className={styles.pageNumbers}>
                    {getPageNumbers().map((page, index) => (
                      <React.Fragment key={index}>
                        {page === "..." ? (
                          <span className={styles.pageEllipsis}>...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`${styles.pageButton} ${
                              page === currentPage ? styles.activePage : ""
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create ID Modal */}
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 style={{ margin: 0 }}>
                  Create ID for {selectedWebsite?.website}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className={styles.closeButton}
                >
                  <i className="pi pi-times"></i>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.inputGroup}>
                  <label>Username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={styles.inputField}
                  />
                </div>

                {errorMessage && <p className={styles.error}>{errorMessage}</p>}

                {/* Action Buttons */}
                <div className={styles.modalActions}>
                  <button
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={isLoading || !username.trim() || !password.trim()}
                  >
                    {isLoading ? (
                      <>
                        <PulseLoader color="#ffffff" size={8} />
                        Creating...
                      </>
                    ) : (
                      "Create ID"
                    )}
                  </button>

                  <button
                    onClick={handleCloseModal}
                    className={styles.modalCloseButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Website Modal */}
        {showAddModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 style={{ margin: 0 }}>Add New Website</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={styles.closeButton}
                >
                  <i className="pi pi-times"></i>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formContainer}>
                  {isSuperAdmin && (
                    <div className={styles.formRow}>
                      <div
                        className={styles.formGroup}
                        style={{ width: "100%" }}
                      >
                        <label htmlFor="targetAdminId">
                          Assign Website to Admin Master
                        </label>
                        <select
                          id="targetAdminId"
                          value={newWebsite.targetAdminId || ""}
                          onChange={(e) =>
                            setNewWebsite({
                              ...newWebsite,
                              targetAdminId: e.target.value,
                            })
                          }
                          className={styles.selectField}
                        >
                          <option value="">Self (Superadmin - All)</option>
                          {subAdmins.map((sa) => (
                            <option key={sa.id} value={sa.id}>
                              {sa.username} {sa.name ? `(${sa.name})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="websiteName">Website Name</label>
                      <input
                        id="websiteName"
                        type="text"
                        placeholder="Enter website name"
                        value={newWebsite.website}
                        onChange={(e) =>
                          setNewWebsite({
                            ...newWebsite,
                            website: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        onFocus={handleFocus}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="websiteUrl">Website URL</label>
                      <input
                        id="websiteUrl"
                        type="text"
                        placeholder="Enter Website URL"
                        value={newWebsite.url}
                        onChange={(e) =>
                          setNewWebsite({ ...newWebsite, url: e.target.value })
                        }
                        className={styles.inputField}
                        onFocus={handleFocus}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        value={newWebsite.category}
                        onChange={(e) =>
                          setNewWebsite({
                            ...newWebsite,
                            category: e.target.value,
                          })
                        }
                        className={styles.selectField}
                        onFocus={handleFocus}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="minimumCoins">Minimum Coins</label>
                      <input
                        id="minimumCoins"
                        type="number"
                        placeholder="Enter Minimum Coins"
                        value={newWebsite.minimumCoins}
                        className={styles.inputField}
                        onChange={(e) =>
                          setNewWebsite({
                            ...newWebsite,
                            minimumCoins: e.target.value,
                          })
                        }
                        onFocus={handleFocus}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="websiteLogo">Website Logo</label>
                      <div className={styles.fileUploadContainer}>
                        <FileUpload
                          mode="basic"
                          name="image"
                          url="/api/upload"
                          accept="image/*"
                          maxFileSize={1000000}
                          onSelect={onFileSelect}
                          onFocus={handleFocus}
                          className={styles.fileUpload}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="websiteDescription">Caption / Description</label>
                      <textarea
                        id="websiteDescription"
                        placeholder="Enter website caption..."
                        value={newWebsite.description}
                        onChange={(e) =>
                          setNewWebsite({
                            ...newWebsite,
                            description: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        onFocus={handleFocus}
                        rows="3"
                        style={{ resize: "vertical" }}
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className={styles.error}>{errorMessage}</p>
                  )}

                  <div className={styles.formActions}>
                    <button
                      onClick={handleAddWebsite}
                      disabled={isLoading}
                      className={styles.submitButton}
                    >
                      {isLoading ? "Adding..." : "Add Website"}
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Website Modal */}
        {showEditModal && editingWebsite && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 style={{ margin: 0 }}>Edit Website</h2>
                <button onClick={closeEditModal} className={styles.closeButton}>
                  <i className="pi pi-times"></i>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formContainer}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editWebsite">Website Name</label>
                      <input
                        id="editWebsite"
                        type="text"
                        placeholder="Enter website name"
                        value={editingWebsite.website}
                        onChange={(e) =>
                          setEditingWebsite({
                            ...editingWebsite,
                            website: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        onFocus={() => setEditErrorMessage("")}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="editUrl">Website URL</label>
                      <input
                        id="editUrl"
                        type="text"
                        placeholder="Enter Website URL"
                        value={editingWebsite.url}
                        onChange={(e) =>
                          setEditingWebsite({
                            ...editingWebsite,
                            url: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        onFocus={() => setEditErrorMessage("")}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editCategory">Category</label>
                      <select
                        id="editCategory"
                        value={editingWebsite.category}
                        onChange={(e) =>
                          setEditingWebsite({
                            ...editingWebsite,
                            category: e.target.value,
                          })
                        }
                        className={styles.selectField}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="editMinimumCoins">Minimum Coins</label>
                      <input
                        id="editMinimumCoins"
                        type="number"
                        placeholder="Enter Minimum Coins"
                        value={editingWebsite.minimumCoins}
                        onChange={(e) =>
                          setEditingWebsite({
                            ...editingWebsite,
                            minimumCoins: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        onFocus={() => setEditErrorMessage("")}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editLogo">Update Logo (Optional)</label>
                      <div className={styles.fileUploadContainer}>
                        <FileUpload
                          mode="basic"
                          name="editLogo"
                          url="/api/upload"
                          accept="image/*"
                          maxFileSize={1000000}
                          onSelect={onEditFileSelect}
                          className={styles.fileUpload}
                        />
                        {editingWebsite.logo && (
                          <p className={styles.currentLogo}>
                            Current: {editingWebsite.logo.split("/").pop()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="editDescription">Caption / Description</label>
                      <textarea
                        id="editDescription"
                        placeholder="Enter website caption..."
                        value={editingWebsite.description || ""}
                        onChange={(e) =>
                          setEditingWebsite({
                            ...editingWebsite,
                            description: e.target.value,
                          })
                        }
                        className={styles.inputField}
                        rows="3"
                        style={{ resize: "vertical" }}
                      />
                    </div>
                  </div>
                  {editErrorMessage && (
                    <p className={styles.error}>{editErrorMessage}</p>
                  )}
                  <div className={styles.formActions}>
                    <button
                      onClick={handleEditWebsite}
                      disabled={isEditLoading}
                      className={styles.submitButton}
                    >
                      {isEditLoading ? "Updating..." : "Update Website"}
                    </button>
                    <button
                      onClick={closeEditModal}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 style={{ margin: 0 }}>Manage Categories</h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={styles.closeButton}
                >
                  <i className="pi pi-times"></i>
                </button>
              </div>
              <div className={styles.modalBody}>
                {/* Existing Categories Section */}
                <div className={styles.categorySection}>
                  <h3>Existing Categories</h3>
                  {categories.length === 0 ? (
                    <p>
                      No categories found. Add websites with categories to see
                      them here.
                    </p>
                  ) : (
                    <div className={styles.categoriesList}>
                      {categories.map((category) => (
                        <div key={category} className={styles.categoryItem}>
                          <div className={styles.categoryInfo}>
                            <strong>{category}</strong>
                          </div>
                          <button
                            onClick={() => handleRemoveCategory(category)}
                            className={styles.removeButton}
                            title="Remove Category from all websites"
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Category Section */}
                <div className={styles.addCategorySection}>
                  <h3>Add New Category</h3>
                  {isSuperAdmin && (
                    <div style={{ marginBottom: "12px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "var(--primary-color)",
                          marginBottom: "5px",
                          fontWeight: "600",
                        }}
                      >
                        Assign Category to Admin Master:
                      </label>
                      <select
                        value={newCategory.targetAdminId || ""}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            targetAdminId: e.target.value,
                          })
                        }
                        className={styles.selectField}
                        style={{ width: "100%", marginBottom: "10px" }}
                      >
                        <option value="">Self (Superadmin)</option>
                        {subAdmins.map((sa) => (
                          <option key={sa.id} value={sa.id}>
                            {sa.username} {sa.name ? `(${sa.name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ name: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddCategory();
                      }
                    }}
                    className={styles.inputField}
                    onFocus={handleFocus}
                  />
                  <button
                    onClick={handleAddCategory}
                    className={styles.addCategoryButton}
                    disabled={isCategoryLoading}
                  >
                    {isCategoryLoading ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Popup */}
        {showDepositPopup && (
          <DepositPopup
            onClose={() => setShowDepositPopup(false)}
            walletBalance={user?.balance || 0}
          />
        )}

        <Toast ref={toast} />
      </div>
    </div>
  );
};

export default Websites;
