export type BookStatus = "reading" | "finished" | "queued";

export type Book = {
  title: string;
  author: string;
  status: BookStatus;
  note?: string;
};

// PLACEHOLDER content — replace with the real reading list before launch.
export const books: Book[] = [
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    status: "reading",
    note: "Revisiting the classics while sharpening fundamentals for interviews.",
  },
  {
    title: "A Philosophy of Software Design",
    author: "John Ousterhout",
    status: "queued",
    note: "Short, opinionated take on managing complexity — recommended everywhere.",
  },
  {
    title: "Staff Engineer",
    author: "Will Larson",
    status: "finished",
    note: "Framing for the kind of senior role I want next.",
  },
];
