interface Note {
  name: string;
  description?: string;
}

interface FragranceNotesProps {
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
}

export function FragranceNotes({ topNotes, middleNotes, baseNotes }: FragranceNotesProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t-4 border-black dark:border-white">
      <div className="text-center mb-24">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Scent Profile
        </p>
        <h2 className="text-5xl md:text-6xl font-light tracking-tight">
          Fragrance Notes
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-16">
        {/* Top Notes */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-[0.3em] uppercase">
              Top Notes
            </p>
            <p className="text-xs tracking-wide">
              First Impression • 15-30 Minutes
            </p>
          </div>
          <div className="h-px bg-black dark:bg-white w-20" />
          <div className="space-y-4">
            {topNotes.map((note, index) => (
              <div key={index} className="border-l-2 border-black dark:border-white pl-4 py-2">
                <p className="font-medium">{note.name}</p>
                {note.description && (
                  <p className="text-sm mt-1 opacity-70">
                    {note.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Notes */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-[0.3em] uppercase">
              Middle Notes
            </p>
            <p className="text-xs tracking-wide">
              Heart • 2-4 Hours
            </p>
          </div>
          <div className="h-px bg-black dark:bg-white w-20" />
          <div className="space-y-4">
            {middleNotes.map((note, index) => (
              <div key={index} className="border-l-2 border-black dark:border-white pl-4 py-2">
                <p className="font-medium">{note.name}</p>
                {note.description && (
                  <p className="text-sm mt-1 opacity-70">
                    {note.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Base Notes */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-[0.3em] uppercase">
              Base Notes
            </p>
            <p className="text-xs tracking-wide">
              Lasting Impression • 4-6+ Hours
            </p>
          </div>
          <div className="h-px bg-black dark:bg-white w-20" />
          <div className="space-y-4">
            {baseNotes.map((note, index) => (
              <div key={index} className="border-l-2 border-black dark:border-white pl-4 py-2">
                <p className="font-medium">{note.name}</p>
                {note.description && (
                  <p className="text-sm mt-1 opacity-70">
                    {note.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
