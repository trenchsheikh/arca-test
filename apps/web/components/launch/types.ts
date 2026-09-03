export type LaunchStep = 'profile' | 'revenue' | 'ico' | 'preview';
export type Category = 'Trading' | 'Prediction' | 'Arbitrage' | 'Research' | 'Other';
export type Chain = 'solana' | 'robinhood';

export interface TeamMember {
  name: string;
  role: string;
  profileUrl: string;
}

export interface DocumentMeta {
  type: 'strategy' | 'audit' | 'other';
  title: string;
  url: string;
  fileName: string;
}

export interface LaunchFormState {
  name: string;
  description: string;
  logoUrl: string;
  category: Category;
  website: string;
  docs: string;
  twitter: string;
  team: TeamMember[];
  chain: Chain;
  revenueWallet: string;
  launchFdv: number;
  threshold: number;
  cliffDays: number;
  durationDays: number;
  documents: DocumentMeta[];
  acknowledge: boolean;
  submittedAppId: string | null;
}

export const LAUNCH_CATEGORIES: Category[] = [
  'Trading',
  'Prediction',
  'Arbitrage',
  'Research',
  'Other',
];

export const LAUNCH_STEPS: {
  id: LaunchStep;
  label: string;
  description: string;
}[] = [
  {
    id: 'profile',
    label: 'Agent Profile',
    description: 'Name, category, logo, links, and team',
  },
  {
    id: 'revenue',
    label: 'Revenue Verification',
    description: 'Chain, wallet, and supporting documents',
  },
  {
    id: 'ico',
    label: 'ICO Configuration',
    description: 'FDV, threshold, vesting, and buyback split',
  },
  {
    id: 'preview',
    label: 'Preview & Submit',
    description: 'Review details and submit for approval',
  },
];

export const initialLaunchForm: LaunchFormState = {
  name: '',
  description: '',
  logoUrl: '',
  category: 'Trading',
  website: '',
  docs: '',
  twitter: '',
  team: [{ name: '', role: '', profileUrl: '' }],
  chain: 'solana',
  revenueWallet: '',
  launchFdv: 100000,
  threshold: 50,
  cliffDays: 30,
  durationDays: 365,
  documents: [{ type: 'strategy', title: '', url: '', fileName: '' }],
  acknowledge: false,
  submittedAppId: null,
};

export const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const LOGO_ACCEPT =
  'image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.png,.jpg,.jpeg,.webp,.svg,.gif';
export const LOGO_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
export const LOGO_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

export const DOC_ACCEPT =
  'image/png,image/jpeg,image/webp,image/svg+xml,image/gif,application/pdf,text/plain,text/markdown,text/csv,.png,.jpg,.jpeg,.webp,.svg,.gif,.pdf,.txt,.md,.doc,.docx,.csv';
export const DOC_EXTS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.pdf',
  '.txt',
  '.md',
  '.doc',
  '.docx',
  '.csv',
];
export const DOC_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function fileMatches(file: File, exts: string[], mimes: Set<string>) {
  const name = file.name.toLowerCase();
  if (exts.some((ext) => name.endsWith(ext))) return true;
  return Boolean(file.type && mimes.has(file.type));
}

export function isImageDataUrl(value: string) {
  return value.startsWith('data:image/');
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read that file'));
    };
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });
}
