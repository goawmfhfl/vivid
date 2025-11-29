"use client";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="mb-2" style={{ color: "#6B7A6F", fontSize: "2rem" }}>
        {title}
      </h1>
      <p style={{ color: "#4E4B46", opacity: 0.8, fontSize: "1rem" }}>
        {subtitle}
      </p>
    </div>
  );
}
