import { useState, useEffect, useRef, useCallback } from "react";
import { Carousel as FlowbiteCarousel } from 'flowbite-react';
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/lara-dark-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";
import styles from "./ImageCarousel.module.css";

// Import react-slick for multi-item carousels
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrevArrow = ({ onClick }) => {
  return (
    <div className={`${styles.customArrow} ${styles.customPrevArrow}`} onClick={onClick}>
      <i className="fa fa-chevron-left"></i>
    </div>
  );
};

// Capture-phase delete button to bypass carousel event stealing
const DeleteButton = ({ onDelete, className, title, style }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleEvent = (e) => {
      // Log all captured events to debug interaction
      console.log("DeleteButton CAPTURE event:", e.type);
      
      e.stopPropagation();
      if (e.type === 'click') {
        e.preventDefault();
        console.log("Capture phase delete clicked - triggering onDelete");
        onDelete();
      }
    };

    // Add capture phase listeners for all relevant events
    const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
    events.forEach(event => {
      element.addEventListener(event, handleEvent, { capture: true });
    });

    return () => {
      events.forEach(event => {
        element.removeEventListener(event, handleEvent, { capture: true });
      });
    };
  }, [onDelete]);

  return (
    <div
      ref={elementRef}
      role="button"
      className={className}
      title={title}
      style={style}
      onMouseEnter={() => console.log("DeleteButton MouseEnter")}
      onMouseLeave={() => console.log("DeleteButton MouseLeave")}
    >
      <i className="fa fa-trash"></i>
    </div>
  );
};

