import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';
import styles from './HomeBannerCarousel.module.css';

/**
 * HomeBannerCarousel
 * canManage={true}  → Admin view: upload + delete controls
 * canManage={false} → User view: read-only sliding carousel
 */
const HomeBannerCarousel = ({ canManage = false }) => {
  const { url } = useUser();
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false); // Don't block render
  const [fetchError, setFetchError] = useState(false);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchImages = useCallback(async () => {
    try {
      setFetchError(false);
      const res = await fetch(`${url}/api/admin/home-banner`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setImages(data);
      setCurrent(0);
    } catch (e) {
      console.error('HomeBannerCarousel fetch error:', e);
      setFetchError(true);
    }
  }, [url]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // ── Auto-slide ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
  };
  const prev = () => goTo((current - 1 + images.length) % images.length);
  const next = () => goTo((current + 1) % images.length);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${url}/api/admin/home-banner`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      await fetchImages();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner image?')) return;
    try {
      const res = await fetch(`${url}/api/admin/home-banner/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchImages();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed. Please try again.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!canManage && images.length === 0) return null;

  return (
    <div className={styles.carouselSection}>
      {/* Admin header */}
      {canManage && (
        <div className={styles.adminHeader}>
          <h3 className={styles.adminTitle}>🖼️ Home Banner Images</h3>
          <button
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '+ Add Banner'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>
      )}

      {images.length === 0 ? (
        canManage ? (
          <div className={styles.emptyState}>
            {fetchError
              ? <p>⚠️ Could not load images. Restart the backend server, then refresh.</p>
              : <p>No banner images yet. Click <strong>"+ Add Banner"</strong> to add one.</p>
            }
          </div>
        ) : null
      ) : (
        <div className={styles.carouselWrapper}>
          {/* Slides */}
          <div className={styles.slidesContainer}>
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`${styles.slide} ${idx === current ? styles.active : ''}`}
              >
                <img
                  src={getImageUrl(img.imagePath, url)}
                  alt={`Banner ${idx + 1}`}
                  className={styles.slideImg}
                />
                {canManage && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(img.id)}
                    title="Delete this image"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Arrows (only when > 1 image) */}
          {images.length > 1 && (
            <>
              <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev}>&#8249;</button>
              <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next}>&#8250;</button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className={styles.dots}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.dot} ${idx === current ? styles.dotActive : ''}`}
                  onClick={() => goTo(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin grid view for management */}
      {canManage && images.length > 0 && (
        <div className={styles.adminGrid}>
          <p className={styles.adminGridLabel}>All banners ({images.length})</p>
          <div className={styles.gridRow}>
            {images.map((img, idx) => (
              <div key={img.id} className={styles.gridThumb}>
                <img src={getImageUrl(img.imagePath, url)} alt={`thumb ${idx + 1}`} />
                <button className={styles.gridDeleteBtn} onClick={() => handleDelete(img.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeBannerCarousel;
