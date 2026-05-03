import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5">
      <Image
        src="/logo.png"
        alt="InstantMariage"
        width={140}
        height={42}
        className="animate-pulse"
      />
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "#F06292", borderTopColor: "transparent" }}
      />
    </div>
  );
}
