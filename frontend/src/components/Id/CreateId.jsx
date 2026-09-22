import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaMoneyBillWave, FaCoins } from "react-icons/fa";
import { PulseLoader } from "react-spinners";

import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";
import styles from "./CreateId.module.css";

import "primereact/resources/themes/lara-dark-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// ... (existing code)

import DepositPopup from "../Navbar/DepositPopup";

const CreateId = () => {
  const { user, setUser, url } = useUser();
  const toast = useRef(null); // Add a reference for Toast

  //  new Website Modal State
  const [newWebsite, setNewWebsite] = useState({
    id: "",
    website: "",
    url: "",
    logo: "",
    category: "",
    minimumCoins: "",
  });

  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]); // Categories from websites
  const [menuOpen, setMenuOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false); // State for Add Website modal
  const [file, setFile] = useState(null); // State to store the selected file

  const [searchQuery, setSearchQuery] = useState(""); // Search bar state
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 websites per page

  // Deposit popup state
  const [showDepositPopup, setShowDepositPopup] = useState(false);

  // Function to fetch websites data
  const fetchWebsites = async () => {
    try {
      const userId = user?.id || user?._id || "";
      const response = await fetch(
        `${url}/api/admin/get-websites${userId ? `?userId=${userId}` : ""}`,
      );
      const data = await response.json();
      if (response.ok) {
        // Map over data to add a fallback description for older websites that don't have one yet
        const enhancedData = data.map(site => ({
          ...site,
          description: site.description || "The premium exchange for live sports and casino."
        }));
        setWebsites(enhancedData);
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
      const response = await fetch(`${url}/api/admin/get-all-categories`);
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

  // Fetch data when the component loads
  useEffect(() => {
    fetchWebsites();
    fetchCategories();
  }, []);

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
        "All fields are required to add a website, including the logo and minimum coins."
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

      const response = await fetch(`${url}/api/admin/add-website`, {
        method: "POST",
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
        });
        setFile(null);
        fetchWebsites(); // Re-fetch the data after adding a new website
        fetchCategories(); // Also refresh categories
        // console.log("Website added successfully:");
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
    // Find the website by its unique ID, instead of using the index
    const website = websites.find((item) => item.id === id);

    setSelectedWebsite(website);
    setMenuOpen(null); // Close the menu
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsername(""); // Reset username
    setErrorMessage(""); // Reset error message
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  const filteredWebsites = (websites || []).filter((item) => {
    // Matches search query for website name or URL
    const websiteName = item.name || item.website || "";
    const matchesSearchQuery =
      websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.url &&
        item.url.toLowerCase().includes(searchQuery.toLowerCase()));

    // Matches the selected category
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;

    return matchesSearchQuery && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWebsites = filteredWebsites.slice(startIndex, endIndex);

  // Reset to first page when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  const handleSubmit = async () => {
    console.log("handleSubmit called");
    if (!user) {
      console.log("Validation failed: User not logged in");
      setErrorMessage("User must be logged in to create an ID.");
      return;
    }

    if (!username.trim()) {
      console.log("Validation failed: Username required");
      setErrorMessage("Username is required.");
      return;
    }

    const { websiteName, websiteUrl, imgUrl } = {
      websiteName: selectedWebsite.website,
      websiteUrl: selectedWebsite.url,
      imgUrl: selectedWebsite.logo,
    };

    try {
      setIsLoading(true);
      console.log("Sending create-id-request with body:", {
        websiteName,
        websiteUrl,
        username,
        imgUrl,
        createdBy: user.username,
        status: "Pending",
      });

      const response = await fetch(`${url}/api/user/create-id-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteName,
          websiteUrl,
          username,
          imgUrl,
          createdBy: user.id,
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "ID Request Created",
          detail:
            "Your ID creation request has been submitted and is pending admin approval.",
          life: 3000,
        });
        setShowModal(false);
      } else {
        console.error("Error creating ID request:", data);
        setErrorMessage(data.message || "An error occurred.");
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
      // Replace with your API endpoint
      const response = await fetch(
        `${url}/api/admin/delete-website/${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        fetchWebsites();
        fetchCategories(); // Also refresh categories
        toast.current.show({
          severity: "error",
          summary: "Website deleted",
          detail: "Website deleted successfully:",
          life: 1000,
        });
        // console.log('Item deleted successfully');
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
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

      {/* <button
          className={styles.addWebsiteButton}
          onClick={() => setShowAddModal(true)}
          >
          Add Website
          </button> */}
      <div className={styles.searchSortWrapper}>
        <input
          type="text"
          placeholder="Search websites..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className={styles.categoryDropdown}
        >
          <option value="All Categories">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* Loader when data is fetching */}

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
        currentWebsites.map((item, index) => (
          <div key={item.id || index} className={styles.websiteCard}>
            <div className={styles.websiteInfo}>
              <img
                src={getImageUrl(item.logo, url)}
                alt={item.name || item.website || "Website Logo"}
                className={styles.websiteLogo}
              />
              <div className={styles.websiteDetails}>
                <h3>{item.name || item.website || "Unnamed Website"}</h3>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.websiteUrlLink}
                  >
                    {item.url}
                  </a>
                )}

                {item.description && (
                  <p className={styles.websiteDescriptionSmall}>
                    {item.description}
                  </p>
                )}


                <span className={styles.categoryTag}>
                  {item.category || "No Category"}
                </span>
                {item.minimumCoins && (
                  <p className={styles.coinInfo}>
                    <strong>Min Coins:</strong> {item.minimumCoins}
                  </p>
                )}
                {item.isActive !== undefined && (
                  <span
                    className={`${styles.statusTag} ${item.isActive ? styles.activeStatus : styles.inactiveStatus}`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
            </div>
            
            <div className={styles.websiteActions}>
              <button
                onClick={() => handleCreate(item.id)}
                className={styles.actionButton}
              >
                Create ID
              </button>
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
          {/* Previous Button */}
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((number, index) => (
            <button
              key={index}
              className={`${styles.paginationButton} ${
                number === currentPage ? styles.active : ""
              }`}
              onClick={() =>
                typeof number === "number" && setCurrentPage(number)
              }
              disabled={number === "..."}
            >
              {number}
            </button>
          ))}

          {/* Next Button */}
          <button
            className={styles.paginationButton}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            →
          </button>

          {/* Page Info */}
          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Modal Popup for Creating ID */}
      {showModal && selectedWebsite && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className={styles.closeButton}
            >
              ×
            </button>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <img
                src={getImageUrl(selectedWebsite.logo, url)}
                alt={`${selectedWebsite.website} logo`}
                className={styles.websiteLogo}
              />
              <h2>{selectedWebsite.website}</h2>
              <div className={styles.modalLinksGroup}>
                <a
                  href={selectedWebsite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  {selectedWebsite.url}
                </a>

              </div>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Coin Conversion Info */}
              <div className={styles.coinConversionInfo}>
                <div className={styles.coinInfoRow}>
                  <span className={styles.coinLabel}>Your Wallet Balance:</span>
                  <span className={styles.coinValue}>
                    ₹{(parseFloat(user?.balance) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              {/* Account Type field removed */}

              <div className={styles.modalActions}>
                <button
                  onClick={handleSubmit}
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create ID Request"}
                </button>
                <button
                  onClick={handleCloseModal}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          </div>
        </div>
      )}

      {/* {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2><strong>Add Website</strong></h2>
            <h4>Website name</h4>
            <input
              type="text"
              placeholder="Enter website name"
              value={newWebsite.website}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, website: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />
            <h4>Website URL</h4>
            <input
              type="text"
              placeholder="Enter Website URL"
              value={newWebsite.url}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, url: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />

            <h4>Category</h4>
            <input
              type="text"
              placeholder="Enter Category"
              value={newWebsite.category}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, category: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />
            <h4>Select Website Logo</h4>

             <div className={styles.uploadSection}>
              <FileUpload
                mode="basic"
                name="image" // Adjust this based on your backend's expected field name
                url="/api/upload"
                accept="image/*"
                maxFileSize={1000000}
                onSelect={onFileSelect}
                onFocus={handleFocus}

                />
              </div>
            
            <button
              onClick={handleAddWebsite}
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className={styles.closeButton}
            >
              Close
            </button>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          </div>
        </div>
      )} */}
      {/* Deposit Popup */}
      {showDepositPopup && (
        <DepositPopup
          onClose={() => setShowDepositPopup(false)}
          walletBalance={parseFloat(user?.balance) || 0}
        />
      )}

      <Toast ref={toast} />
    </div>
  );
};

export default CreateId;
