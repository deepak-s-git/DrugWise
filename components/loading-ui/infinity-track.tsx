import { cn } from "@/lib/utils";

const INFINITY_TRACK_BLOCKS = ["█", "▓", "▒"] as const;

type InfinityTrackProps = React.ComponentProps<"span"> & {
  blocks?: readonly string[];
  track?: string;
};

function InfinityTrack({
  className,
  blocks = INFINITY_TRACK_BLOCKS,
  track = "░",
  ...props
}: InfinityTrackProps) {
  const glyphs = INFINITY_TRACK_BLOCKS.map(
    (_, index) => blocks[index] ?? INFINITY_TRACK_BLOCKS[index],
  );
  
  // Create a 5x9 grid (vertical pill shape)
  const gridCells = Array.from({ length: 45 }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    let isTrack = false;
    
    // Top, middle, and bottom horizontal segments (smoothed corners, so col > 0 and col < 4)
    if (row === 0 || row === 4 || row === 8) {
       if (col > 0 && col < 4) isTrack = true;
    } 
    // Vertical left and right segments
    else {
       if (col === 0 || col === 4) isTrack = true;
    }

    return isTrack ? track : " ";
  });

  return (
    <>
      <style>{`
        @keyframes loading-ui-infinity-track {
          0% { transform: translate(1ch, 4ch); }
          6.25% { transform: translate(0, 3ch); }
          12.5% { transform: translate(0, 1ch); }
          18.75% { transform: translate(1ch, 0); }
          25% { transform: translate(3ch, 0); }
          31.25% { transform: translate(4ch, 1ch); }
          37.5% { transform: translate(4ch, 3ch); }
          43.75% { transform: translate(3ch, 4ch); }
          50% { transform: translate(1ch, 4ch); }
          56.25% { transform: translate(0, 5ch); }
          62.5% { transform: translate(0, 7ch); }
          68.75% { transform: translate(1ch, 8ch); }
          75% { transform: translate(3ch, 8ch); }
          81.25% { transform: translate(4ch, 7ch); }
          87.5% { transform: translate(4ch, 5ch); }
          93.75% { transform: translate(3ch, 4ch); }
          100% { transform: translate(1ch, 4ch); }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          "relative inline-flex h-[9ch] w-[5ch] overflow-hidden font-mono text-xl leading-none text-current select-none",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid grid-cols-5 grid-rows-9"
        >
          {gridCells.map((glyph, index) => (
            <span
              key={index}
              className="flex h-[1ch] w-[1ch] items-center justify-center text-primary/30"
            >
              {glyph}
            </span>
          ))}
        </span>
        {glyphs.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 flex h-[1ch] w-[1ch] items-center justify-center text-primary",
              ["z-30", "z-20", "z-10"][index],
            )}
            style={{
              animation: "loading-ui-infinity-track var(--duration, 2.5s) linear infinite",
              animationDelay: `calc(var(--delay, 0.1s) * ${index})`,
              backgroundColor: "transparent",
            }}
          >
            {glyph}
          </span>
        ))}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

export { InfinityTrack };
