import Image from "next/image";
import SignatureCanvas from "./core/signature/SignatureCanvas";

export default function Home() {
  return (
    <div className="bg-[#c6f1f7] min-h-[850px]">
      <SignatureCanvas/>
    </div>
  );
}
