import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
/**
 * Main container for LinguaTune: integrates language selection,
 * music director (artist) listing based on language, and song playback using the Deezer API.
 * UI aligns to light theme with custom palette.
 */
const LANGUAGES = [
  { label: "Hindi", code: "hi", deezerGenreId: "542" },
  { label: "English", code: "en", deezerGenreId: "132" },
  { label: "French", code: "fr", deezerGenreId: "16" },
  { label: "Spanish", code: "es", deezerGenreId: "197" },
  { label: "German", code: "de", deezerGenreId: "84" },
];

/**
 * Returns Deezer genreId relevant for language code.
 */
// PUBLIC_INTERFACE
function getGenreIdForLanguage(languageCode) {
  const entry = LANGUAGES.find(l => l.code === languageCode);
  return entry ? entry.deezerGenreId : null;
}

// PUBLIC_INTERFACE
function LinguaTuneContainer() {
  // State for language selection, list of artists, selected artist, their tracks, and what to play
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);
  const [directors, setDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Colors as per UI design requirements
  const palette = {
    primary: '#fba2f8',
    secondary: '#fdfcfc',
    accent: '#121212',
    // For hover/focus, you may slightly adjust:
    accentShadow: '#fba2f8AA'
  };

  // Fetch artists for selected language (by Deezer Genre API: /genre/{genre_id}/artists)
  useEffect(() => {
    async function fetchDirectors() {
      setLoadingArtists(true);
      setDirectors([]);
      setSelectedDirector(null);
      setSongs([]);
      setPlayingTrack(null);
      const genreId = getGenreIdForLanguage(selectedLanguage);
      if (!genreId) return setLoadingArtists(false);
      try {
        const url = `https://api.deezer.com/genre/${genreId}/artists&output=jsonp`; // &output=jsonp required for CORS unless via proxy
        // Use cors-anywhere proxy for browser demo; remove in real app with own backend in production
        const resp = await fetch(
          `https://corsproxy.io/?${encodeURIComponent("https://api.deezer.com/genre/" + genreId + "/artists")}`
        );
        const data = await resp.json(); // returns: { data: [ { id, name, ... } ] }
        setDirectors(data.data || []);
      } catch (err) {
        setDirectors([]);
      } finally {
        setLoadingArtists(false);
      }
    }
    fetchDirectors();
  }, [selectedLanguage]);

  // Fetch tracks for selected music director (artist)
  const handleDirectorClick = (director) => {
    setSelectedDirector(director);
    setSongs([]);
    setPlayingTrack(null);
    setLoadingSongs(true);
    // Deezer API: /artist/{artist_id}/top
    fetch(
      `https://corsproxy.io/?${encodeURIComponent("https://api.deezer.com/artist/" + director.id + "/top?limit=10")}`
    )
      .then(resp => resp.json())
      .then(data => {
        setSongs(data.data || []);
      })
      .catch(() => setSongs([]))
      .finally(() => setLoadingSongs(false));
  };

  // Handle language dropdown changes
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Song selection/playback
  const playSong = (song) => {
    setPlayingTrack(song);
  };

  /** --- UI Styles --- */
  const styles = {
    wrapper: {
      minHeight: '100vh',
      background: palette.secondary,
      color: palette.accent,
      fontFamily: "'Inter', 'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      padding: '22px 0 8px 0',
      background: palette.primary,
      color: palette.accent,
      fontWeight: 700,
      fontSize: '1.5em',
      textAlign: 'center',
      letterSpacing: '1px'
    },
    languageDropdown: {
      background: '#fff',
      color: palette.accent,
      fontSize: '1.07em',
      border: `2px solid ${palette.primary}`,
      borderRadius: '8px',
      margin: '20px 0 30px 0',
      padding: '10px',
      boxShadow: `0 2px 4px ${palette.accentShadow}`,
    },
    directorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: '18px',
      margin: '12px 0 34px 0',
    },
    directorCard: (isSelected) => ({
      background: isSelected ? palette.primary : '#fff',
      color: isSelected ? palette.accent : palette.accent,
      border: `2px solid ${palette.primary}`,
      borderRadius: '16px',
      padding: '24px 10px 12px 10px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background 0.16s',
      boxShadow: isSelected ? `0 4px 16px ${palette.accentShadow}` : 'none',
      fontWeight: 500,
      minHeight: 90,
      position: 'relative'
    }),
    songsWrapper: {
      background: '#f7e6f9',
      borderRadius: '9px',
      padding: "18px",
      margin: "10px 0 36px 0",
    },
    songRow: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderLeft: isActive ? `4px solid ${palette.primary}` : 'none',
      color: palette.accent,
      background: isActive ? '#fff3f9' : 'transparent',
      fontWeight: isActive ? 600 : 400,
    }),
    playerBar: {
      background: palette.accent,
      color: palette.secondary,
      padding: '11px 16px',
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
      boxShadow: '0 -2px 12px #0002'
    }
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        LinguaTune 🎵<span style={{ fontWeight: 400, fontSize: '16px', marginLeft: 12, color: palette.accent }}>Discover music by language</span>
      </header>
      <div className="container" style={{ maxWidth: 950, margin: '0 auto', padding: '32px 16px 40px 16px', flex: 1 }}>
        {/* Language Selector */}
        <div>
          <label style={{ fontWeight: 600, marginRight: 12 }} htmlFor="language-select">Choose Language:</label>
          <select
            id="language-select"
            value={selectedLanguage}
            style={styles.languageDropdown}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map(lang =>
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            )}
          </select>
        </div>
        {/* Music Directors list */}
        <div style={{ marginTop: '14px', marginBottom: '6px', fontSize: '1.18em', fontWeight: 600 }}>
          {loadingArtists && <span>Loading directors...</span>}
          {!loadingArtists && <>
            Directors (Artists) for <span style={{ color: palette.primary }}>{LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'language'}</span>:
          </>}
        </div>
        <div style={styles.directorGrid}>
          {directors.map(dir =>
            <div
              key={dir.id}
              style={styles.directorCard(selectedDirector && dir.id === selectedDirector.id)}
              onClick={() => handleDirectorClick(dir)}
            >
              <img src={dir.picture_medium || dir.picture || ""} alt={dir.name} style={{ borderRadius: '50%', width: 70, height: 70, marginBottom: 6, border: `2px solid ${palette.primary}` }} />
              <div>{dir.name}</div>
            </div>
          )}
        </div>
        {/* Songs for selected director */}
        {selectedDirector &&
          <div style={styles.songsWrapper}>
            <div style={{ fontWeight: 600, fontSize: '1.12em', marginBottom: 10 }}>
              Top Songs by {selectedDirector.name}:
            </div>
            {loadingSongs && <div>Loading songs...</div>}
            {!loadingSongs && songs.length === 0 && <div>No songs found.</div>}
            {!loadingSongs && songs.length > 0 &&
              <div>
                {songs.map(song =>
                  <div
                    key={song.id}
                    style={styles.songRow(playingTrack && playingTrack.id === song.id)}
                  >
                    <span>{song.title}</span>
                    <button
                      style={{
                        background: palette.primary,
                        color: palette.accent,
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginLeft: 12
                      }}
                      onClick={() => playSong(song)}
                    >{playingTrack && playingTrack.id === song.id ? "Playing" : "Play"}</button>
                  </div>
                )}
              </div>
            }
          </div>
        }
      </div>
      {/* Player Bar (fixed at bottom) */}
      {playingTrack &&
        <div style={styles.playerBar}>
          <img src={playingTrack.album?.cover_small} alt={playingTrack.title} style={{ borderRadius: 7, width: 46, height: 46 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.01em' }}>{playingTrack.title}</div>
            <div style={{ fontWeight: 400, fontSize: '0.93em', opacity: 0.8 }}>{playingTrack.artist?.name}</div>
          </div>
          <audio src={playingTrack.preview} controls autoPlay style={{ flexGrow: 1 }} preload="none">
            Your browser does not support the audio element.
          </audio>
          <a href={playingTrack.link} target="_blank" rel="noopener noreferrer" style={{
            color: palette.primary, textDecoration: "none", marginLeft: 18, fontSize: 15, fontWeight: 600
          }}>View on Deezer</a>
        </div>
      }
      {/* Spacer for player bar */}
      <div style={{ height: playingTrack ? 75 : 0 }}></div>
    </div>
  );
}

export default LinguaTuneContainer;
