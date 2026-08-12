import {
  ClipboardList,
  Combine,
  Contrast,
  Crop,
  FileArchive,
  FileImage,
  FileText,
  FlipHorizontal2,
  Gauge,
  IdCard,
  Images,
  Layers,
  PenLine,
  Printer,
  QrCode,
  Repeat,
  RotateCw,
  ScanLine,
  ScanText,
  Scissors,
  Send,
  Signature,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ToolIconKind } from "@/lib/tools";

const COLOR_CLASSES: Record<string, string> = {
  accent: "bg-accent-3 text-accent-11",
  info: "bg-info-3 text-info-11",
  success: "bg-success-3 text-success-11",
  warning: "bg-warning-3 text-warning-11",
  error: "bg-error-3 text-error-11",
  neutral: "bg-neutral-3 text-neutral-11",
};

const SIZE_CLASSES = {
  sm: "h-8 w-8 rounded-md",
  md: "h-12 w-12 rounded-lg",
  lg: "h-16 w-16 rounded-xl",
} as const;

const ICON_PX = { sm: 18, md: 26, lg: 32 } as const;

const ICONS: Record<ToolIconKind, LucideIcon> = {
  "photo-resize": Crop,
  "image-compress": Gauge,
  "video-compress": Video,
  "document-photo": IdCard,
  "photo-signature-joiner": PenLine,
  "print-sheet": Printer,
  "jpg-to-pdf": FileText,
  "quick-send": Send,
  "pdf-compress": FileArchive,
  "pdf-merge-split": Combine,
  "print-job-slip": ClipboardList,
  "image-format-convert": Repeat,
  "qr-generate": QrCode,
  "qr-scan": ScanLine,
  "heic-to-jpg": FileImage,
  "photo-grayscale": Contrast,
  "aadhaar-collage": Layers,
  "image-to-text": ScanText,
  "pdf-to-jpg": Images,
  "pdf-rotate": RotateCw,
  "signature-maker": Signature,
  "image-crop": Scissors,
  "image-rotate": FlipHorizontal2,
};

export function ToolIcon({
  kind,
  color,
  size = "md",
}: {
  kind: ToolIconKind;
  color: keyof typeof COLOR_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const Icon = ICONS[kind];
  return (
    <div
      className={`${COLOR_CLASSES[color]} ${SIZE_CLASSES[size]} inline-flex items-center justify-center`}
    >
      <Icon size={ICON_PX[size]} strokeWidth={1.75} aria-hidden />
    </div>
  );
}
