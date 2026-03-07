"use client";

import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col gap-2 min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>
      <div>leanly.ink</div>
      <div className="text-xs">
        {error ? (
          <span className="text-red-600">Error: {error}</span>
        ) : status ? (
          <span>{status}</span>
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </div>
  );
}
