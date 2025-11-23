import { useState } from 'react';
import { shlokaService } from '../services/shlokaService';
import './ShlokaSearch.css';

const ShlokaSearch = () => {
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [shlokaData, setShlokaData] = useState(null);
  const [error, setError] = useState('');
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!chapter || !verse) {
      setError('Please enter both chapter and verse number');
      return;
    }

    setLoading(true);
    setError('');
    setShlokaData(null);

    try {
      const response = await shlokaService.searchShloka(chapter, verse);
      
      // Log response for debugging
      console.log('API Response:', response);
      
      // Check different response structures
      if (response.success) {
        // Response structure: { success: true, message: "...", data: { data: {...} } }
        if (response.data && response.data.data) {
          setShlokaData(response.data.data);
          setCurrentChapter(parseInt(chapter));
          setCurrentVerse(parseInt(verse));
          setError('');
        } else if (response.data) {
          // If data is directly in response.data
          setShlokaData(response.data);
          setCurrentChapter(parseInt(chapter));
          setCurrentVerse(parseInt(verse));
          setError('');
        } else {
          setError(response.message || 'Failed to fetch shloka data');
        }
      } else {
        setError(response.message || 'Failed to fetch shloka');
      }
    } catch (err) {
      // Log error for debugging
      console.error('Error fetching shloka:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Verse not found. Please check the chapter and verse number.';
      
      if (err.response?.data) {
        // Try different error message fields
        errorMessage = err.response.data.detail || 
                      err.response.data.message || 
                      err.response.data.error ||
                      errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setShlokaData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatSanskrit = (sanskritArray) => {
    if (!sanskritArray || sanskritArray.length === 0) return '';
    // Get the first element and clean it up
    let text = sanskritArray[0];
    // Remove "Devanagari" prefix if present
    text = text.replace(/^Devanagari/, '').trim();
    return text;
  };

  const formatTransliteration = (transArray) => {
    if (!transArray || transArray.length === 0) return '';
    // Find the cleanest transliteration (usually the second one)
    for (let i = 1; i < transArray.length; i++) {
      const text = transArray[i];
      if (text && !text.includes('Synonyms') && !text.includes('Translation') && !text.includes('Purport')) {
        return text;
      }
    }
    return transArray[0] || '';
  };

  const handleNextVerse = async () => {
    if (currentChapter && currentVerse) {
      const nextVerse = currentVerse + 1;
      setChapter(currentChapter.toString());
      setVerse(nextVerse.toString());
      
      // Trigger search
      setLoading(true);
      setError('');
      setShlokaData(null);

      try {
        const response = await shlokaService.searchShloka(currentChapter.toString(), nextVerse.toString());
        
        if (response.success) {
          if (response.data && response.data.data) {
            setShlokaData(response.data.data);
            setCurrentVerse(nextVerse);
            setError('');
          } else if (response.data) {
            setShlokaData(response.data);
            setCurrentVerse(nextVerse);
            setError('');
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message || 
                            'Next verse not found.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviousVerse = async () => {
    if (currentChapter && currentVerse && currentVerse > 1) {
      const prevVerse = currentVerse - 1;
      setChapter(currentChapter.toString());
      setVerse(prevVerse.toString());
      
      // Trigger search
      setLoading(true);
      setError('');
      setShlokaData(null);

      try {
        const response = await shlokaService.searchShloka(currentChapter.toString(), prevVerse.toString());
        
        if (response.success) {
          if (response.data && response.data.data) {
            setShlokaData(response.data.data);
            setCurrentVerse(prevVerse);
            setError('');
          } else if (response.data) {
            setShlokaData(response.data);
            setCurrentVerse(prevVerse);
            setError('');
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message || 
                            'Previous verse not found.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="shloka-search-container">
      <div className="shloka-header">
        <h1>🔰 Search Gita Shloka</h1>
        <p>Explore the wisdom of Bhagavad-gītā</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="shloka-search-form">
        <div className="search-inputs">
          <div className="input-group">
            <label htmlFor="chapter">Chapter Number</label>
            <input
              type="number"
              id="chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              min="1"
              max="18"
              placeholder="1-18"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="verse">Verse Number</label>
            <input
              type="number"
              id="verse"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              min="1"
              placeholder="Verse number"
              required
            />
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : '🔍 Search Shloka'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="shloka-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Error</h3>
            <p>{error}</p>
            <p className="error-hint">
              Please check that the chapter (1-18) and verse number are correct.
              <br />
              <small style={{ marginTop: '10px', display: 'block', color: '#999' }}>
                💡 Check browser console (F12) for detailed error information.
              </small>
            </p>
          </div>
        </div>
      )}

      {/* Shloka Display */}
      {shlokaData && !error && (
        <div className="shloka-display">
          <div className="shloka-header-info">
            <h2>Bhagavad-gītā {shlokaData.verse_id}</h2>
            <p className="verse-reference">Chapter {shlokaData.chapter}, Verse {shlokaData.verse_number}</p>
          </div>

          {/* Sanskrit Text */}
          {shlokaData.sanskrit && shlokaData.sanskrit.length > 0 && (
            <div className="shloka-section sanskrit-section">
              <h3>📿 Sanskrit (Devanagari)</h3>
              <div className="sanskrit-text">
                {formatSanskrit(shlokaData.sanskrit)}
              </div>
            </div>
          )}

          {/* Transliteration */}
          {shlokaData.transliteration && shlokaData.transliteration.length > 0 && (
            <div className="shloka-section transliteration-section">
              <h3>🔤 Transliteration</h3>
              <div className="transliteration-text">
                {formatTransliteration(shlokaData.transliteration)}
              </div>
            </div>
          )}

          {/* Synonyms */}
          {shlokaData.synonyms && shlokaData.synonyms.length > 0 && (
            <div className="shloka-section synonyms-section">
              <h3>📖 Synonyms</h3>
              <div className="synonyms-text">
                {shlokaData.synonyms[0]}
              </div>
            </div>
          )}

          {/* Translation */}
          {shlokaData.translation && (
            <div className="shloka-section translation-section">
              <h3>🌍 Translation</h3>
              <div className="translation-text">
                {shlokaData.translation}
              </div>
            </div>
          )}

          {/* Purport */}
          {shlokaData.purport && (
            <div className="shloka-section purport-section">
              <h3>💡 Purport</h3>
              <div className="purport-text">
                {shlokaData.purport.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index}>{paragraph.trim()}</p>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="shloka-navigation">
            <button
              onClick={handlePreviousVerse}
              disabled={loading || !currentVerse || currentVerse <= 1}
              className="nav-btn prev-btn"
            >
              ← Previous Verse
            </button>
            <div className="verse-info">
              <span>Chapter {currentChapter}, Verse {currentVerse}</span>
            </div>
            <button
              onClick={handleNextVerse}
              disabled={loading || !currentVerse}
              className="nav-btn next-btn"
            >
              Next Verse →
            </button>
          </div>

          {/* Source Link */}
          {shlokaData.url && (
            <div className="shloka-source">
              <a href={shlokaData.url} target="_blank" rel="noopener noreferrer" className="source-link">
                View on Vedabase.io →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShlokaSearch;

