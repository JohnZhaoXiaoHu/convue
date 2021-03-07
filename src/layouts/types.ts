/**
 * Plugin options.
 */
export interface CookieOptions {
  cookieKey?: string;
  expires?: number;
}
interface Options {
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/layouts'
   */
  dir: string;

  head?: {
    title?: string;
    meta?: Record<string, string>[];
    link?: Record<string, string>[];
    style?: string;
  };

  /**
   * Valid file extensions for page components.
   * @default ['vue', 'js', 'ts', 'jsx', 'tsx']
   */
  extensions: string[];

  /**
   * List of path globs to exclude when resolving pages.
   */
  exclude: string[];

  useCookie?: boolean | CookieOptions;
}

export type UserOptions = Partial<Options>;

export interface ResolvedOptions extends Options {
  /**
   * Resolves to the `root` value from Vite config.
   * @default config.root
   */
  root: string;
}
