import React, { useState, useEffect } from "react";
import styles from "./id.module.css";
import TopNavbar from "../Navbar/TopNavbar";
import MyIds from "./MyId";
import CreateId from "./CreateId";
import LoginPopup from '../Login/LoginPopup';
import { useUser } from "../../context/UserContext";

const Id = () => {
  const { user } = useUser(); // Access the user from context
  const [activeSection, setActiveSection] = useState("myIds");
  const [myIds, setMyIds] = useState([]);
  const [newIdInputs, setNewIdInputs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

  const websites = ["Google", "Facebook", "Twitter", "LinkedIn", "Instagram"];

  // Check if user exists on component mount
  useEffect(() => {
    if (!user) {
      setIsModalOpen(true); // Open modal if no user exists
    }
  }, [user]); // Only runs when user state changes

  const handleInputChange = (event, website) => {
    setNewIdInputs({
      ...newIdInputs,
      [website]: event.target.value,
    });
  };

  const createId = (website) => {
    if (newIdInputs[website]) {
      setMyIds((prev) => [...prev, { website, id: newIdInputs[website] }]);
      setNewIdInputs((prev) => ({ ...prev, [website]: "" }));
    } else {
      alert(`Please enter an ID for ${website}`);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={styles.pageContainer}>
      {/* Fixed Top Navbar */}
      <TopNavbar />

      {/* Tabs */}
      <div className={styles.bottomNavbar}>
        <button
          onClick={() => setActiveSection("myIds")}
          className={`${styles.navButton} ${activeSection === "myIds" ? styles.navButtonActive : ""}`}
        >
          My IDs
        </button>
        <div className={styles.centerDivider}></div>
        <button
          onClick={() => setActiveSection("createId")}
          className={`${styles.navButton} ${activeSection === "createId" ? styles.navButtonActive : ""}`}
        >
          Create ID
        </button>
      </div>

      {/* Scrollable Content */}
      <div className={styles.content}>
        {activeSection === "myIds" ? (
          <MyIds myIds={myIds} />
        ) : (
          <CreateId
            websites={websites}
            newIdInputs={newIdInputs}
            handleInputChange={handleInputChange}
            createId={createId}
          />
        )}
      </div>

      {/* Login Popup Modal */}
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
    </div>
  );
};

export default Id;
