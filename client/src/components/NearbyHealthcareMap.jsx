import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './Icon';
import { useTheme } from '../contexts/ThemeContext';

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946, label: 'Bangalore, India' };

export default function NearbyHealthcareMap({ onSelectProvider }) {
  const { theme } = useTheme();

  const [currentCoords, setCurrentCoords] = useState(DEFAULT_CENTER);
  const [locationName, setLocationName] = useState(DEFAULT_CENTER.label);
  const [radius, setRadius] = useState(5000); // 5km
  const [facilityType, setFacilityType] = useState('all');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split' (map+list) or 'list' (list only)
  const [locationError, setLocationError] = useState('');
  const [dataSourceNotice, setDataSourceNotice] = useState('OpenStreetMap Community Directory (ODbL)');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch facilities when coords, radius, or facilityType change
  useEffect(() => {
    let isCancelled = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchFacilities = async () => {
      setIsLoading(true);
      setLocationError('');
      try {
        const queryParams = new URLSearchParams({
          lat: currentCoords.lat.toString(),
          lng: currentCoords.lng.toString(),
          radius: radius.toString(),
          type: facilityType
        });

        const res = await fetch(`/api/places/nearby?${queryParams.toString()}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        if (!isCancelled && data.facilities) {
          setFacilities(data.facilities);
          if (data.source) setDataSourceNotice(data.source);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!isCancelled) {
          console.warn('Facility lookup error:', err);
          setLocationError('Unable to load live healthcare nodes from OpenStreetMap. Please verify your connection.');
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchFacilities();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentCoords, radius, facilityType]);

  // Invalidate map size whenever viewMode changes or container resizes
  const triggerMapResize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'split' && mapInstanceRef.current) {
      // Invalidate immediately, then after transition finishes
      mapInstanceRef.current.invalidateSize();
      const t1 = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      const t2 = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [viewMode]);

  // Leaflet Map Initialization & Sync
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: radius > 8000 ? 12 : 13,
        zoomControl: true
      });

      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      window.L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

      markersLayerRef.current = window.L.featureGroup().addTo(map);
      mapInstanceRef.current = map;

      // Observe size changes
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        ro.observe(mapContainerRef.current);
      }
    } else {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], radius > 8000 ? 12 : 13);
      mapInstanceRef.current.invalidateSize();
    }

    // Refresh markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // Current location marker (Center)
      const centerIcon = window.L.divIcon({
        className: 'user-location-pin',
        html: `<div style="width: 18px; height: 18px; border-radius: 50%; background: #D96F89; border: 3px solid #FFF8F3; box-shadow: 0 0 10px rgba(217, 111, 137, 0.9);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      userMarkerRef.current = window.L.marker([currentCoords.lat, currentCoords.lng], { icon: centerIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`<strong>Selected Search Center</strong><br/>${locationName}`);

      // Facility markers
      facilities.forEach((fac) => {
        let iconEmoji = '🏥';
        let pinColor = '#702B4C';
        if (fac.type === 'clinic') {
          iconEmoji = '🩺';
          pinColor = '#D96F89';
        } else if (fac.type === 'pharmacy') {
          iconEmoji = '💊';
          pinColor = '#4F725D';
        } else if (fac.type === 'doctors') {
          iconEmoji = '👩‍⚕️';
          pinColor = '#D96F89';
        }

        const customPin = window.L.divIcon({
          className: 'facility-pin',
          html: `
            <div style="background: ${pinColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: 2px solid white; cursor: pointer;">
              ${iconEmoji}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = window.L.marker([fac.latitude, fac.longitude], { icon: customPin });

        const ratingHtml = fac.rating && typeof fac.rating === 'number' && fac.rating > 0
          ? `<div style="font-size: 11px; color: #E59866; font-weight: 700; margin-bottom: 6px;">★ ${fac.rating.toFixed(1)}${fac.reviewCount ? ` (${fac.reviewCount} reviews)` : ''}</div>`
          : '';

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 210px; padding: 4px;">
            <div style="font-weight: 700; color: #702B4C; font-size: 14px; margin-bottom: 3px;">${fac.name}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #D96F89; font-weight: 700; margin-bottom: 6px;">${fac.type} • ${fac.distanceKm} km away</div>
            <div style="font-size: 12px; color: #444; margin-bottom: 6px; line-height: 1.35;">${fac.address}</div>
            ${fac.phone ? `<div style="font-size: 12px; margin-bottom: 6px;">📞 <a href="tel:${fac.phone}" style="color: #4F725D; font-weight: 600;">${fac.phone}</a></div>` : ''}
            ${ratingHtml}
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; background: #D96F89; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-weight: 600;">Get Directions →</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedFacility(fac));
        marker.addTo(markersLayerRef.current);
      });
    }
  }, [facilities, currentCoords, radius, locationName]);

  // Request browser GPS position
  const handleLocateMe = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude, label: 'Your Current GPS Location' });
        setLocationName('Your Current GPS Location');
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        console.warn('Geolocation error:', err);
        setLocationError('GPS permission was denied or unavailable. Please search for your city or area below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search locality / postal code / city
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setLocationError('');
    try {
      const res = await fetch(`/api/places/geocode?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setLocationError(`No locations found matching "${searchQuery}". Please check spelling.`);
      }
    } catch (err) {
      setLocationError('Geocoding service unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res) => {
    setCurrentCoords({ lat: res.lat, lng: res.lng, label: res.displayName });
    setLocationName(res.displayName.split(',')[0]);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="nearby-healthcare-component" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Search & Filter Bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-burgundy)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="map-pin" size={20} color="var(--color-rose)" /> Verified Nearby Healthcare Facilities
            </h2>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              OpenStreetMap Community Directory • Showing <strong>{facilities.length}</strong> facilities near <strong>{locationName}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleLocateMe}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
            >
              <Icon name="navigation" size={14} /> Locate Me (GPS)
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode((prev) => (prev === 'split' ? 'list' : 'split'));
                setTimeout(triggerMapResize, 50);
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
            >
              {viewMode === 'split' ? '📋 List Only' : '🗺️ Map & List'}
            </button>
          </div>
        </div>

        {locationError && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(217, 111, 137, 0.12)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-rose)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{locationError}</span>
          </div>
        )}

        {/* Search Input Container with High Z-Index Dropdown */}
        <div ref={searchContainerRef} style={{ position: 'relative', marginBottom: '1rem', zIndex: 1100 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, locality, or postal code (e.g. Indiranagar, Bandra, Connaught Place)..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-card)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Icon name="search" size={16} />
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSearching}
              style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Autocomplete Suggestions with Clear Solid Background & High Z-Index */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 1200,
              background: 'var(--bg-card)',
              border: '1.5px solid var(--color-primary-rose)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(r)}
                  style={{
                    padding: '0.75rem 1.1rem',
                    borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-accent-soft)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ color: 'var(--color-primary-rose)' }}>📍</span>
                  <span>{r.displayName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Tabs & Radius Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Facility Type Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Places' },
              { id: 'hospital', label: '🏥 Hospitals' },
              { id: 'clinic', label: '🩺 Clinics' },
              { id: 'pharmacy', label: '💊 Pharmacies' },
              { id: 'doctors', label: '👩‍⚕️ Doctors' }
            ].map((tab) => {
              const active = facilityType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFacilityType(tab.id)}
                  className={`filter-pill-btn ${active ? 'active' : ''}`}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: active ? '1.5px solid var(--control-active-border)' : '1px solid var(--border-card)',
                    background: active ? 'var(--control-active-bg)' : 'transparent',
                    color: active ? 'var(--control-active-text)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Radius selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-card)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={15000}>15 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Container: Map Canvas + Facility Results Column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'split' ? 'minmax(320px, 1.25fr) minmax(280px, 1fr)' : '1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Leaflet Map Canvas - Kept mounted in DOM to prevent re-instantiation and tile refetch */}
        <div
          className="card"
          style={{
            display: viewMode === 'split' ? 'block' : 'none',
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            height: '540px'
          }}
        >
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              filter: theme === 'dark' ? 'brightness(0.85) invert(1) contrast(1.1) hue-rotate(180deg)' : 'none'
            }}
          />

          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 1000,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-card)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }}></div>
              <span>Searching nearby healthcare...</span>
            </div>
          )}
        </div>

        {/* Facilities Results Scrollable Column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: viewMode === 'split' ? '540px' : 'none',
          overflowY: 'auto'
        }}>
          {facilities.length === 0 && !isLoading && (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon name="map-pin" size={32} color="var(--color-rose)" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                No facilities indexed within {radius / 1000} km
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                Try increasing the search radius to 10 km or 15 km, or search for another city/locality.
              </p>
            </div>
          )}

          {facilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            const hasGenuineRating = fac.rating && typeof fac.rating === 'number' && fac.rating > 0;

            return (
              <div
                key={fac.id}
                className="card card-hover"
                onClick={() => setSelectedFacility(fac)}
                style={{
                  padding: '1.25rem',
                  border: isSelected ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                  background: isSelected ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', margin: 0, fontWeight: 700 }}>
                      {fac.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span className="badge badge-sage" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                        {fac.type}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-rose)', fontWeight: 600 }}>
                        {fac.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  {/* Genuine Rating displayed ONLY when present; completely omitted if not available */}
                  {hasGenuineRating && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#E59866',
                      fontWeight: 700,
                      background: 'rgba(229, 152, 102, 0.12)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ★ {fac.rating.toFixed(1)}
                      {fac.reviewCount ? ` (${fac.reviewCount})` : ''}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  📍 {fac.address}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  marginTop: '0.2rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {fac.phone ? (
                    <a
                      href={`tel:${fac.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--text-sage)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                    >
                      <Icon name="phone" size={13} /> {fac.phone}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Phone unlisted</span>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {onSelectProvider && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProvider(fac);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        Book Visit
                      </button>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      Directions →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attribution footer */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <span>Source: {dataSourceNotice}</span>
        <span>Coordinates: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
      </div>
    </div>
  );
}
