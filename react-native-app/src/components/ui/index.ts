/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * UI Components - Reusable themed components
 */

// Text
export {Text, Heading, Title, Body, Caption, Label} from './Text';
export type {TextProps} from './Text';

// Button
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
} from './Button';
export type {ButtonProps, ButtonVariant, ButtonSize} from './Button';

// Card
export {Card, PressableCard, CardHeader, CardContent, CardFooter} from './Card';
export type {CardProps, PressableCardProps, CardVariant} from './Card';

// Input
export {Input, SearchInput, PasswordInput} from './Input';
export type {InputProps, InputVariant, InputSize} from './Input';

// Theme Switcher
export {ThemeSwitcher, QuickThemeToggle} from './ThemeSwitcher';
export type {ThemeSwitcherProps} from './ThemeSwitcher';
