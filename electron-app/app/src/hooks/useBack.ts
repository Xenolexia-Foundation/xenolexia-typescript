/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * useBack - Reliable Back navigation with fallback when history is empty.
 * navigate(-1) in React Router is a no-op when there is no previous entry,
 * which can happen in Electron or when opening via menu/deep link.
 */

import {useCallback, useRef, useEffect} from 'react';

import {useNavigate, useLocation} from 'react-router-dom';

const FALLBACK_DELAY_MS = 120;

/**
 * Returns a function that goes to the previous screen, or to defaultPath (default '/')
 * if there is no history (e.g. after a short delay the location is unchanged).
 */
export function useBack(defaultPath: string = '/'): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  return useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    const pathBefore = location.pathname;
    navigate(-1);
    fallbackTimeoutRef.current = setTimeout(() => {
      fallbackTimeoutRef.current = null;
      if (pathRef.current === pathBefore) {
        navigate(defaultPath, {replace: true});
      }
    }, FALLBACK_DELAY_MS);
  }, [navigate, location.pathname, defaultPath]);
}
