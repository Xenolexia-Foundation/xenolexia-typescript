/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * React 18 createRoot from react-dom/client
 */
declare module 'react-dom/client' {
  import type {ReactNode} from 'react';
  export function createRoot(container: Element | DocumentFragment): {
    render(children: ReactNode): void;
    unmount(): void;
  };
}