const ImageCarousel = ({ type, carouselId, canManage = false }) => {
  console.log(`ImageCarousel (${type}) - canManage:`, canManage);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef(null);
  const { url } = useUser();

  // Fetch images from the backend
  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try new endpoint first, fallback to old endpoints
      let response;
      try {
        response = await fetch(`${url}/api/images/get/${carouselId}`);
      } catch (newEndpointError) {
        // Fallback to old carousel endpoints based on carouselId
        const oldEndpoint = getOldEndpoint(carouselId);
        response = await fetch(`${url}/api/admin/get/${oldEndpoint}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load images',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, carouselId]);

  // Helper function to map new carouselId to old endpoints
  const getOldEndpoint = (carouselId) => {
    const endpointMap = {
      'horizontal-main': 'top-carousel',
      'square-main': 'middle-carousel'
    };
    return endpointMap[carouselId] || 'top-carousel';
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Function to handle file selection
  const onFileSelect = (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        
        if (selectedFile.size > 10000000) {
          throw new Error('File is too large. Max size is 10MB.');
        }
        
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        
        setSelectedFile(selectedFile);
        toast.current?.show({
          severity: 'success',
          summary: 'File Selected',
          detail: `${selectedFile.name} selected successfully`,
          life: 2000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'File Selection Failed',
        detail: error.message,
        life: 3000,
      });
      setSelectedFile(null);
    }
  };

  // Function to handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select an image file first.',
        life: 3000,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Show loading toast
      toast.current?.show({
        severity: 'info',
        summary: 'Uploading...',
        detail: 'Please wait while your image is being uploaded.',
        life: 2000,
      });

      // Try new endpoint first, fallback to old endpoints
      let response;
      let uploadEndpoint;
      
      try {
        formData.append('type', type);
        formData.append('carouselId', carouselId);
        uploadEndpoint = `${url}/api/images/upload`;
        response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });
      } catch (newEndpointError) {
        // Fallback to old carousel upload endpoints
        const oldEndpoint = getOldUploadEndpoint(carouselId);
        uploadEndpoint = `${url}/api/admin/upload/${oldEndpoint}`;
        response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Refresh images from server to ensure consistency
      await fetchImages();
      setSelectedFile(null);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Upload Successful',
        detail: `${selectedFile.name} uploaded successfully`,
        life: 3000,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error.message || 'Failed to upload image. Please try again.',
        life: 4000,
      });
    }
  };

  // Helper function to map new carouselId to old upload endpoints
  const getOldUploadEndpoint = (carouselId) => {
    const endpointMap = {
      'horizontal-main': 'top-carousel',
      'square-main': 'middle-carousel'
    };
    return endpointMap[carouselId] || 'top-carousel';
  };

  // Function to handle deletion
  const handleDelete = async (imageId) => {
    console.log("handleDelete called for imageId:", imageId);
    try {
      // Show confirmation toast
      toast.current?.show({
        severity: 'info',
        summary: 'Deleting...',
        detail: 'Please wait while the image is being deleted.',
        life: 2000,
      });

      // Try new endpoint first, fallback to old endpoints
      let response;
      let deleteEndpoint;
      
      try {
        deleteEndpoint = `${url}/api/images/delete/${imageId}`;
        console.log("Attempting delete at:", deleteEndpoint);
        response = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            carouselId,
            type
          }),
        });
      } catch (newEndpointError) {
        console.log("New endpoint failed, trying fallback...");
        // Fallback to old carousel delete endpoints
        const oldEndpoint = getOldDeleteEndpoint(carouselId);
        deleteEndpoint = `${url}/api/admin/delete-one/${oldEndpoint}`;
        console.log("Attempting fallback delete at:", deleteEndpoint);
        response = await fetch(deleteEndpoint, {
          method: 'DELETE',
        });
      }

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Remove the image from local state immediately for better UX
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));

      toast.current?.show({
        severity: 'success',
        summary: 'Delete Successful',
        detail: 'Image deleted successfully',
        life: 3000,
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Delete Failed',
        detail: error.message || 'Failed to delete image. Please try again.',
        life: 4000,
      });
      
      // Refresh images in case of error to ensure consistency
      fetchImages();
    }
  };

  // Helper function to map new carouselId to old delete endpoints
  const getOldDeleteEndpoint = (carouselId) => {
    const endpointMap = {
      'horizontal-main': 'topcarousel',
      'square-main': 'middlecarousel'
    };
    return endpointMap[carouselId] || 'topcarousel';
  };

  const getCarouselClass = () => {
    return type === 'horizontal' ? styles.horizontalCarousel : styles.squareCarousel;
  };

  const getImageClass = () => {
    return type === 'horizontal' ? styles.horizontalImage : styles.squareImage;
  };


  // Slick carousel settings for square cards - dynamically adjust based on image count
  const getSlickSettings = () => {
    const imageCount = images.length;
    
    // If only one image, don't use carousel
    if (imageCount <= 1) {
      return {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        arrows: false,
        pauseOnHover: false
      };
    }
    
    // For multiple images, use responsive settings
    return {
      dots: true,
      infinite: imageCount > 4, // Only infinite if more than 4 images
      speed: 500,
      slidesToShow: Math.min(4, imageCount), // Don't show more slides than available
      slidesToScroll: 1,
      autoplay: imageCount > 1,
      autoplaySpeed: 3000,
      arrows: imageCount > 1,
      pauseOnHover: true,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: Math.min(3, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 3,
            dots: true,
            arrows: imageCount > 3
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: Math.min(3, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 3,
            dots: true,
            arrows: imageCount > 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(2, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 2,
            dots: true,
            arrows: imageCount > 2
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: Math.min(3, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 3,
            dots: true,
            arrows: imageCount > 3
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: Math.min(2, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 2,
            dots: true,
            arrows: imageCount > 2
          }
        },
        {
          breakpoint: 360,
          settings: {
            slidesToShow: Math.min(2, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 2,
            dots: true,
            arrows: false
          }
        },
        {
          breakpoint: 320,
          settings: {
            slidesToShow: Math.min(2, imageCount),
            slidesToScroll: 1,
            infinite: imageCount > 2,
            dots: true,
            arrows: false
          }
        }
      ]
    };
  };

  return (
    <div className={getCarouselClass()}>
      {/* Toast component for displaying messages */}
      <Toast ref={toast} />



      {canManage && (
        <div className={styles.uploadControlsWrapper}>
          <h3 className={styles.uploadTitle}>
            <i className="fa fa-cog mr-2"></i> Manage {type === 'horizontal' ? 'Horizontal' : 'Square'} Carousel
          </h3>
          <div className={styles.uploadControls}>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
                id={`file-upload-${carouselId}`}
              />
              <label
                htmlFor={`file-upload-${carouselId}`}
                className={styles.uploadButton}
              >
                <i className="fa fa-image mr-2"></i> Choose Image
              </label>
            </div>
            
            {selectedFile && (
              <div className={styles.selectedFile}>
                Selected: {selectedFile.name}
              </div>
            )}
            
            <button
              onClick={handleUpload}
              className={styles.uploadSubmitButton}
              disabled={!selectedFile}
              style={{
                opacity: selectedFile ? 1 : 0.6,
                cursor: selectedFile ? 'pointer' : 'not-allowed'
              }}
            >
              <i className="fa fa-upload mr-2"></i> Upload Image
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading images...</p>
        </div>
      )}

      {/* Carousel component */}
      {!isLoading && images.length > 0 ? (
        <div className={styles.carouselContainer}>
          {type === 'horizontal' ? (
            <FlowbiteCarousel>
              {images.map((image, index) => (
                <div key={image.id} className={styles.imageContainer}>
                  <img
                    src={getImageUrl(image.imagePath, url)}
                    alt={`${type} carousel ${index + 1}`}
                    className={getImageClass()}
                    onError={(e) => {
                      console.error(`Error loading image: ${url}/${image.imagePath}`);
                      e.target.style.display = 'none'; // Hide broken image
                    }}
                  />
                  {/* {canManage && ( */}
                    <DeleteButton
                      onDelete={() => handleDelete(image.id)}
                      className={styles.deleteButton}
                      title="Delete image"
                      style={{ zIndex: 100, pointerEvents: 'auto', cursor: 'pointer' }}
                    />
                  {/* )} */}
                </div>
              ))}
            </FlowbiteCarousel>
          ) : (
            <Slider {...getSlickSettings()}>
              {images.map((image, index) => (
                <div key={image.id} className={styles.squareCardWrapper}>
                  <div className={styles.squareCardContainer}>
                    <img
                      src={getImageUrl(image.imagePath, url)}
                      alt={`${type} carousel ${index + 1}`}
                      className={styles.squareCardImage}
                      onError={(e) => {
                        console.error(`Error loading square image: ${url}/${image.imagePath}`);
                        e.target.style.display = 'none'; // Hide broken image
                      }}
                    />
                    {canManage && (
                      <button
                        onClick={() => handleDelete(image.id)}
                        className={styles.squareDeleteButton}
                        title="Delete image"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      ) : !isLoading ? (
        <div className={styles.noImagesContainer}>
          <p className={styles.noImagesText}>No images available</p>
        </div>
      ) : null}
    </div>
  );
};

export default ImageCarousel;
