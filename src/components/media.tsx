/* eslint-disable @next/next/no-img-element */
"use client";

import {
  getItemFallback,
  getItemImageUrl,
  getPokeballFallback,
  getPokemonImageUrl,
  getTypePalette,
} from "@/lib/assets";

export function PokemonThumb({
  slugOrName,
  alt,
  className = "size-20",
  src,
}: {
  slugOrName: string;
  alt: string;
  className?: string;
  src?: string | null;
}) {
  return (
    <img
      src={getPokemonImageUrl(slugOrName, src)}
      alt={alt}
      className={`${className} object-contain`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = getPokeballFallback();
      }}
    />
  );
}

export function ItemThumb({
  slugOrName,
  alt,
  className = "size-14",
  src,
}: {
  slugOrName: string;
  alt: string;
  className?: string;
  src?: string | null;
}) {
  return (
    <img
      src={getItemImageUrl(slugOrName, src)}
      alt={alt}
      className={`${className} object-contain`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = getItemFallback();
      }}
    />
  );
}

export function TypeBadge({
  type,
  label,
  className = "",
  iconUrl,
}: {
  type: string;
  label: string;
  className?: string;
  iconUrl?: string | null;
}) {
  const palette = getTypePalette(type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        borderColor: palette.border,
      }}
    >
      {iconUrl ? <img src={iconUrl} alt="" aria-hidden="true" className="size-4 object-contain" /> : null}
      <span>{label}</span>
    </span>
  );
}
