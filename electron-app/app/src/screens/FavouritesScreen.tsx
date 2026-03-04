/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Favourites Screen - List of starred words with flip-to-reveal and remove
 */

import React, {useState, useCallback, useEffect} from 'react';

import {useFavouritesStore} from '@xenolexia/shared/stores/favouritesStore';
import {useNavigate} from 'react-router-dom';

import {Card, Button} from '../components/ui';
import {useBack} from '../hooks/useBack';

import type {FavouriteWord} from '@xenolexia/shared/types';
import './FavouritesScreen.css';

export function FavouritesScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const goBack = useBack();
  const {favourites, isLoading, initialize, removeFavourite} = useFavouritesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading && favourites.length === 0) {
    return (
      <div className="favourites-screen">
        <div className="favourites-header">
          <h1>Favourite Words</h1>
        </div>
        <div className="favourites-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="favourites-screen">
      <div className="favourites-header">
        <button onClick={goBack} className="favourites-back-button">
          ← Back
        </button>
        <div>
          <h1>Favourite Words</h1>
          <p className="favourites-subtitle">
            {favourites.length} word{favourites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favourites.length === 0 ? (
        <div className="favourites-empty">
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h2>No Favourites Yet</h2>
            <p>While reading, hover over a word and tap the star to add it here.</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Library
            </Button>
          </div>
        </div>
      ) : (
        <div className="favourites-list">
          {favourites.map(word => (
            <FavouriteCard key={word.id} word={word} onRemove={() => removeFavourite(word.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FavouriteCardProps {
  word: FavouriteWord;
  onRemove: () => void;
}

function FavouriteCard({word, onRemove}: FavouriteCardProps): React.JSX.Element {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setFlipped(f => !f);
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Remove "${word.foreignWord}" from favourites?`)) {
        onRemove();
      }
    },
    [word.foreignWord, onRemove]
  );

  return (
    <div
      className={`favourites-card-container ${flipped ? 'favourites-card-flipped' : ''}`}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlip();
        }
      }}
    >
      <div className="favourites-card-inner">
        <div className="favourites-card-front">
          <Card variant="elevated" padding="md" rounded="lg" className="favourites-card">
            <div className="favourites-card-front-content">
              <span className="favourites-card-star">★</span>
              <h3 className="favourites-card-foreign">{word.foreignWord}</h3>
              <p className="favourites-card-hint">Tap to reveal meaning</p>
            </div>
          </Card>
        </div>
        <div className="favourites-card-back">
          <Card variant="outlined" padding="md" rounded="lg" className="favourites-card">
            <div className="favourites-card-back-content">
              <p className="favourites-card-original">{word.originalWord}</p>
              {word.pronunciation && (
                <p className="favourites-card-pronunciation">[{word.pronunciation}]</p>
              )}
              {word.alternatives && word.alternatives.length > 0 && (
                <p className="favourites-card-alternatives">Also: {word.alternatives.join(', ')}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="favourites-card-remove"
                onClick={handleRemove}
              >
                Remove
              </Button>
              <p className="favourites-card-hint-back">Tap to flip back</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
